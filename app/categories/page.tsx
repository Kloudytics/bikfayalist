'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Grid, List, ArrowRight } from 'lucide-react'

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
    slug: string
  }
  user: {
    name: string | null
    image: string | null
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchListings()
  }, [])

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

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings?limit=50')
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const getCategoryStats = (categorySlug: string) => {
    return Array.isArray(listings) ? listings.filter((listing) => listing.category.slug === categorySlug).length : 0
  }

  const filteredCategories = Array.isArray(categories) ? categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Categories</h1>
        <p className="text-gray-600 mb-6">Explore all available categories and find exactly what you're looking for</p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
              <div className="p-6 space-y-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCategories.map((category) => {
                const listingCount = getCategoryStats(category.slug)
                return (
                  <Link
                    key={category.id}
                    href={`/browse?category=${category.slug}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-600 group-hover:to-purple-700 transition-colors">
                          <span className="text-white font-bold text-xl">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {listingCount} {listingCount === 1 ? 'listing' : 'listings'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => {
                const listingCount = getCategoryStats(category.slug)
                return (
                  <Link
                    key={category.id}
                    href={`/browse?category=${category.slug}`}
                    className="group"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 transition-colors">
                              <span className="text-white font-bold">
                                {category.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {listingCount} {listingCount === 1 ? 'listing' : 'listings'} available
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600">Try adjusting your search terms.</p>
            </div>
          )}
        </>
      )}

      {/* Popular Categories Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.isArray(categories) && categories
            .sort((a, b) => getCategoryStats(b.slug) - getCategoryStats(a.slug))
            .slice(0, 8)
            .map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.slug}`}
                className="group p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-600 font-semibold text-sm">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getCategoryStats(category.slug)} items
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}