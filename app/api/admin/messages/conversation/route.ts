import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')
    const fromUserId = searchParams.get('fromUserId')

    if (!listingId || !fromUserId) {
      return NextResponse.json({ error: 'Missing listingId or fromUserId' }, { status: 400 })
    }

    // Get all messages for this conversation
    const messages = await prisma.message.findMany({
      where: {
        listingId,
        fromUserId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Failed to fetch conversation:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}