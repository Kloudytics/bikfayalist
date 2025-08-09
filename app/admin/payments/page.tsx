'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit3,
  Eye,
  Filter,
  Download,
  Users,
  TrendingUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string | null
  description: string | null
  customerNotes: string | null
  paymentReference: string | null
  adminNotes: string | null
  approvedBy: string | null
  approvedAt: string | null
  paidAt: string | null
  createdAt: string
  completedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
  addOns: {
    id: string
    addOnType: string
    price: number
    listing: {
      id: string
      title: string
    }
  }[]
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') redirect('/auth/signin')
    
    fetchPayments()
  }, [session, status])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      } else {
        toast.error('Failed to load payments')
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const filterPayments = useCallback(() => {
    let filtered = payments

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(payment => 
        payment.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.paymentReference?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
  }, [payments, statusFilter, searchQuery])

  useEffect(() => {
    filterPayments()
  }, [filterPayments])

  const handlePaymentUpdate = async () => {
    if (!selectedPayment || !newStatus) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes
        })
      })

      if (response.ok) {
        const updatedPayment = await response.json()
        setPayments(payments.map(p => p.id === selectedPayment.id ? updatedPayment.payment : p))
        setIsDialogOpen(false)
        setSelectedPayment(null)
        setAdminNotes('')
        setNewStatus('')
        toast.success('Payment updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update payment')
      }
    } catch (error) {
      console.error('Failed to update payment:', error)
      toast.error('Failed to update payment')
    } finally {
      setUpdating(false)
    }
  }

  const openUpdateDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setAdminNotes(payment.adminNotes || '')
    setNewStatus(payment.status)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { variant: 'secondary', icon: Clock, color: 'text-gray-600' },
      APPROVED_AWAITING_PAYMENT: { variant: 'outline', icon: AlertCircle, color: 'text-orange-600' },
      PAYMENT_RECEIVED: { variant: 'outline', icon: CheckCircle, color: 'text-blue-600' },
      COMPLETED: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      CANCELLED: { variant: 'secondary', icon: XCircle, color: 'text-red-600' },
      FAILED: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      REFUNDED: { variant: 'outline', icon: AlertCircle, color: 'text-purple-600' }
    }

    const { variant, icon: Icon, color } = config[status as keyof typeof config] || config.PENDING
    
    return (
      <Badge variant={variant as any} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${color}`} />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getStats = () => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0)
    const pending = payments.filter(p => p.status === 'PENDING').length
    const awaiting = payments.filter(p => p.status === 'APPROVED_AWAITING_PAYMENT').length
    const completed = payments.filter(p => p.status === 'COMPLETED').length
    
    return { total, pending, awaiting, completed }
  }

  if (status === 'loading' || loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  const stats = getStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Management</h1>
        <p className="text-gray-600">Manage and approve payment requests from users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">${stats.total.toFixed(2)}</p>
                <p className="text-gray-600">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.awaiting}</p>
                <p className="text-gray-600">Awaiting Payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by user name, email, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED_AWAITING_PAYMENT">Awaiting Payment</SelectItem>
                <SelectItem value="PAYMENT_RECEIVED">Payment Received</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.user.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-600">{payment.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${payment.amount.toFixed(2)}</p>
                        {payment.description && (
                          <p className="text-sm text-gray-600">{payment.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{payment.paymentMethod || 'Not specified'}</span>
                    </TableCell>
                    <TableCell>
                      {payment.paymentReference || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateDialog(payment)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Update Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Payment</DialogTitle>
            <DialogDescription>
              Update payment status and add admin notes for tracking.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Payment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">User</p>
                    <p className="font-medium">{selectedPayment.user.name} ({selectedPayment.user.email})</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-medium">${selectedPayment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Method</p>
                    <p className="font-medium capitalize">{selectedPayment.paymentMethod || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reference</p>
                    <p className="font-medium">{selectedPayment.paymentReference || 'None'}</p>
                  </div>
                </div>
                
                {selectedPayment.customerNotes && (
                  <div className="mt-3">
                    <p className="text-gray-600 text-sm">Customer Notes</p>
                    <p className="text-sm bg-white p-2 rounded border">{selectedPayment.customerNotes}</p>
                  </div>
                )}

                {selectedPayment.addOns.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-600 text-sm mb-1">Items</p>
                    {selectedPayment.addOns.map((addOn) => (
                      <div key={addOn.id} className="text-sm bg-white p-2 rounded border mb-1">
                        {addOn.addOnType.replace('_', ' ')} for &ldquo;{addOn.listing.title}&rdquo; (${addOn.price})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending Review</SelectItem>
                    <SelectItem value="APPROVED_AWAITING_PAYMENT">Approve & Await Payment</SelectItem>
                    <SelectItem value="PAYMENT_RECEIVED">Payment Received</SelectItem>
                    <SelectItem value="COMPLETED">Complete Payment</SelectItem>
                    <SelectItem value="CANCELLED">Cancel Payment</SelectItem>
                    <SelectItem value="FAILED">Mark as Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refund Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this payment..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentUpdate} disabled={updating || !newStatus}>
              {updating ? 'Updating...' : 'Update Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}