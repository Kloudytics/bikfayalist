'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import ListingForm from '@/components/ListingForm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [userListingCount, setUserListingCount] = useState(0)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    fetchCategories()
    fetchUserListingCount()
  }, [session, status])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchUserListingCount = async () => {
    try {
      const response = await fetch(`/api/listings?userId=${session?.user.id}`)
      const data = await response.json()
      setUserListingCount(data.listings?.length || 0)
    } catch (error) {
      console.error('Failed to fetch user listing count:', error)
    }
  }

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const listing = await response.json()
        toast.success('Listing created successfully!')
        router.push(`/listing/${listing.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create listing')
      }
    } catch (error) {
      console.error('Failed to create listing:', error)
      toast.error('Failed to create listing')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  // Redirect if user has reached post limit
  if (userListingCount >= 5) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Listing</h1>
        </div>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Beta Limit Reached</h3>
                <p className="text-yellow-700 mb-4">
                  You&apos;ve reached the maximum of 5 posts allowed during our beta period. 
                  This limit helps us maintain quality while we test the platform with our Bikfaya community.
                </p>
                <p className="text-yellow-700 mb-4">
                  To create a new listing, you can:
                </p>
                <ul className="list-disc list-inside text-yellow-700 mb-4">
                  <li>Delete or archive an existing listing from your dashboard</li>
                  <li>Wait for the beta period to end when limits will be increased</li>
                </ul>
                <div className="flex space-x-3">
                  <Badge variant="outline" className="text-yellow-800 border-yellow-300 bg-yellow-100">
                    Current: {userListingCount}/5 posts
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Listing</h1>
        <p className="text-gray-600">Fill in the details below to create your listing</p>
        
        {/* Beta limit warning */}
        <div className="mt-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-100">
                  BETA
                </Badge>
                <p className="text-sm text-blue-700">
                  You can create {5 - userListingCount} more posts during our beta period ({userListingCount}/5 used)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ListingForm
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}