import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const listingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  location: z.string().min(1),
  categoryId: z.string(),
  images: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const location = searchParams.get('location')
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  try {
    const where: any = {}

    // Check if this is an admin request
    const session = await auth()
    const isAdmin = session?.user?.role === 'ADMIN'

    // If userId is provided, show all listings for that user (any status)
    // If status is specified (admin only), filter by that status
    // Otherwise, only show ACTIVE listings for public browsing
    if (userId) {
      where.userId = userId
    } else if (status && isAdmin) {
      where.status = status
    } else if (isAdmin) {
      // Admin sees all listings if no specific status filter
      // No status filter needed
    } else {
      where.status = 'ACTIVE'
    }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (location) {
      where.location = { contains: location }
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.listing.count({ where })

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = listingSchema.parse(body)

    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        images: JSON.stringify(validatedData.images || []),
        userId: session.user.id,
      },
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

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}