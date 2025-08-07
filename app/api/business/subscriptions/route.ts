import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const subscriptionSchema = z.object({
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  businessType: z.enum(['DEALER', 'AGENCY', 'INDIVIDUAL']).optional(),
  businessName: z.string().min(2).max(100).optional(),
})

// Business subscription plans
const BUSINESS_PLANS = {
  STARTER: {
    price: 30,
    duration: 30, // days
    maxListings: 10,
    features: ['Basic branding', 'Priority placement', 'Basic analytics']
  },
  PROFESSIONAL: {
    price: 50,
    duration: 30,
    maxListings: -1, // unlimited
    features: ['Full branding', 'Premium placement', 'Advanced analytics', 'Dedicated support']
  },
  ENTERPRISE: {
    price: 100,
    duration: 30,
    maxListings: -1,
    features: ['White-label options', 'API access', 'Custom features', 'Account manager']
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { plan, businessType, businessName } = subscriptionSchema.parse(body)
    
    const selectedPlan = BUSINESS_PLANS[plan]
    
    // Check if user already has an active subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionPlan: true,
        subscriptionEndsAt: true,
        isBusinessUser: true
      }
    })

    if (user?.subscriptionEndsAt && user.subscriptionEndsAt > new Date()) {
      return NextResponse.json(
        { 
          error: 'You already have an active subscription',
          currentPlan: user.subscriptionPlan,
          expiresAt: user.subscriptionEndsAt
        },
        { status: 409 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: selectedPlan.price,
        currency: 'USD',
        status: 'PENDING',
        paymentMethod: 'manual',
        description: `${plan} business subscription`,
        metadata: JSON.stringify({
          plan,
          businessType,
          businessName,
          features: selectedPlan.features,
          maxListings: selectedPlan.maxListings
        })
      }
    })

    // Calculate subscription end date
    const subscriptionEndsAt = new Date()
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + selectedPlan.duration)

    // Update user to business status (activate immediately for demo)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isBusinessUser: true,
        businessName: businessName || null,
        businessType: businessType || null,
        subscriptionPlan: plan,
        subscriptionEndsAt,
      }
    })

    return NextResponse.json({
      subscription: {
        plan,
        price: selectedPlan.price,
        maxListings: selectedPlan.maxListings,
        features: selectedPlan.features,
        expiresAt: subscriptionEndsAt,
        status: 'active'
      },
      payment: {
        id: payment.id,
        amount: selectedPlan.price,
        status: payment.status
      },
      message: 'Business subscription activated successfully!',
      demoMode: 'Subscription activated immediately for testing purposes.'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isBusinessUser: true,
        businessName: true,
        businessType: true,
        subscriptionPlan: true,
        subscriptionEndsAt: true,
        listings: {
          where: {
            status: { in: ['ACTIVE', 'PENDING'] }
          },
          select: { id: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentListingsCount = user.listings.length
    const currentPlan = user.subscriptionPlan ? BUSINESS_PLANS[user.subscriptionPlan as keyof typeof BUSINESS_PLANS] : null
    const isActive = user.subscriptionEndsAt && user.subscriptionEndsAt > new Date()

    return NextResponse.json({
      isBusinessUser: user.isBusinessUser,
      currentSubscription: user.subscriptionPlan ? {
        plan: user.subscriptionPlan,
        businessName: user.businessName,
        businessType: user.businessType,
        expiresAt: user.subscriptionEndsAt,
        isActive,
        maxListings: currentPlan?.maxListings || 0,
        features: currentPlan?.features || [],
        currentListings: currentListingsCount
      } : null,
      availablePlans: Object.entries(BUSINESS_PLANS).map(([planName, details]) => ({
        name: planName,
        price: details.price,
        maxListings: details.maxListings === -1 ? 'Unlimited' : details.maxListings,
        features: details.features,
        duration: details.duration
      }))
    })

  } catch (error) {
    console.error('Failed to fetch subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}