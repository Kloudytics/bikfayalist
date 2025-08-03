'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import ListingForm from '@/components/ListingForm'
import { toast } from 'sonner'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  location: string
  images: string
  categoryId: string
  userId: string
  status: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function EditListingPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    fetchListing()
    fetchCategories()
  }, [session, status, id])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${id}`)
      if (response.ok) {
        const data = await response.json()
        
        if (data.userId !== session?.user?.id && session?.user?.role !== 'ADMIN') {
          toast.error('You can only edit your own listings')
          router.push('/dashboard/listings')
          return
        }
        
        setListing(data)
      } else {
        toast.error('Listing not found')
        router.push('/dashboard/listings')
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error)
      toast.error('Failed to load listing')
      router.push('/dashboard/listings')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
      setCategories([])
    }
  }

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedListing = await response.json()
        toast.success('Listing updated successfully!')
        router.push(`/listing/${updatedListing.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update listing')
      }
    } catch (error) {
      console.error('Failed to update listing:', error)
      toast.error('Failed to update listing')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  if (!listing) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Listing not found</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Edit Listing</h1>
        <p className="text-gray-600">Update your listing details</p>
      </div>

      <ListingForm
        categories={categories}
        onSubmit={handleSubmit}
        initialData={listing}
        isLoading={isLoading}
      />
    </div>
  )
}