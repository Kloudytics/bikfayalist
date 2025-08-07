import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { createRateLimit, validateInput, getSecurityHeaders } from '@/lib/security'

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
    if (userId) {
      where.userId = userId
    } else if (status && isAdmin) {
      where.status = status
    } else if (isAdmin) {
      // Admin sees all listings if no specific status filter
      // No status filter needed
    } else {
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

    // Enhanced featured positioning with graceful fallback
    let listings, total
    
    try {
      // Try enhanced positioning first
      const featuredListings = await prisma.listing.findMany({
        where: {
          ...where,
          OR: [
            { 
              isFeatured: true,
              featuredUntil: { gt: new Date() }
            },
            { 
              featured: true
            }
          ]
        },
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
          { createdAt: 'desc' }
        ],
      })

      const regularListings = await prisma.listing.findMany({
        where: {
          ...where,
          featured: { not: true },
          isFeatured: { not: true }
        },
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
          { createdAt: 'desc' }
        ],
      })

      // Simple featured-first approach
      const allListings = [...featuredListings, ...regularListings]
      const paginatedListings = allListings.slice((page - 1) * limit, page * limit)
      
      listings = paginatedListings
      total = featuredListings.length + regularListings.length
      
    } catch (enhancedError) {
      console.log('Enhanced query failed, falling back to simple query:', enhancedError)
      
      // Fallback to simple query
      listings = await prisma.listing.findMany({
        where,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      })

      total = await prisma.listing.count({ where })
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
    // Check beta post limit (5 posts per account/household)
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

    // Check if category requires payment and plan is free (with fallback)
    if (category?.requiresPayment && pricingPlan && pricingPlan.price === 0) {
      return NextResponse.json(
        { 
          error: `${category.name} listings require a premium plan. Please select a paid plan to continue.`,
          categoryPricing: category.pricingTier || 'PREMIUM',
          basePrice: category.basePrice || 5
        }, 
        { status: 402, headers: getSecurityHeaders() }
      )
    }

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