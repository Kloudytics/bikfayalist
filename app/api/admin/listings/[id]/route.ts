import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { status, rejectionReason } = body

    if (!['ACTIVE', 'ARCHIVED', 'FLAGGED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: any = { status }
    
    // Add rejection reason if status is ARCHIVED
    if (status === 'ARCHIVED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Failed to update listing status:', error)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.listing.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete listing:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}