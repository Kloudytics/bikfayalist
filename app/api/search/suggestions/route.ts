import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Search listings with fuzzy matching on title and description
    const suggestions = await prisma.listing.findMany({
      where: {
        AND: [
          { status: 'ACTIVE' },
          {
            OR: [
              {
                title: {
                  contains: query
                }
              },
              {
                description: {
                  contains: query
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        price: true,
        location: true,
        images: true,
        views: true,
        category: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { views: 'desc' }, // Popular items first
        { createdAt: 'desc' } // Then newest
      ],
      take: 6 // Limit to 6 suggestions for good UX
    })

    // Format suggestions for frontend
    const formattedSuggestions = suggestions.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      category: listing.category.name,
      thumbnail: JSON.parse(listing.images || '[]')[0] || null,
      views: listing.views
    }))

    return NextResponse.json({ suggestions: formattedSuggestions })

  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', suggestions: [] },
      { status: 500 }
    )
  }
}