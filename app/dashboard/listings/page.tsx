'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Eye, 
  TrendingUp,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { ListingStatusBadge } from '@/components/dashboard/ListingStatusBadge'
import { ListingActionsDropdown } from '@/components/dashboard/ListingActionsDropdown'
import { ListingFilters } from '@/components/dashboard/ListingFilters'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  location: string
  images: string
  views: number
  status: string
  createdAt: string
  category: {
    name: string
  }
  user: {
    name: string | null
    image: string | null
  }
}

export default function UserListingsPage() {
  const { data: session, status } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    fetchUserListings()
  }, [session, status])

  useEffect(() => {
    filterListings()
  }, [listings, searchQuery, statusFilter])

  const fetchUserListings = async () => {
    try {
      const response = await fetch(`/api/listings?userId=${session?.user.id}`)
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      toast.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  const filterListings = () => {
    let filtered = listings

    if (searchQuery) {
      filtered = filtered.filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((listing) => listing.status === statusFilter.toUpperCase())
    }

    setFilteredListings(filtered)
  }

  const handleDeleteListing = async (listingId: string, status: string) => {
    const actionText = status === 'ACTIVE' ? 'archive' : 'delete'
    const confirmText = status === 'ACTIVE' 
      ? 'Are you sure you want to archive this listing? It will be hidden from public view but preserved in your account.'
      : 'Are you sure you want to permanently delete this listing? This action cannot be undone.'
    
    if (!confirm(confirmText)) return

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.action === 'archived') {
          // Update the listing status to ARCHIVED in the local state
          setListings(listings.map((listing) => 
            listing.id === listingId ? { ...listing, status: 'ARCHIVED' } : listing
          ))
          toast.success('Listing archived successfully')
        } else if (data.action === 'deleted') {
          // Remove the listing from local state
          setListings(listings.filter((listing) => listing.id !== listingId))
          toast.success('Listing deleted successfully')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to ${actionText} listing`)
      }
    } catch (error) {
      toast.error(`Failed to ${actionText} listing`)
    }
  }

  const handleArchiveListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })

      if (response.ok) {
        const updatedListing = await response.json()
        setListings(listings.map((listing) => 
          listing.id === listingId ? updatedListing : listing
        ))
        toast.success('Listing archived successfully')
      } else {
        toast.error('Failed to archive listing')
      }
    } catch (error) {
      toast.error('Failed to archive listing')
    }
  }

  const handleReactivateListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to reactivate this listing? It will be set to PENDING status for admin approval.')) return

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'PENDING' }),
      })

      if (response.ok) {
        const updatedListing = await response.json()
        setListings(listings.map((listing) => 
          listing.id === listingId ? updatedListing : listing
        ))
        toast.success('Listing reactivated and sent for admin approval')
      } else {
        toast.error('Failed to reactivate listing')
      }
    } catch (error) {
      toast.error('Failed to reactivate listing')
    }
  }


  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600">Manage all your classified listings</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                Beta: {5 - listings.length} posts remaining ({listings.length}/5)
              </Badge>
            </div>
          </div>
          <Button asChild disabled={listings.length >= 5}>
            <Link href={listings.length >= 5 ? "#" : "/dashboard/create"}>
              <Plus className="w-4 h-4 mr-2" />
              {listings.length >= 5 ? "Limit Reached" : "Create Listing"}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <ListingFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredListings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredListings.length} {filteredListings.length === 1 ? 'Listing' : 'Listings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                          {JSON.parse(listing.images || '[]')[0] && (
                            <img
                              src={JSON.parse(listing.images)[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {listing.title}
                          </p>
                          <p className="text-sm text-gray-500">{listing.location}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{listing.category.name}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${listing.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <ListingStatusBadge 
                        status={listing.status} 
                        showDescription={true} 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-gray-400" />
                        {listing.views}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ListingActionsDropdown
                        listing={listing}
                        onDelete={handleDeleteListing}
                        onReactivate={handleReactivateListing}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No listings found' : 'No listings yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first listing to get started selling.'
              }
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <Button asChild>
                <Link href="/dashboard/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Listing
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}