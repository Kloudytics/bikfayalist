'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Star, Zap, Calendar, TrendingUp, DollarSign, Eye } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'

interface FeaturedListing {
  id: string
  title: string
  isFeatured: boolean
  featuredUntil: string | null
  bumpedAt: string | null
  views: number
  contactClicks: number
  createdAt: string
}

interface AddOn {
  id: string
  type: string
  isActive: boolean
  expiresAt: string | null
  price: number
  purchasedAt: string
  paymentStatus: string
}

interface ListingAddOns {
  addOns: AddOn[]
  availableAddOns: { type: string; price: number; description: string }[]
}

export default function FeaturedListingsManager({ listingId }: { listingId?: string }) {
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([])
  const [addOns, setAddOns] = useState<{ [key: string]: ListingAddOns }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedListings()
  }, [])

  const fetchFeaturedListings = async () => {
    try {
      // Get user's featured listings
      const listingsResponse = await fetch('/api/listings?userId=me&featured=true')
      if (listingsResponse.ok) {
        const data = await listingsResponse.json()
        setFeaturedListings(data.listings || [])
        
        // Fetch add-ons for each listing
        for (const listing of data.listings) {
          const addOnsResponse = await fetch(`/api/listings/${listing.id}/add-ons`)
          if (addOnsResponse.ok) {
            const addOnsData = await addOnsResponse.json()
            setAddOns(prev => ({ ...prev, [listing.id]: addOnsData }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch featured listings:', error)
      toast.error('Failed to load featured listings')
    } finally {
      setLoading(false)
    }
  }

  const purchaseAddOn = async (listingId: string, addOnType: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/add-ons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addOnType,
          quantity: 1
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        fetchFeaturedListings() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to purchase add-on')
      }
    } catch (error) {
      console.error('Failed to purchase add-on:', error)
      toast.error('Failed to purchase add-on')
    }
  }

  const getRemainingTime = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const remaining = new Date(expiresAt).getTime() - Date.now()
    if (remaining <= 0) return 'Expired'
    return formatDistanceToNow(new Date(expiresAt))
  }

  const getTimeProgress = (createdAt: string, expiresAt: string | null) => {
    if (!expiresAt) return 0
    const start = new Date(createdAt).getTime()
    const end = new Date(expiresAt).getTime()
    const now = Date.now()
    const total = end - start
    const elapsed = now - start
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Featured Listings Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredListings.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No featured listings found</p>
              <p className="text-sm text-gray-400">
                Upgrade your listings to featured status for maximum visibility
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {featuredListings.map((listing) => {
                const listingAddOns = addOns[listing.id]
                const remainingTime = getRemainingTime(listing.featuredUntil)
                const progress = getTimeProgress(listing.createdAt, listing.featuredUntil)
                
                return (
                  <div key={listing.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          {listing.isFeatured && (
                            <Badge className="bg-yellow-500 text-black">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {listing.bumpedAt && (
                            <Badge className="bg-green-500">
                              <Zap className="w-3 h-3 mr-1" />
                              Recently Bumped
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Eye className="w-4 h-4 mr-1" />
                          {listing.views} views
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {listing.contactClicks} contacts
                        </div>
                      </div>
                    </div>

                    {/* Featured Status */}
                    {listing.isFeatured && listing.featuredUntil && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Featured until:</span>
                          <span className="text-sm text-gray-600">
                            {format(new Date(listing.featuredUntil), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                          {remainingTime === 'Expired' ? (
                            <span className="text-red-500">Expired</span>
                          ) : (
                            <span>{remainingTime} remaining</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Available Add-ons */}
                    {listingAddOns && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="font-medium mb-3 flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            Available Boosts
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {listingAddOns.availableAddOns.map((addOn) => {
                              const hasActive = listingAddOns.addOns.some(
                                a => a.type === addOn.type && a.isActive
                              )
                              
                              return (
                                <div key={addOn.type} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <div className="font-medium text-sm">
                                        {addOn.type.replace('_', ' ').toLowerCase()
                                          .replace(/\b\w/g, l => l.toUpperCase())}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {addOn.description}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold text-sm">
                                        ${addOn.price}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    variant={hasActive ? "outline" : "default"}
                                    disabled={hasActive}
                                    onClick={() => purchaseAddOn(listing.id, addOn.type)}
                                  >
                                    {hasActive ? 'Active' : 'Purchase'}
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}