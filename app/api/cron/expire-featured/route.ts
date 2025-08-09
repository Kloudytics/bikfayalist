import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSecurityHeaders } from '@/lib/security'

/**
 * Featured listings expiration cron job
 * Should be called hourly to clean up expired featured listings
 * Also handles add-on expiration
 */
export async function POST(req: NextRequest) {
  try {
    // Verify this is called by an authorized source (in production)
    const authHeader = req.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getSecurityHeaders() }
      )
    }

    const now = new Date()

    // Expire featured listings
    const expiredFeatured = await prisma.listing.updateMany({
      where: {
        isFeatured: true,
        featuredUntil: { lte: now }
      },
      data: {
        isFeatured: false,
        featuredUntil: null,
        featuredPosition: null
      }
    })

    // Expire listing add-ons
    const expiredAddOns = await prisma.listingAddOn.updateMany({
      where: {
        isActive: true,
        expiresAt: { lte: now }
      },
      data: {
        isActive: false
      }
    })

    // Clean up very old bumped listings (7 days)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const cleanBumped = await prisma.listing.updateMany({
      where: {
        bumpedAt: { lte: weekAgo }
      },
      data: {
        bumpedAt: null
      }
    })

    // Log the cleanup for analytics
    console.log('Featured listings cleanup completed:', {
      expiredFeatured: expiredFeatured.count,
      expiredAddOns: expiredAddOns.count,
      cleanedBumped: cleanBumped.count,
      timestamp: now.toISOString()
    })

    return NextResponse.json({
      message: 'Featured listings cleanup completed successfully',
      expiredFeatured: expiredFeatured.count,
      expiredAddOns: expiredAddOns.count,
      cleanedBumped: cleanBumped.count,
      timestamp: now.toISOString()
    }, { headers: getSecurityHeaders() })

  } catch (error) {
    console.error('Featured listings cleanup failed:', error)
    return NextResponse.json(
      { 
        error: 'Featured listings cleanup failed',
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

/**
 * GET endpoint to check expiration status
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date()
    
    // Count expired items
    const expiredFeaturedCount = await prisma.listing.count({
      where: {
        isFeatured: true,
        featuredUntil: { lte: now }
      }
    })

    const expiredAddOnsCount = await prisma.listingAddOn.count({
      where: {
        isActive: true,
        expiresAt: { lte: now }
      }
    })

    const activeFeaturedCount = await prisma.listing.count({
      where: {
        isFeatured: true,
        featuredUntil: { gt: now }
      }
    })

    const recentlyBumpedCount = await prisma.listing.count({
      where: {
        bumpedAt: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      }
    })

    return NextResponse.json({
      status: 'healthy',
      expiredFeaturedCount,
      expiredAddOnsCount,
      activeFeaturedCount,
      recentlyBumpedCount,
      currentTime: now.toISOString(),
      needsCleanup: expiredFeaturedCount > 0 || expiredAddOnsCount > 0
    }, { headers: getSecurityHeaders() })

  } catch (error) {
    console.error('Failed to get expiration status:', error)
    return NextResponse.json(
      { error: 'Failed to get expiration status' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}