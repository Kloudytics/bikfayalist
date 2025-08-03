'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Eye, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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
  const images = JSON.parse(listing.images || '[]')
  const mainImage = images[0] || 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg'

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