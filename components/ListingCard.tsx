'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Eye, Calendar, Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    description: string
    price: number
    images: string
    location: string
    views: number
    createdAt: string
    category: {
      name: string
    }
    user: {
      name: string | null
      image: string | null
    }
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { data: session } = useSession()
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteId, setFavoriteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const images = JSON.parse(listing.images || '[]')
  const mainImage = images[0] || 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg'

  useEffect(() => {
    if (session?.user) {
      checkFavoriteStatus()
    }
  }, [session, listing.id])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/listing/${listing.id}`)
      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.isFavorited)
        setFavoriteId(data.favoriteId)
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error)
    }
  }

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to listing page
    e.stopPropagation()

    if (!session?.user) {
      toast.error('Please sign in to save favorites')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/listing/${listing.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setIsFavorited(false)
          setFavoriteId(null)
          toast.success('Removed from favorites')
        } else {
          toast.error('Failed to remove from favorites')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ listingId: listing.id })
        })

        if (response.ok) {
          const data = await response.json()
          setIsFavorited(true)
          setFavoriteId(data.favorite.favoriteId)
          toast.success('Added to favorites')
        } else {
          toast.error('Failed to add to favorites')
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">{listing.category.name}</Badge>
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm font-bold">
            ${listing.price.toLocaleString()}
          </div>
          {session?.user && (
            <button
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              className={`absolute bottom-2 right-2 p-2 rounded-full transition-all duration-200 ${
                isFavorited 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} 
              />
            </button>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {listing.description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{listing.views}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">
                  {listing.user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-600">{listing.user.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}