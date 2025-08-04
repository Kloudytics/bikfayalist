import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ favoriteId: string }> }
) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { favoriteId } = await params

    // Check if favorite exists and belongs to user
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId }
    })

    if (!favorite) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }

    if (favorite.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: { id: favoriteId }
    })

    return NextResponse.json({ message: 'Removed from favorites' })
  } catch (error) {
    console.error('Failed to remove favorite:', error)
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
  }
}