import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, password: true, passwordResetAt: true }
    })

    if (!user) {
      // For security, we return success even if user doesn't exist
      // This prevents email enumeration attacks
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      })
    }

    if (!user.password) {
      // User might have signed up with OAuth and no password set
      return NextResponse.json(
        { error: 'This account uses social login. Please sign in with your social account.' },
        { status: 400 }
      )
    }

    // Rate limiting: Check if user has requested password reset recently
    if (user.passwordResetAt) {
      const timeSinceLastReset = Date.now() - user.passwordResetAt.getTime()
      const RATE_LIMIT = 5 * 60 * 1000 // 5 minutes
      
      if (timeSinceLastReset < RATE_LIMIT) {
        return NextResponse.json(
          { error: 'Please wait before requesting another password reset' },
          { status: 429 }
        )
      }
    }

    // Create password reset token
    const token = await createPasswordResetToken(email)

    // Update user's passwordResetAt timestamp
    await prisma.user.update({
      where: { email },
      data: { passwordResetAt: new Date() }
    })

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, token, user.name || undefined)

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
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