'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Phone,
  Smartphone
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { PaymentInstructions } from '@/components/payments/PaymentInstructions'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string | null
  description: string | null
  customerNotes: string | null
  paymentReference: string | null
  createdAt: string
  approvedAt: string | null
  paidAt: string | null
  completedAt: string | null
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

export default function UserPaymentsPage() {
  const { data: session, status } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    fetchPayments()
  }, [session, status])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
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

  const getPaymentMethodIcon = (method: string | null) => {
    switch (method?.toLowerCase()) {
      case 'whish':
        return <Smartphone className="w-4 h-4 text-blue-600" />
      case 'omt':
        return <Phone className="w-4 h-4 text-orange-600" />
      case 'cash':
        return <DollarSign className="w-4 h-4 text-green-600" />
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />
    }
  }

  const getTotalStats = () => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0)
    const pending = payments.filter(p => p.status === 'PENDING' || p.status === 'APPROVED_AWAITING_PAYMENT').length
    const completed = payments.filter(p => p.status === 'COMPLETED').length
    
    return { total, pending, completed }
  }

  if (status === 'loading' || loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  const stats = getTotalStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payments & Billing</h1>
        <p className="text-gray-600">Track your payment history and manage billing for featured listings and add-ons</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">${stats.total.toFixed(2)}</p>
                <p className="text-gray-600">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-gray-600">Pending Payments</p>
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

      {/* Payment Instructions */}
      <PaymentInstructions />

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
              <p className="text-gray-600 mb-4">When you promote listings or purchase add-ons, your payments will appear here.</p>
              <Button asChild>
                <a href="/dashboard/listings">View My Listings</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </h3>
                        {getStatusBadge(payment.status)}
                        {payment.paymentMethod && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span className="capitalize">{payment.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{payment.description}</p>
                      
                      {payment.addOns.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                          {payment.addOns.map((addOn) => (
                            <div key={addOn.id} className="text-sm text-gray-600 ml-2">
                              • {addOn.addOnType.replace('_', ' ')} for &ldquo;{addOn.listing.title}&rdquo; (${addOn.price})
                            </div>
                          ))}
                        </div>
                      )}

                      {payment.paymentReference && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reference:</span> {payment.paymentReference}
                          </p>
                        </div>
                      )}

                      {payment.customerNotes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {payment.customerNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-500 ml-4">
                      <p>Created {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}</p>
                      {payment.approvedAt && (
                        <p>Approved {formatDistanceToNow(new Date(payment.approvedAt), { addSuffix: true })}</p>
                      )}
                      {payment.completedAt && (
                        <p>Completed {formatDistanceToNow(new Date(payment.completedAt), { addSuffix: true })}</p>
                      )}
                    </div>
                  </div>

                  {payment.status === 'APPROVED_AWAITING_PAYMENT' && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">
                            Payment Approved - Action Required
                          </p>
                          <p className="text-sm text-orange-700">
                            Please send payment using one of the methods above. Your listing will be activated once payment is received.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {payment.status === 'PAYMENT_RECEIVED' && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                        <p className="text-sm text-blue-800">
                          Payment received and being processed. Your listing will be activated shortly.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}