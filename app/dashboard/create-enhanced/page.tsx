'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Check, Star, MapPin, Camera, AlertCircle, Crown } from 'lucide-react'
import { toast } from 'sonner'

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.number().positive().optional(),
  hidePrice: z.boolean().default(false),
  location: z.string().min(1, 'Location is required').max(100),
  categoryId: z.string().min(1, 'Category is required'),
  pricingPlanId: z.string().optional(),
})

interface Category {
  id: string
  name: string
  requiresPayment: boolean
  pricingTier: string
  basePrice?: number
}

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
}

export default function CreateEnhancedListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(listingSchema),
  })

  const watchedCategoryId = watch('categoryId')
  const watchedHidePrice = watch('hidePrice')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    fetchData()
  }, [session, status])

  useEffect(() => {
    if (watchedCategoryId) {
      const category = categories.find(cat => cat.id === watchedCategoryId)
      setSelectedCategory(category || null)
      
      // Auto-select appropriate pricing plan based on category
      if (category?.requiresPayment && pricingPlans.length > 0) {
        const premiumPlan = pricingPlans.find(plan => plan.name === 'PREMIUM')
        if (premiumPlan && !selectedPlan) {
          setSelectedPlan(premiumPlan)
          setValue('pricingPlanId', premiumPlan.id)
        }
      } else if (!category?.requiresPayment && pricingPlans.length > 0) {
        const basicPlan = pricingPlans.find(plan => plan.name === 'BASIC')
        if (basicPlan && !selectedPlan?.isFeatured) {
          setSelectedPlan(basicPlan)
          setValue('pricingPlanId', basicPlan.id)
        }
      }
    }
  }, [watchedCategoryId, categories, pricingPlans, selectedPlan, setValue])

  const fetchData = async () => {
    try {
      const [categoriesRes, plansRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/pricing-plans')
      ])
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }
      
      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPricingPlans(plansData)
        // Auto-select BASIC plan by default
        const basicPlan = plansData.find((plan: PricingPlan) => plan.name === 'BASIC')
        if (basicPlan) {
          setSelectedPlan(basicPlan)
          setValue('pricingPlanId', basicPlan.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load form data')
    }
  }

  const handlePlanSelection = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setValue('pricingPlanId', plan.id)
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const submitData = {
        ...data,
        price: data.hidePrice ? undefined : data.price,
        pricingPlanId: selectedPlan?.id
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const listing = await response.json()
        toast.success('Listing created successfully!')
        router.push(`/listing/${listing.id}`)
      } else {
        const error = await response.json()
        if (response.status === 402) {
          toast.error(`Premium category requires paid plan: ${error.error}`)
        } else {
          toast.error(error.error || 'Failed to create listing')
        }
      }
    } catch (error) {
      console.error('Failed to create listing:', error)
      toast.error('Failed to create listing')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Listing</h1>
        <p className="text-gray-600">Choose your plan and create your listing with enhanced features</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Listing Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listing Details</CardTitle>
                <CardDescription>Provide the basic information about your listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter listing title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message as string}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your item or service in detail"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message as string}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select onValueChange={(value) => setValue('categoryId', value)}>
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{category.name}</span>
                            {category.requiresPayment && (
                              <Badge variant="secondary" className="ml-2">
                                Premium
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500 mt-1">{errors.categoryId.message as string}</p>
                  )}
                  {selectedCategory?.requiresPayment && (
                    <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 rounded">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm text-yellow-700">
                        This category requires a premium plan (${selectedCategory.basePrice}+ per listing)
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., Bikfaya, Mount Lebanon"
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500 mt-1">{errors.location.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register('price', { 
                        setValueAs: (value) => value === '' ? undefined : parseFloat(value) 
                      })}
                      disabled={watchedHidePrice}
                      placeholder="Enter price"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1">{errors.price.message as string}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="hidePrice"
                      {...register('hidePrice')}
                      disabled={!selectedPlan?.canHidePrice}
                      onCheckedChange={(checked) => setValue('hidePrice', checked)}
                    />
                    <Label htmlFor="hidePrice" className="text-sm">
                      Price on request
                      {!selectedPlan?.canHidePrice && (
                        <span className="text-gray-500"> (Premium feature)</span>
                      )}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Plan Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>Select the features you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      selectedCategory?.requiresPayment && plan.price === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    onClick={() => {
                      if (!(selectedCategory?.requiresPayment && plan.price === 0)) {
                        handlePlanSelection(plan)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {plan.isFeatured && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">
                          ${plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm text-gray-500">
                            /{plan.duration}d
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Camera className="h-3 w-3 text-green-500 mr-2" />
                        <span>Up to {plan.maxPhotos} photos</span>
                      </div>
                      {plan.canHidePrice && (
                        <div className="flex items-center text-sm">
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                          <span>"Price on request" option</span>
                        </div>
                      )}
                      {plan.isFeatured && (
                        <div className="flex items-center text-sm">
                          <Star className="h-3 w-3 text-yellow-500 mr-2" />
                          <span>Featured placement</span>
                        </div>
                      )}
                      {plan.hasMapLocation && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 text-green-500 mr-2" />
                          <span>Map location</span>
                        </div>
                      )}
                    </div>

                    {selectedCategory?.requiresPayment && plan.price === 0 && (
                      <div className="mt-2 text-xs text-red-500">
                        Not available for premium categories
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedPlan && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Selected Plan</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">{selectedPlan.name}</span>
                    <span className="font-bold text-green-800">
                      ${selectedPlan.price}
                      {selectedPlan.price > 0 && (
                        <span className="text-sm font-normal">
                          /{selectedPlan.duration}d
                        </span>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !selectedPlan}
          >
            {isLoading ? 'Creating...' : `Create Listing${selectedPlan?.price ? ` - $${selectedPlan.price}` : ''}`}
          </Button>
        </div>
      </form>
    </div>
  )
}