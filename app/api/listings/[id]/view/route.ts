import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getClientIP } from '@/lib/ip'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    const clientIP = getClientIP(req)
    const userAgent = req.headers.get('user-agent') || undefined
    
    // Check if listing exists and get owner info
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, userId: true, views: true }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Don't increment view count if the viewer is the listing owner
    if (session?.user?.id === listing.userId) {
      return NextResponse.json({ 
        message: 'View not recorded (owner)',
        views: listing.views 
      })
    }

    // Check if this IP has already viewed this listing
    const existingView = await prisma.productView.findUnique({
      where: {
        listingId_ipAddress: {
          listingId: id,
          ipAddress: clientIP
        }
      }
    })

    if (existingView) {
      // IP has already viewed this listing, don't increment
      return NextResponse.json({ 
        message: 'View not recorded (already viewed)',
        views: listing.views,
        viewedAt: existingView.viewedAt
      })
    }

    // Record the view and increment counter
    await prisma.$transaction(async (tx) => {
      // Create the ProductView record
      await tx.productView.create({
        data: {
          listingId: id,
          ipAddress: clientIP,
          userAgent: userAgent,
          userId: session?.user?.id || null
        }
      })

      // Increment the view count
      await tx.listing.update({
        where: { id: id },
        data: { views: { increment: 1 } }
      })
    })

    // Get updated view count
    const updatedListing = await prisma.listing.findUnique({
      where: { id },
      select: { views: true }
    })

    return NextResponse.json({ 
      message: 'View recorded',
      views: updatedListing?.views,
      newView: true
    })
  } catch (error) {
    console.error('Failed to record view:', error)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }
}