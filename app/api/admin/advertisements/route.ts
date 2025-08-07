import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const advertisementSchema = z.object({
  company: z.string().min(1).max(100),
  headline: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  ctaText: z.string().min(1).max(50),
  ctaUrl: z.string().url(),
  backgroundImage: z.string().url().optional(),
  backgroundColor: z.string().default('from-blue-600 to-purple-600'),
  textColor: z.string().default('text-white'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  targetAudience: z.string().optional(),
  isActive: z.boolean().default(true)
})

// GET - Fetch all advertisements (Admin only)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const advertisements = await prisma.advertisement.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ advertisements })
  } catch (error) {
    console.error('Failed to fetch advertisements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new advertisement (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = advertisementSchema.parse(body)

    // Convert date strings to Date objects if provided
    const processedData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      createdByUserId: session.user.id
    }

    const advertisement = await prisma.advertisement.create({
      data: processedData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ advertisement }, { status: 201 })
  } catch (error) {
    console.error('Failed to create advertisement:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}