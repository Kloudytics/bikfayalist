import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSecurityHeaders } from '@/lib/security'

/**
 * Monthly reset cron job
 * Should be called by a cron service like GitHub Actions or Netlify Functions
 * Resets all users' monthly free listing counts
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
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Find all users who need their limits reset
    const usersToReset = await prisma.user.findMany({
      where: {
        OR: [
          { monthlyResetAt: null },
          { monthlyResetAt: { lte: now } }
        ]
      },
      select: {
        id: true,
        email: true,
        freeListingsThisMonth: true,
        monthlyResetAt: true
      }
    })

    if (usersToReset.length === 0) {
      return NextResponse.json({
        message: 'No users need reset',
        processed: 0,
        timestamp: now.toISOString()
      }, { headers: getSecurityHeaders() })
    }

    // Reset all users' monthly limits
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: usersToReset.map(u => u.id)
        }
      },
      data: {
        freeListingsThisMonth: 0,
        monthlyResetAt: nextMonth
      }
    })

    // Log the reset for analytics
    console.log('Monthly reset completed:', {
      usersReset: result.count,
      timestamp: now.toISOString(),
      nextResetDate: nextMonth.toISOString()
    })

    return NextResponse.json({
      message: 'Monthly reset completed successfully',
      processed: result.count,
      nextResetDate: nextMonth.toISOString(),
      timestamp: now.toISOString()
    }, { headers: getSecurityHeaders() })

  } catch (error) {
    console.error('Monthly reset failed:', error)
    return NextResponse.json(
      { 
        error: 'Monthly reset failed',
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

/**
 * GET endpoint to check reset status
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    // Count users who need reset
    const usersNeedingReset = await prisma.user.count({
      where: {
        OR: [
          { monthlyResetAt: null },
          { monthlyResetAt: { lte: now } }
        ]
      }
    })

    // Get some stats
    const totalUsers = await prisma.user.count()
    const averageFreeListings = await prisma.user.aggregate({
      _avg: {
        freeListingsThisMonth: true
      }
    })

    return NextResponse.json({
      status: 'healthy',
      usersNeedingReset,
      totalUsers,
      averageFreeListingsUsed: averageFreeListings._avg.freeListingsThisMonth,
      nextScheduledReset: nextMonth.toISOString(),
      currentTime: now.toISOString()
    }, { headers: getSecurityHeaders() })

  } catch (error) {
    console.error('Failed to get reset status:', error)
    return NextResponse.json(
      { error: 'Failed to get reset status' },
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}