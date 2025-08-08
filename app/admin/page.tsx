'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Users, FileText, Eye, AlertTriangle, Check, X } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
  })
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [rejectDialog, setRejectDialog] = useState<{open: boolean, listingId: string | null}>({
    open: false,
    listingId: null
  })
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    console.log('Admin page useEffect:', {
      status,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email
    })
    
    if (status === 'loading') {
      console.log('Admin: Still loading session...')
      return
    }
    
    // More robust session validation
    if (!session?.user) {
      console.log('Admin: No session found, redirecting to signin')
      redirect('/auth/signin')
      return
    }
    
    if (session.user.role !== 'ADMIN') {
      console.log('Admin: User is not admin, redirecting to home. Role:', session.user.role)
      redirect('/')
      return
    }
    
    console.log('Admin: Valid admin session, fetching data...')
    // Only fetch data if we have a valid admin session
    fetchStats()
    fetchUsers()
    fetchListings()
  }, [session, status])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error(`Stats API failed: ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Set default stats to prevent UI errors
      setStats({
        totalUsers: 0,
        totalListings: 0,
        activeListings: 0,
        pendingListings: 0,
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error(`Users API failed: ${response.status}`)
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    }
  }

  const fetchListings = async () => {
    try {
      // For admin dashboard, show ALL PENDING listings for approval
      const params = new URLSearchParams({ status: 'PENDING', limit: '100' })
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/listings?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Listings API failed: ${response.status}`)
      }
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      setListings([])
    }
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleListingAction = async (listingId: string, action: 'ACTIVE' | 'ARCHIVED', reason?: string) => {
    try {
      const body: any = { status: action }
      if (action === 'ARCHIVED' && reason) {
        body.rejectionReason = reason
      }

      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        // Remove the listing from the pending list
        setListings(listings.filter((listing: any) => listing.id !== listingId))
        toast.success(`Listing ${action === 'ACTIVE' ? 'approved' : 'rejected'} successfully`)
        // Refresh stats
        fetchStats()
      } else {
        toast.error('Failed to update listing')
      }
    } catch (error) {
      console.error('Failed to update listing:', error)
      toast.error('Failed to update listing')
    }
  }

  const openRejectDialog = (listingId: string) => {
    setRejectDialog({ open: true, listingId })
    setRejectionReason('')
  }

  const handleRejectWithReason = () => {
    if (rejectDialog.listingId) {
      handleListingAction(rejectDialog.listingId, 'ARCHIVED', rejectionReason)
      setRejectDialog({ open: false, listingId: null })
      setRejectionReason('')
    }
  }

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, listings, and platform settings</p>
        
        <div className="flex gap-4 mt-4">
          <Button asChild>
            <Link href="/admin/listings">Manage Listings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/messages">Manage Messages</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/advertisements">Manage Advertisements</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
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
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingListings}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || 'Unnamed'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user._count.listings}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard?userId=${user.id}`}>
                          View Listings
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Listings (Require Approval)</span>
              <Badge variant="secondary">{listings.length} pending</Badge>
            </CardTitle>
            <div className="flex gap-4 items-center mt-4">
              <Input
                placeholder="Search listings by title or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <Button asChild variant="outline">
                <Link href="/admin/listings?status=ARCHIVED">View Rejected</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.slice(0, 5).map((listing: any) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <p className="font-medium truncate max-w-[200px]">{listing.title}</p>
                      <p className="text-sm text-gray-600">{listing.category.name}</p>
                    </TableCell>
                    <TableCell>${listing.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleListingAction(listing.id, 'ACTIVE')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openRejectDialog(listing.id)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/listing/${listing.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, listingId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting this listing. This will help the user understand why their listing was not approved.
            </p>
            <Textarea
              placeholder="e.g., Images are unclear, inappropriate content, duplicate listing, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, listingId: null })}>
              Cancel
            </Button>
            <Button 
              onClick={handleRejectWithReason}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}