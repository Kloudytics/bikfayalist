import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateAdvertisementSchema = z.object({
  company: z.string().min(1).max(100).optional(),
  headline: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(500).optional(),
  ctaText: z.string().min(1).max(50).optional(),
  ctaUrl: z.string().url().optional(),
  backgroundImage: z.string().url().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  targetAudience: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET - Fetch single advertisement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const advertisement = await prisma.advertisement.findUnique({
      where: { id },
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

    if (!advertisement) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 })
    }

    return NextResponse.json({ advertisement })
  } catch (error) {
    console.error('Failed to fetch advertisement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update advertisement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAdvertisementSchema.parse(body)

    // Convert date strings to Date objects if provided
    const updateData: any = { ...validatedData }
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }

    const { id } = await params

    const advertisement = await prisma.advertisement.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ advertisement })
  } catch (error) {
    console.error('Failed to update advertisement:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete advertisement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.advertisement.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Advertisement deleted successfully' })
  } catch (error) {
    console.error('Failed to delete advertisement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}