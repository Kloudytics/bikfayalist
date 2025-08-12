import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { analytics } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        user: {
          select: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      amount, 
      description, 
      paymentMethod, 
      customerNotes, 
      paymentReference,
      addOnIds = [] 
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(amount),
        description,
        paymentMethod: paymentMethod || null,
        customerNotes: customerNotes || null,
        paymentReference: paymentReference || null,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Link add-ons to payment if provided
    if (addOnIds.length > 0) {
      await prisma.listingAddOn.updateMany({
        where: {
          id: { in: addOnIds }
        },
        data: {
          paymentId: payment.id
        }
      })
    }

    // Track payment creation for analytics
    await analytics.trackServer('payment_completed', session.user.id, {
      payment_id: payment.id,
      payment_amount: parseFloat(amount),
      payment_method: paymentMethod || 'not_specified',
      payment_description: description,
      has_reference: !!paymentReference,
      has_customer_notes: !!customerNotes,
      addon_count: addOnIds.length,
      user_type: session.user.role === 'ADMIN' ? 'admin' : 'user',
      // Lebanese market specific payment methods
      is_local_payment: ['cash', 'whish', 'omt'].includes(paymentMethod?.toLowerCase() || ''),
      market: 'lebanon',
      platform: 'bikfayalist'
    })

    return NextResponse.json({ payment, message: 'Payment request created successfully' })
  } catch (error) {
    console.error('Failed to create payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}