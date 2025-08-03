'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import ListingForm from '@/components/ListingForm'
import { toast } from 'sonner'

export default function CreateListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    fetchCategories()
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Listing</h1>
        <p className="text-gray-600">Fill in the details below to create your listing</p>
      </div>

      <ListingForm
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}