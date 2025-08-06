import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            phone: true,
            location: true,
          }
        }
      }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json(listing)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: id }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    
    const updatedListing = await prisma.listing.update({
      where: { id: id },
      data: {
        ...body,
        images: JSON.stringify(body.images || []),
      },
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

    return NextResponse.json(updatedListing)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: id }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine action based on listing status
    if (listing.status === 'ACTIVE') {
      // Archive ACTIVE listings instead of deleting for data integrity and performance
      const updatedListing = await prisma.listing.update({
        where: { id },
        data: { status: 'ARCHIVED' },
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
      
      return NextResponse.json({ 
        message: 'Active listing archived successfully',
        action: 'archived',
        listing: updatedListing
      })
    } else {
      // Hard delete for PENDING, ARCHIVED, and FLAGGED listings
      await prisma.listing.delete({
        where: { id }
      })

      return NextResponse.json({ 
        message: 'Listing deleted successfully',
        action: 'deleted'
      })
    }
  } catch (error) {
    console.error('Failed to delete/archive listing:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}