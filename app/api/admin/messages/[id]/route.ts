import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createRateLimit, getSecurityHeaders, getClientIP } from '@/lib/security'
import { auditActions } from '@/lib/audit'

// Admin rate limiting for message management
const adminMessageRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Higher limit for message management
  message: 'Too many message management actions. Please wait before trying again.'
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = await adminMessageRateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { id } = await params
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401, headers: getSecurityHeaders() }
    )
  }

  try {
    await prisma.message.delete({
      where: { id }
    })

    // Log admin action for audit trail
    const clientIP = getClientIP(req)
    const userAgent = req.headers.get('user-agent') || undefined
    await auditActions.messageDelete(id, session.user.id, clientIP, userAgent)

    return NextResponse.json({ success: true }, { headers: getSecurityHeaders() })
  } catch (error) {
    console.error('Failed to delete message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' }, 
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = await adminMessageRateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { id } = await params
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401, headers: getSecurityHeaders() }
    )
  }

  try {
    const body = await req.json()
    const { flagged } = body

    // Validate flagged is boolean
    if (typeof flagged !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid flagged value' }, 
        { status: 400, headers: getSecurityHeaders() }
      )
    }

    const message = await prisma.message.update({
      where: { id },
      data: { flagged },
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
      }
    })

    // Log admin action for audit trail
    const clientIP = getClientIP(req)
    const userAgent = req.headers.get('user-agent') || undefined
    await auditActions.messageFlag(id, session.user.id, flagged, clientIP, userAgent)

    return NextResponse.json(message, { headers: getSecurityHeaders() })
  } catch (error) {
    console.error('Failed to update message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' }, 
      { status: 500, headers: getSecurityHeaders() }
    )
  }
}