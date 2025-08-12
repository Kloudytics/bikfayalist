import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { createRateLimit, validateInput, getSecurityHeaders } from '@/lib/security'
import { checkListingPermissions, applyPostCreationRules } from '@/lib/business-rules'
import { analytics } from '@/lib/analytics'

const listingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive().max(999999999).optional(), // Nullable for "Price on request"
  hidePrice: z.boolean().optional().default(false),
  location: z.string().min(1).max(100),
  categoryId: z.string().cuid(),
  pricingPlanId: z.string().cuid().optional(),
  images: z.array(z.string().url()).optional(),
})

// Rate limiting: 10 listings per hour per user
const createListingRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many listings created. Please try again in an hour.'
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const location = searchParams.get('location')
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')
  const featured = searchParams.get('featured') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  try {
    const where: any = {}

    // Check if this is an admin request
    const session = await auth()
    const isAdmin = session?.user?.role === 'ADMIN'

    // If userId is provided, show all listings for that user (any status)
    // If status is specified (admin only), filter by that status
    // Otherwise, only show ACTIVE listings for public browsing
    // Note: Featured filtering is handled separately to combine with status
    if (userId) {
      where.userId = userId
    } else if (status && isAdmin) {
      where.status = status
    } else if (isAdmin) {
      // Admin sees all listings if no specific status filter
      // No status filter needed
    } else if (!featured) {
      // Only set status filter if not filtering by featured (which handles status separately)
      where.status = 'ACTIVE'
    }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (location) {
      where.location = { contains: location }
    }

    // Featured-only filtering (must also be ACTIVE for public viewing)
    if (featured) {
      const featuredConditions = [
        { 
          isFeatured: true,
          featuredUntil: { gt: new Date() }
        },
        { 
          featured: true
        }
      ]
      
      // Combine featured conditions with status requirement for non-admin users
      if (isAdmin) {
        where.OR = featuredConditions
      } else {
        where.AND = [
          { status: 'ACTIVE' },
          { OR: featuredConditions }
        ]
      }
    }

    // Clean up expired featured listings first
    await prisma.listing.updateMany({
      where: {
        isFeatured: true,
        featuredUntil: { lte: new Date() }
      },
      data: {
        isFeatured: false,
        featuredUntil: null
      }
    })

    // Query listings with proper featured logic
    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: true,
        pricingPlan: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: [
        // Featured listings first (both old and new system)
        { isFeatured: 'desc' },
        { featured: 'desc' },
        { featuredPosition: 'asc' }, // Lower position = higher priority
        { bumpedAt: 'desc' }, // Recently bumped listings
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.listing.count({ where })

    // Track search/browse activity for analytics
    if (session?.user) {
      await analytics.trackServer('search_performed', session.user.id, {
        search_query: search || undefined,
        category: category || undefined,
        location: location || undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        featured_only: featured,
        page,
        results_count: listings.length,
        total_results: total,
        user_type: session.user.role === 'ADMIN' ? 'admin' : 'user',
        // Lebanese market tracking
        is_lebanese_location_search: location ? 
          ['bikfaya', 'beirut', 'tripoli', 'baalbek', 'sidon', 'tyre', 'jounieh', 'zahle']
            .some(city => location.toLowerCase().includes(city)) : false,
        market: 'lebanon',
        platform: 'bikfayalist'
      })
    }

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Apply rate limiting for listing creation
  const rateLimitResponse = await createListingRateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401, headers: getSecurityHeaders() }
    )
  }

  try {
    // Check beta post limit (5 posts per account/household) - keeping during beta
    const userListingCount = await prisma.listing.count({
      where: {
        userId: session.user.id,
        // Count all listings except deleted ones
        status: {
          in: ['ACTIVE', 'PENDING', 'ARCHIVED', 'FLAGGED']
        }
      }
    })

    const BETA_POST_LIMIT = 5
    if (userListingCount >= BETA_POST_LIMIT) {
      return NextResponse.json(
        { 
          error: `Beta limit reached: You can only create ${BETA_POST_LIMIT} posts during our beta period. This helps us maintain quality and prevent spam while we test the platform.`,
          limit: BETA_POST_LIMIT,
          current: userListingCount
        }, 
        { status: 429, headers: getSecurityHeaders() }
      )
    }

    const body = await req.json()
    
    // Sanitize input data
    const sanitizedData = {
      ...body,
      title: validateInput(body.title, 100),
      description: validateInput(body.description, 2000),
      location: validateInput(body.location, 100)
    }
    
    const validatedData = listingSchema.parse(sanitizedData)

    // Apply business rules engine to check permissions
    const businessRuleResult = await checkListingPermissions(
      session.user.id,
      validatedData.categoryId,
      validatedData.pricingPlanId
    )

    if (!businessRuleResult.allowed) {
      return NextResponse.json({
        error: businessRuleResult.message,
        requiresPayment: businessRuleResult.requiresPayment,
        suggestedPlan: businessRuleResult.suggestedPlan,
        limits: businessRuleResult.limits
      }, { 
        status: businessRuleResult.requiresPayment ? 402 : 429, 
        headers: getSecurityHeaders() 
      })
    }

    // Get category info to check pricing requirements
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    })

    // Determine pricing plan (default to BASIC if not specified)
    let pricingPlan = null
    if (validatedData.pricingPlanId) {
      pricingPlan = await prisma.pricingPlan.findUnique({
        where: { id: validatedData.pricingPlanId }
      })
    } else {
      // Default to BASIC plan
      pricingPlan = await prisma.pricingPlan.findUnique({
        where: { name: 'BASIC' }
      })
    }

    if (!pricingPlan) {
      return NextResponse.json(
        { error: 'Invalid pricing plan selected' }, 
        { status: 400, headers: getSecurityHeaders() }
      )
    }

    // Category payment check is now handled by business rules engine above

    // Calculate expiration date based on pricing plan
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + pricingPlan.duration)

    // Set featured status and expiration
    const isFeatured = pricingPlan.isFeatured
    const featuredUntil = isFeatured ? expiresAt : null

    // Create listing with fallback for missing fields
    const listingData: any = {
      title: validatedData.title,
      description: validatedData.description,
      price: validatedData.price || 0,
      location: validatedData.location,
      categoryId: validatedData.categoryId,
      images: JSON.stringify(validatedData.images || []),
      userId: session.user.id,
    }

    // Add advanced fields only if they exist in schema
    if (pricingPlan) {
      listingData.pricingPlanId = pricingPlan.id
      listingData.isFeatured = isFeatured
      listingData.featuredUntil = featuredUntil
      listingData.expiresAt = expiresAt
      listingData.hidePrice = validatedData.hidePrice && pricingPlan.canHidePrice
    }

    const listing = await prisma.listing.create({
      data: listingData,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    // Apply post-creation business rules (increment counters, trigger hooks, etc.)
    await applyPostCreationRules(
      session.user.id,
      listing.id,
      validatedData.pricingPlanId
    )

    // Track listing creation for analytics
    await analytics.trackServer('listing_created', session.user.id, {
      listing_id: listing.id,
      category_id: validatedData.categoryId,
      pricing_plan: pricingPlan.name,
      price: validatedData.price || 0,
      location: validatedData.location,
      is_featured: isFeatured,
      has_images: (validatedData.images?.length || 0) > 0,
      image_count: validatedData.images?.length || 0,
      is_business_listing: session.user.role === 'ADMIN' || (session.user as any).isBusinessUser,
      user_type: session.user.role === 'ADMIN' ? 'admin' : 'user',
      // Lebanese market specific
      is_lebanese_location: ['bikfaya', 'beirut', 'tripoli', 'baalbek', 'sidon', 'tyre', 'jounieh', 'zahle']
        .some(city => validatedData.location.toLowerCase().includes(city)),
      market: 'lebanon',
      platform: 'bikfayalist'
    })

    return NextResponse.json(listing, { 
      status: 201,
      headers: getSecurityHeaders()
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}