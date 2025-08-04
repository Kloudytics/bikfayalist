import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    // Check if listing exists and get owner info
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, userId: true }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Don't increment view count if the viewer is the listing owner
    if (session?.user?.id === listing.userId) {
      return NextResponse.json({ 
        message: 'View not recorded (owner)',
        views: null 
      })
    }

    // Increment view count
    const updatedListing = await prisma.listing.update({
      where: { id: id },
      data: { views: { increment: 1 } },
      select: { views: true }
    })

    return NextResponse.json({ 
      message: 'View recorded',
      views: updatedListing.views 
    })
  } catch (error) {
    console.error('Failed to increment view count:', error)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }
}