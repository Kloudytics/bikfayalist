'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, MessageCircle, MapPin, Camera, Video, ArrowUp, Clock } from 'lucide-react'

interface PricingPlan {
  id: string
  name: string
  price: number
  duration: number
  maxPhotos: number
  canHidePrice: boolean
  isFeatured: boolean
  hasMapLocation: boolean
  hasPrioritySupport: boolean
  description: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  pricingTier: 'STANDARD' | 'PREMIUM' | 'BUSINESS'
  requiresPayment: boolean
  basePrice?: number
}

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, categoriesRes] = await Promise.all([
          fetch('/api/pricing-plans'),
          fetch('/api/categories')
        ])
        
        if (plansRes.ok) {
          const plansData = await plansRes.json()
          setPricingPlans(plansData)
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Failed to fetch pricing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const premiumCategories = categories.filter(cat => cat.requiresPayment)
  const freeCategories = categories.filter(cat => !cat.requiresPayment)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple. Transparent. Local.
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Flexible pricing to help individuals and businesses showcase their products and services in Bikfaya and nearby areas.
        </p>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {pricingPlans.map((plan, index) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.isFeatured ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'}`}
          >
            {plan.isFeatured && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600 ml-2">
                  {plan.price === 0 ? 'Free' : `/ ${plan.duration} days`}
                </span>
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Up to {plan.maxPhotos} photos</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{plan.duration} days validity</span>
                </li>
                {plan.canHidePrice && (
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>"Price on request" option</span>
                  </li>
                )}
                {plan.hasMapLocation && (
                  <li className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-500 mr-3" />
                    <span>Map location pin</span>
                  </li>
                )}
                {plan.isFeatured && (
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Featured placement</span>
                  </li>
                )}
                {plan.hasPrioritySupport && (
                  <li className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Priority support</span>
                  </li>
                )}
              </ul>
            </CardContent>

            <CardFooter>
              <Button 
                className={`w-full ${plan.isFeatured ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={plan.isFeatured ? 'default' : 'outline'}
              >
                {plan.price === 0 ? 'Start Free' : 'Choose Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Category-Specific Pricing */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Category-Based Pricing
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Free Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="h-6 w-6 text-green-500 mr-2" />
                Free Categories
              </CardTitle>
              <CardDescription>
                3 free listings per month, then $1 per extra listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {freeCategories.map((category) => (
                  <Badge key={category.id} variant="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Premium Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                Premium Categories
              </CardTitle>
              <CardDescription>
                High-value items require paid plans for quality control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {premiumCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <Badge variant="outline">
                      {category.name}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      from ${category.basePrice}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add-ons */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Optional Add-Ons
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Featured Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-2xl font-bold text-gray-900 mb-2">$5</p>
              <p className="text-sm text-gray-600 text-center">per week</p>
              <p className="text-sm text-gray-500 mt-2">Top of page placement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <ArrowUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Bump to Top</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-2xl font-bold text-gray-900 mb-2">$1</p>
              <p className="text-sm text-gray-600 text-center">per bump</p>
              <p className="text-sm text-gray-500 mt-2">Refresh your position</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Camera className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Extra Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-2xl font-bold text-gray-900 mb-2">$0.50</p>
              <p className="text-sm text-gray-600 text-center">per slot</p>
              <p className="text-sm text-gray-500 mt-2">Beyond plan limits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Urgent Tag</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-2xl font-bold text-gray-900 mb-2">$2</p>
              <p className="text-sm text-gray-600 text-center">one-time</p>
              <p className="text-sm text-gray-500 mt-2">Urgent badge display</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Concierge Service */}
      <Card className="mb-16 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="text-center">
          <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">White Glove Service</CardTitle>
          <CardDescription className="text-lg">
            Don't want to post yourself? We'll handle everything for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-3xl font-bold text-gray-900 mb-2">$2</p>
          <p className="text-gray-600 mb-4">per manual posting (one-time fee)</p>
          <ul className="text-left max-w-md mx-auto space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Professional description writing
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Image upload and optimization
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Listing optimization for visibility
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Category and pricing guidance
            </li>
          </ul>
        </CardContent>
        <CardFooter className="justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Contact via WhatsApp
          </Button>
        </CardFooter>
      </Card>

      {/* Local Focus */}
      <div className="text-center bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Local. Flexible. Made for You.
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          BikfayaList is designed specifically for Bikfaya and surrounding villages — with simple, 
          transparent pricing that respects your budget while giving your listings maximum visibility 
          in your own community.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" asChild>
            <a href="/browse">Browse Listings</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/dashboard/create">Post Your First Ad</a>
          </Button>
        </div>
      </div>
    </div>
  )
}