'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Building, Crown, TrendingUp, Users, Calendar, DollarSign, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface BusinessSubscription {
  plan: string
  businessName?: string
  businessType?: string
  expiresAt: string
  isActive: boolean
  maxListings: number | string
  features: string[]
  currentListings: number
}

interface BusinessPlan {
  name: string
  price: number
  maxListings: number | string
  features: string[]
  duration: number
}

export default function BusinessDashboardPage() {
  const { data: session, status } = useSession()
  const [subscription, setSubscription] = useState<BusinessSubscription | null>(null)
  const [availablePlans, setAvailablePlans] = useState<BusinessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    fetchSubscriptionData()
  }, [session, status])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/business/subscriptions')
      const data = await response.json()
      
      if (response.ok) {
        setSubscription(data.currentSubscription)
        setAvailablePlans(data.availablePlans)
        
        // Pre-fill form if user has existing business info
        if (data.currentSubscription) {
          setBusinessName(data.currentSubscription.businessName || '')
          setBusinessType(data.currentSubscription.businessType || '')
        }
      } else {
        toast.error('Failed to load subscription data')
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!selectedPlan || !businessName.trim()) {
      toast.error('Please select a plan and enter your business name')
      return
    }

    setSubscribing(true)
    try {
      const response = await fetch('/api/business/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          businessName: businessName.trim(),
          businessType: businessType || 'INDIVIDUAL'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Business subscription activated successfully!')
        fetchSubscriptionData() // Refresh data
        setSelectedPlan('')
      } else {
        toast.error(data.error || 'Failed to create subscription')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to create subscription')
    } finally {
      setSubscribing(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          <Building className="h-8 w-8 mr-3 text-blue-600" />
          Business Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your business subscription and access premium features for dealers and agencies
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription ? (
        <div className="mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-800 flex items-center">
                    <Crown className="h-5 w-5 mr-2" />
                    Active Business Subscription
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    {subscription.businessName} • {subscription.businessType}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {subscription.plan}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {subscription.currentListings}
                  </div>
                  <div className="text-sm text-green-600">Active Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {typeof subscription.maxListings === 'number' ? subscription.maxListings : subscription.maxListings}
                  </div>
                  <div className="text-sm text-green-600">Max Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {subscription.features.length}
                  </div>
                  <div className="text-sm text-green-600">Features</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {Math.ceil((new Date(subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-green-600">Days Left</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-green-800">Included Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {subscription.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-green-700 border-green-300">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-green-600">
                Subscription expires on {new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    Upgrade to Business
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Get unlimited listings, priority placement, and professional features designed for dealers and agencies.
                  </p>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Professional branding and storefront</li>
                    <li>• Priority customer support</li>
                    <li>• Advanced analytics and insights</li>
                    <li>• Bulk listing management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Business Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {subscription ? 'Upgrade Your Plan' : 'Choose Your Business Plan'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {availablePlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.name
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.name === 'PROFESSIONAL' ? 'border-yellow-400' : ''}`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              {plan.name === 'PROFESSIONAL' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/ month</span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Max Listings:</span>
                    <span className="font-medium">{plan.maxListings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Duration:</span>
                    <span className="font-medium">{plan.duration} days</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Zap className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription Form */}
        {!subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Tell us about your business to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEALER">Car Dealer</SelectItem>
                    <SelectItem value="AGENCY">Real Estate Agency</SelectItem>
                    <SelectItem value="INDIVIDUAL">Individual Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubscribe}
                disabled={subscribing || !selectedPlan || !businessName.trim()}
                className="w-full"
                size="lg"
              >
                {subscribing ? 'Processing...' : `Subscribe to ${selectedPlan} Plan`}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center">
              <Users className="h-6 w-6 mb-2" />
              <span>Bulk Upload</span>
              <span className="text-xs text-gray-500">Upload multiple listings</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Analytics</span>
              <span className="text-xs text-gray-500">View performance metrics</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center">
              <Calendar className="h-6 w-6 mb-2" />
              <span>Schedule Posts</span>
              <span className="text-xs text-gray-500">Auto-publish listings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}