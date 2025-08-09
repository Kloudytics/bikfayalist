import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = [
      'PENDING',
      'APPROVED_AWAITING_PAYMENT', 
      'PAYMENT_RECEIVED',
      'COMPLETED',
      'CANCELLED',
      'FAILED',
      'REFUNDED'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get the current payment
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        addOns: {
          include: {
            listing: true
          }
        }
      }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      adminNotes: adminNotes || null
    }

    // Set timestamps based on status
    if (status === 'APPROVED_AWAITING_PAYMENT' && !existingPayment.approvedAt) {
      updateData.approvedBy = session.user.id
      updateData.approvedAt = new Date()
    }

    if (status === 'PAYMENT_RECEIVED' && !existingPayment.paidAt) {
      updateData.paidAt = new Date()
    }

    if (status === 'COMPLETED' && !existingPayment.completedAt) {
      updateData.completedAt = new Date()
      
      // Activate featured listings and add-ons
      for (const addOn of existingPayment.addOns) {
        if (addOn.addOnType === 'FEATURED_WEEK') {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 7) // Featured for 1 week
          
          await prisma.listing.update({
            where: { id: addOn.listingId },
            data: {
              isFeatured: true,
              featuredUntil: expiresAt
            }
          })
        }
        
        if (addOn.addOnType === 'BUMP_TO_TOP') {
          await prisma.listing.update({
            where: { id: addOn.listingId },
            data: {
              bumpedAt: new Date()
            }
          })
        }
        
        // Activate the add-on
        await prisma.listingAddOn.update({
          where: { id: addOn.id },
          data: {
            isActive: true
          }
        })
      }
    }

    // Update the payment
    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        addOns: {
          include: {
            listing: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      payment, 
      message: `Payment status updated to ${status.replace('_', ' ').toLowerCase()}` 
    })
  } catch (error) {
    console.error('Failed to update payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if payment exists and can be deleted
    const payment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed payments' },
        { status: 400 }
      )
    }

    // Delete the payment (this will also cascade to related add-ons due to foreign key)
    await prisma.payment.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Failed to delete payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}