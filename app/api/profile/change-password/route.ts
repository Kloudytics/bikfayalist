import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    // Validate input data
    const validatedData = passwordSchema.parse(body)

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true }
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found or no password set' }, { status: 400 })
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(validatedData.currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await hash(validatedData.newPassword, 12)

    // Update user's password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      },
    })

    return NextResponse.json({ 
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Failed to change password:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}