'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Check, 
  X,
  Flag,
  Trash2,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function AdminListingsPage() {
  const { data: session, status } = useSession()
  const [listings, setListings] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingListings: 0,
    activeListings: 0,
    flaggedListings: 0,
  })

  useEffect(() => {
    if (status === 'loading') return
    
    // More robust session validation to prevent redirect loops
    if (!session?.user) {
      console.log('No session found, redirecting to signin')
      redirect('/auth/signin')
      return
    }
    
    if (session.user.role !== 'ADMIN') {
      console.log('User is not admin, redirecting to home')
      redirect('/')
      return
    }
    
    // Only fetch data if we have a valid admin session
    fetchListings()
    fetchStats()
  }, [session, status])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter])

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('limit', '50')
      
      const response = await fetch(`/api/listings?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Listings API failed: ${response.status}`)
      }
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      toast.error('Failed to load listings')
      setListings([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error(`Stats API failed: ${response.status}`)
      }
      const data = await response.json()
      setStats({
        totalListings: data.totalListings,
        pendingListings: data.pendingListings,
        activeListings: data.activeListings,
        flaggedListings: data.flaggedListings,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Set default stats to prevent UI errors
      setStats({
        totalListings: 0,
        pendingListings: 0,
        activeListings: 0,
        flaggedListings: 0,
      })
    }
  }

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        const updatedListing = await response.json()
        setListings(listings.map((listing: any) => 
          listing.id === listingId ? updatedListing : listing
        ))
        toast.success(`Listing ${newStatus.toLowerCase()} successfully`)
        fetchStats() // Refresh stats
      } else {
        toast.error('Failed to update listing')
      }
    } catch (error) {
      console.error('Failed to update listing:', error)
      toast.error('Failed to update listing')
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setListings(listings.filter((listing: any) => listing.id !== listingId))
        toast.success('Listing deleted successfully')
        fetchStats()
      } else {
        toast.error('Failed to delete listing')
      }
    } catch (error) {
      console.error('Failed to delete listing:', error)
      toast.error('Failed to delete listing')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default'
      case 'PENDING': return 'secondary'
      case 'FLAGGED': return 'destructive'
      case 'ARCHIVED': return 'outline'
      default: return 'secondary'
    }
  }

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Listing Management</h1>
        <p className="text-gray-600">Review and moderate platform listings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingListings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeListings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flaggedListings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="FLAGGED">Flagged</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing: any) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                          {JSON.parse(listing.images || '[]')[0] && (
                            <img
                              src={JSON.parse(listing.images)[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{listing.title}</p>
                          <p className="text-sm text-gray-500">{listing.location}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={listing.user.image || ''} />
                          <AvatarFallback>
                            {listing.user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{listing.user.name || 'Anonymous'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{listing.category.name}</TableCell>
                    <TableCell>${listing.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(listing.status)}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {listing.status === 'ARCHIVED' && listing.rejectionReason ? (
                        <div className="text-sm text-red-600 max-w-[200px] truncate" title={listing.rejectionReason}>
                          {listing.rejectionReason}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/listing/${listing.id}`} className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View Listing
                            </Link>
                          </DropdownMenuItem>
                          {listing.status === 'PENDING' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 'ACTIVE')}>
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {listing.status !== 'ARCHIVED' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 'ARCHIVED')}>
                              <X className="w-4 h-4 mr-2" />
                              {listing.status === 'PENDING' ? 'Reject' : 'Archive'}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 'FLAGGED')}>
                            <Flag className="w-4 h-4 mr-2" />
                            Flag as Inappropriate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}