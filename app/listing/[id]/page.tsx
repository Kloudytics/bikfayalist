'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Eye, Calendar, Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function ListingDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [hasRecordedView, setHasRecordedView] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${id}`)
      if (response.ok) {
        const data = await response.json()
        setListing(data)
        
        // Record view only once after successfully fetching listing
        if (!hasRecordedView) {
          recordView()
        }
      } else {
        toast.error('Listing not found')
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error)
      toast.error('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const recordView = async () => {
    try {
      const response = await fetch(`/api/listings/${id}/view`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update the listing's view count in state
        setListing((prev: any) => ({
          ...prev,
          views: data.views
        }))
        setHasRecordedView(true)
      }
    } catch (error) {
      console.error('Failed to record view:', error)
      // Still mark as recorded to prevent retries
      setHasRecordedView(true)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to send messages')
      return
    }
    
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setSendingMessage(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          listingId: listing.id,
        }),
      })

      if (response.ok) {
        toast.success('Message sent successfully!')
        setMessage('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
          <Button asChild>
            <Link href="/browse">Back to Browse</Link>
          </Button>
        </div>
      </div>
    )
  }

  const images = JSON.parse(listing.images || '[]')
  const mainImage = images[selectedImage] || images[0] || 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/browse">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative h-96 mb-4 rounded-lg overflow-hidden">
              <Image
                src={mainImage}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">{listing.category.name}</Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{listing.views} views</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                ${listing.price.toLocaleString()}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Posted {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{listing.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={listing.user.image || ''} />
                  <AvatarFallback>
                    {listing.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{listing.user.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-600">Member since {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
              
              {listing.user.bio && (
                <p className="text-sm text-gray-600">{listing.user.bio}</p>
              )}
              
              {listing.user.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{listing.user.location}</span>
                </div>
              )}

              <div className="space-y-2">
                {listing.user.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{listing.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Contact via message</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          {session && session.user.id !== listing.userId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Seller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <Textarea
                    placeholder="Hi! I'm interested in your listing..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                  <Button type="submit" className="w-full" disabled={sendingMessage}>
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {!session && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600 mb-4">
                  Sign in to contact the seller
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Safety Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Safety Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• Meet in a public place</p>
              <p>• Inspect items before purchasing</p>
              <p>• Don't share personal information</p>
              <p>• Use secure payment methods</p>
              <p>• Report suspicious activity</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}