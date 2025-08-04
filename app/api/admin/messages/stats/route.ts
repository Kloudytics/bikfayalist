import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [totalMessages, flaggedMessages] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { flagged: true } }),
    ])

    // Count unique conversations (unique combinations of fromUser and listing)
    const conversations = await prisma.message.groupBy({
      by: ['fromUserId', 'listingId'],
      _count: {
        id: true
      }
    })

    const activeConversations = conversations.length

    return NextResponse.json({
      totalMessages,
      activeConversations,
      flaggedMessages,
    })
  } catch (error) {
    console.error('Failed to fetch message stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}