import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getClientIP } from '@/lib/ip'
import { z } from 'zod'
import { createRateLimit, getSecurityHeaders } from '@/lib/security'

// Strong password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one digit')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one punctuation mark')

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordSchema,
  acceptedTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms of Service and Privacy Policy'
  }),
})

// Rate limiting: 3 registration attempts per hour per IP
const rateLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Too many registration attempts. Please try again in an hour.'
})

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimiter(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  try {
    const body = await req.json()
    
    // Validate input data
    const validatedData = registerSchema.parse(body)
    const { name, email, password, acceptedTerms } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Get client IP and user agent for terms acceptance record
    const clientIP = getClientIP(req)
    const userAgent = req.headers.get('user-agent')

    // Create user and record terms acceptance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          // role defaults to USER in schema
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      })

      // Record terms acceptance
      await tx.termsAcceptance.create({
        data: {
          userId: user.id,
          termsVersion: '1.0', // Current terms version
          privacyVersion: '1.0', // Current privacy policy version
          ipAddress: clientIP,
          userAgent: userAgent,
        }
      })

      return user
    })

    return NextResponse.json(
      { 
        message: 'Account created successfully!',
        user: result 
      },
      { 
        status: 201,
        headers: getSecurityHeaders()
      }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}