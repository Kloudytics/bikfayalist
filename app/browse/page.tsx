'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ListingCard from '@/components/ListingCard'
import SearchFilters from '@/components/SearchFilters'
import AdvertisingBanner from '@/components/advertising/AdvertisingBanner'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  location: string
  images: string
  views: number
  createdAt: string
  category: {
    name: string
  }
  user: {
    name: string | null
    image: string | null
  }
}

interface Pagination {
  page: number
  pages: number
  total: number
}

function BrowseContent() {
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      location: searchParams.get('location') || undefined,
    }
    const page = parseInt(searchParams.get('page') || '1')
    fetchListings(filters, page)
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    }
  }

  const fetchListings = async (filters: any = {}, page = 1, isFilteringUpdate = false) => {
    if (isFilteringUpdate) {
      setIsFiltering(true)
    } else {
      setLoading(true)
    }

    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string)
      })
      params.append('page', page.toString())

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()
      
      setListings(data.listings || [])
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      setListings([])
    } finally {
      if (isFilteringUpdate) {
        setIsFiltering(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleFiltersChange = (filters: any) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value as string)
    })
    
    const newUrl = `/browse${params.toString() ? `?${params.toString()}` : ''}`
    window.history.pushState({}, '', newUrl)
    
    fetchListings(filters, 1, true) // Mark as filtering update for smooth UX
  }

  const handlePageChange = (newPage: number) => {
    const currentParams = Object.fromEntries(searchParams.entries())
    
    // Update URL with new page parameter
    const params = new URLSearchParams(currentParams)
    params.set('page', newPage.toString())
    const newUrl = `/browse?${params.toString()}`
    window.history.pushState({}, '', newUrl)
    
    fetchListings(currentParams, newPage)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Listings</h1>
        <p className="text-gray-600">Discover amazing deals in your area</p>
      </div>

      {/* Premium Advertising Banner - Non-blocking, loads after page */}
      <AdvertisingBanner
        className="shadow-lg mb-8"
        onAdClick={(adId, adUrl) => {
          console.log('Ad clicked:', adId, adUrl)
          // Track analytics here
        }}
        onDismiss={() => {
          console.log('Ad banner dismissed')
          // Track dismissal analytics
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters
            categories={categories}
            onFiltersChange={handleFiltersChange}
            initialFilters={{
              search: searchParams.get('search') || '',
              category: searchParams.get('category') || 'all',
              minPrice: searchParams.get('minPrice') || '',
              maxPrice: searchParams.get('maxPrice') || '',
              location: searchParams.get('location') || '',
            }}
          />
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <p className="text-gray-600">
                {pagination.total} {pagination.total === 1 ? 'listing' : 'listings'} found
              </p>
              {isFiltering && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Filtering...</span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 transition-opacity duration-200 ${
                isFiltering ? 'opacity-70' : 'opacity-100'
              }`}>
                {Array.isArray(listings) && listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-1">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1 mx-2">
                    {(() => {
                      const currentPage = pagination.page
                      const totalPages = pagination.pages
                      const pages = []
                      
                      // Always show first page
                      if (totalPages > 1) {
                        pages.push(
                          <Button
                            key={1}
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            className="w-10 h-10 p-0"
                          >
                            1
                          </Button>
                        )
                      }
                      
                      // Show ellipsis if current page is far from start
                      if (currentPage > 4) {
                        pages.push(
                          <span key="ellipsis1" className="px-2 text-gray-500">
                            ...
                          </span>
                        )
                      }
                      
                      // Show pages around current page
                      const startPage = Math.max(2, currentPage - 1)
                      const endPage = Math.min(totalPages - 1, currentPage + 1)
                      
                      for (let i = startPage; i <= endPage; i++) {
                        if (i !== 1 && i !== totalPages) {
                          pages.push(
                            <Button
                              key={i}
                              variant={currentPage === i ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(i)}
                              className="w-10 h-10 p-0"
                            >
                              {i}
                            </Button>
                          )
                        }
                      }
                      
                      // Show ellipsis if current page is far from end
                      if (currentPage < totalPages - 3) {
                        pages.push(
                          <span key="ellipsis2" className="px-2 text-gray-500">
                            ...
                          </span>
                        )
                      }
                      
                      // Always show last page
                      if (totalPages > 1) {
                        pages.push(
                          <Button
                            key={totalPages}
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            className="w-10 h-10 p-0"
                          >
                            {totalPages}
                          </Button>
                        )
                      }
                      
                      return pages
                    })()}
                  </div>
                  
                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-3"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse all categories.</p>
              <Button onClick={() => handleFiltersChange({})}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  )
}