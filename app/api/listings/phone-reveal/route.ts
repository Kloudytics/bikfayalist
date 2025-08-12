import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { analytics } from '@/lib/analytics'

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { listingId, sellerId, revealedAt } = await req.json()

    // For now, we'll just log to console for audit purposes
    // In the future, this could be stored in a database table for analytics
    console.log('PHONE_REVEAL_LOG:', {
      revealerId: session.user.id,
      reveilerEmail: session.user.email,
      listingId,
      sellerId,
      revealedAt,
      timestamp: new Date().toISOString()
    })

    // Track phone reveal for analytics - high intent action for Lebanese marketplace
    await analytics.trackServer('phone_number_revealed', session.user.id, {
      listing_id: listingId,
      seller_id: sellerId,
      revealer_id: session.user.id,
      contact_type: 'phone',
      high_intent_action: true,
      user_type: session.user.role === 'ADMIN' ? 'admin' : 'user',
      timestamp: new Date().toISOString(),
      // Lebanese market insights
      market: 'lebanon',
      platform: 'bikfayalist',
      engagement_level: 'high'
    })

    // Update listing contact clicks counter
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        contactClicks: { increment: 1 }
      }
    })

    // Future implementation could include:
    // - Rate limiting (X reveals per day per user)
    // - Database logging for analytics
    // - Notification to seller about contact interest
    // - Integration with messaging system

    return NextResponse.json({ success: true, logged: true })
  } catch (error) {
    console.error('Failed to log phone reveal:', error)
    return NextResponse.json({ error: 'Failed to log reveal' }, { status: 500 })
  }
}