import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const addOnSchema = z.object({
  addOnType: z.enum(['FEATURED_WEEK', 'BUMP_TO_TOP', 'EXTRA_PHOTOS', 'VIDEO_SUPPORT', 'URGENT_TAG', 'MAP_LOCATION']),
  quantity: z.number().int().positive().max(10).optional().default(1),
})

// Add-on pricing configuration
const ADD_ON_PRICES = {
  FEATURED_WEEK: 5,
  BUMP_TO_TOP: 1,
  EXTRA_PHOTOS: 0.5,
  VIDEO_SUPPORT: 3,
  URGENT_TAG: 2,
  MAP_LOCATION: 1,
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  const { id: listingId } = await params

  try {
    // Verify listing ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: true,
        pricingPlan: true,
        addOns: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        }
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only purchase add-ons for your own listings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { addOnType, quantity } = addOnSchema.parse(body)

    // Check for conflicting add-ons
    const existingAddOn = listing.addOns.find(addon => addon.addOnType === addOnType)
    
    if (existingAddOn) {
      if (addOnType === 'FEATURED_WEEK') {
        return NextResponse.json(
          { error: 'This listing is already featured. Wait for it to expire before purchasing again.' },
          { status: 409 }
        )
      }
      
      if (addOnType === 'URGENT_TAG') {
        return NextResponse.json(
          { error: 'This listing already has an urgent tag.' },
          { status: 409 }
        )
      }
    }

    // Calculate pricing
    const unitPrice = ADD_ON_PRICES[addOnType]
    const totalPrice = unitPrice * quantity

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: totalPrice,
        currency: 'USD',
        status: 'PENDING',
        paymentMethod: 'manual', // For now, manual approval
        description: `${addOnType} add-on for listing: ${listing.title}`,
        metadata: JSON.stringify({
          listingId,
          addOnType,
          quantity,
          unitPrice
        })
      }
    })

    // Calculate expiration for time-based add-ons
    let expiresAt = null
    if (addOnType === 'FEATURED_WEEK') {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 1 week
    }

    // Create add-on records
    const addOnPromises = Array.from({ length: quantity }, () => 
      prisma.listingAddOn.create({
        data: {
          listingId,
          addOnType,
          price: unitPrice,
          expiresAt,
          paymentId: payment.id,
          isActive: false, // Activate after payment confirmation
        }
      })
    )

    const addOns = await Promise.all(addOnPromises)

    // Apply add-on effects immediately for demo/testing
    // In production, this would happen after payment confirmation
    await applyAddOnEffects(listingId, addOnType, quantity)

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: totalPrice,
        status: payment.status,
        description: payment.description
      },
      addOns: addOns.map(addon => ({
        id: addon.id,
        type: addon.addOnType,
        price: addon.price,
        expiresAt: addon.expiresAt,
        isActive: addon.isActive
      })),
      message: 'Add-on purchased successfully! Effects will be applied once payment is confirmed.',
      demoMode: 'Effects applied immediately for testing purposes.'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Add-on purchase error:', error)
    return NextResponse.json({ error: 'Failed to purchase add-on' }, { status: 500 })
  }
}

// Apply add-on effects to the listing
async function applyAddOnEffects(listingId: string, addOnType: string, quantity: number) {
  const updateData: any = {}

  switch (addOnType) {
    case 'FEATURED_WEEK':
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + 7)
      updateData.isFeatured = true
      updateData.featuredUntil = featuredUntil
      break
      
    case 'BUMP_TO_TOP':
      updateData.bumpedAt = new Date()
      break
      
    case 'EXTRA_PHOTOS':
      // This would increase the photo limit in the UI
      break
      
    case 'VIDEO_SUPPORT':
      // This would enable video upload in the UI
      break
      
    case 'URGENT_TAG':
      // This would show an urgent badge in the listing display
      break
      
    case 'MAP_LOCATION':
      // This would enable map location features
      break
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.listing.update({
      where: { id: listingId },
      data: updateData
    })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  const { id: listingId } = await params

  try {
    const addOns = await prisma.listingAddOn.findMany({
      where: {
        listingId,
        listing: {
          userId: session.user.id
        }
      },
      include: {
        payment: {
          select: {
            status: true,
            completedAt: true
          }
        }
      },
      orderBy: {
        purchasedAt: 'desc'
      }
    })

    return NextResponse.json({
      addOns: addOns.map(addon => ({
        id: addon.id,
        type: addon.addOnType,
        price: addon.price,
        isActive: addon.isActive,
        expiresAt: addon.expiresAt,
        purchasedAt: addon.purchasedAt,
        paymentStatus: addon.payment?.status || 'UNKNOWN'
      })),
      availableAddOns: Object.entries(ADD_ON_PRICES).map(([type, price]) => ({
        type,
        price,
        description: getAddOnDescription(type)
      }))
    })

  } catch (error) {
    console.error('Failed to fetch add-ons:', error)
    return NextResponse.json({ error: 'Failed to fetch add-ons' }, { status: 500 })
  }
}

function getAddOnDescription(addOnType: string): string {
  const descriptions: Record<string, string> = {
    FEATURED_WEEK: 'Featured placement at top of listings for 1 week',
    BUMP_TO_TOP: 'Instantly move your listing to the top of search results',
    EXTRA_PHOTOS: 'Add additional photo slots beyond your plan limit',
    VIDEO_SUPPORT: 'Enable YouTube video embedding in your listing',
    URGENT_TAG: 'Display an "URGENT" badge on your listing',
    MAP_LOCATION: 'Show precise map location with pin'
  }
  return descriptions[addOnType] || 'Enhanced listing feature'
}