import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createRateLimit, validateInput, getSecurityHeaders, getClientIP } from '@/lib/security'
import { auditActions } from '@/lib/audit'

// Stricter rate limiting for admin actions
const adminRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50,
  message: 'Too many admin actions. Please wait before trying again.'
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = await adminRateLimit(req)
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
    const { status, rejectionReason } = body

    if (!['ACTIVE', 'ARCHIVED', 'FLAGGED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' }, 
        { status: 400, headers: getSecurityHeaders() }
      )
    }

    const updateData: any = { status }
    
    // Add rejection reason if status is ARCHIVED
    if (status === 'ARCHIVED' && rejectionReason) {
      updateData.rejectionReason = validateInput(rejectionReason, 500)
    }

    const listing = await prisma.listing.update({
      where: { id },
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

    // Log admin action for audit trail
    const clientIP = getClientIP(req)
    const userAgent = req.headers.get('user-agent') || undefined
    
    if (status === 'ACTIVE') {
      await auditActions.listingApprove(id, session.user.id, clientIP, userAgent)
    } else if (status === 'ARCHIVED') {
      await auditActions.listingReject(id, session.user.id, rejectionReason || 'No reason provided', clientIP, userAgent)
    } else if (status === 'FLAGGED') {
      await auditActions.listingFlag(id, session.user.id, clientIP, userAgent)
    }

    return NextResponse.json(listing, { headers: getSecurityHeaders() })
  } catch (error) {
    console.error('Failed to update listing status:', error)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.listing.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete listing:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}