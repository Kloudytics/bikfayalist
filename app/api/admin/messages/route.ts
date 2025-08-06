import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createRateLimit, getSecurityHeaders, validateInput } from '@/lib/security'

// Rate limiting for admin message queries
const adminMessagesRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  maxRequests: 200, // Higher limit for read operations
  message: 'Too many message queries. Please wait before trying again.'
})

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await adminMessagesRateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401, headers: getSecurityHeaders() }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50'))) // Cap at 100

    const where: any = {}

    if (search) {
      // Sanitize search input
      const sanitizedSearch = validateInput(search, 100)
      where.OR = [
        { content: { contains: sanitizedSearch } },
        { fromUser: { name: { contains: sanitizedSearch } } },
        { listing: { title: { contains: sanitizedSearch } } },
      ]
    }

    const messages = await prisma.message.findMany({
      where,
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
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.message.count({ where })

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, { headers: getSecurityHeaders() })
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' }, 
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}