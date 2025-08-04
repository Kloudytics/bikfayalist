import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const messageSchema = z.object({
  content: z.string().min(1).max(1000),
  listingId: z.string(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const listingId = searchParams.get('listingId')

  try {
    if (listingId) {
      // Get messages for a specific listing
      const messages = await prisma.message.findMany({
        where: {
          listingId,
          OR: [
            { fromUserId: session.user.id },
            { listing: { userId: session.user.id } }
          ]
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              userId: true,
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })

      return NextResponse.json(messages)
    } else {
      // Get all conversations for the user
      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { fromUserId: session.user.id },
            { listing: { userId: session.user.id } }
          ]
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              userId: true,
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
        orderBy: { createdAt: 'desc' }
      })

      // Group messages by listing and get the latest message for each conversation
      const conversationMap = new Map()
      
      conversations.forEach(message => {
        const key = message.listingId
        if (!conversationMap.has(key)) {
          const otherUser = message.fromUserId === session.user.id 
            ? message.listing.user 
            : message.fromUser
          
          conversationMap.set(key, {
            id: key,
            listing: message.listing,
            otherUser,
            lastMessage: message.content,
            lastMessageTime: message.createdAt,
            unreadCount: 0 // TODO: Implement unread count logic
          })
        }
      })

      return NextResponse.json(Array.from(conversationMap.values()))
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = messageSchema.parse(body)

    // Verify the listing exists and user is not messaging themselves
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
      select: { userId: true }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content: validatedData.content,
        fromUserId: session.user.id,
        listingId: validatedData.listingId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to create message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}