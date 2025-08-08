import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPasswordResetToken, deletePasswordResetToken } from '@/lib/tokens'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token, password } = resetPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    if (!user.password) {
      // User might have signed up with OAuth and no password set
      return NextResponse.json(
        { error: 'This account uses social login. Please sign in with your social account.' },
        { status: 400 }
      )
    }

    // Verify the reset token
    const isTokenValid = await verifyPasswordResetToken(email, token)

    if (!isTokenValid) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12)

    // Update user's password
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        passwordResetAt: null // Clear the reset timestamp
      }
    })

    // Delete the used token
    await deletePasswordResetToken(email, token)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}