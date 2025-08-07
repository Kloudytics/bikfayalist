import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Fetch active advertisements for display
export async function GET() {
  try {
    const now = new Date()
    
    const advertisements = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10 // Limit to 10 active ads
    })

    return NextResponse.json({ advertisements })
  } catch (error) {
    console.error('Failed to fetch active advertisements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Track advertisement interactions (clicks/impressions)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adId, type } = body // type: 'click' or 'impression'

    if (!adId || !['click', 'impression'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const updateField = type === 'click' ? 'clickCount' : 'impressionCount'
    
    await prisma.advertisement.update({
      where: { id: adId },
      data: {
        [updateField]: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to track advertisement interaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}