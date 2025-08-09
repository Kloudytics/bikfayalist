'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ListingCard from '@/components/ListingCard'
import SearchWithSuggestions from '@/components/SearchWithSuggestions'
import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react'

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

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([])
  const [recentListings, setRecentListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchFeaturedListings()
    fetchRecentListings()
    fetchCategories()
  }, [])

  const fetchFeaturedListings = async () => {
    try {
      const response = await fetch('/api/listings?featured=true&limit=8')
      const data = await response.json()
      setFeaturedListings(data.listings || [])
    } catch (error) {
      console.error('Failed to fetch featured listings:', error)
      setFeaturedListings([])
    }
  }

  const fetchRecentListings = async () => {
    try {
      const response = await fetch('/api/listings?limit=12&page=1')
      const data = await response.json()
      setRecentListings(data.listings || [])
    } catch (error) {
      console.error('Failed to fetch recent listings:', error)
      setRecentListings([])
    }
  }

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


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Buy, Sell, Trade <span className="text-blue-200">Locally</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The premier marketplace for your community. Find great deals or sell your items today.
            </p>
            
            <SearchWithSuggestions placeholder="Search for anything..." />

            <div className="mt-8 flex justify-center space-x-4">
              <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link href="/browse">Browse All</Link>
              </Button>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/dashboard/create">Post Free Ad</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Listings</h2>
              <p className="text-lg text-gray-600">Check out these popular items</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/browse">
                Browse All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(featuredListings) && featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          
          {/* Show message when no featured listings */}
          {featuredListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No featured listings available at the moment</p>
              <p className="text-sm text-gray-400">Check back soon for highlighted deals!</p>
            </div>
          )}
        </div>
      </section>

      {/* Most Recent Posts */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Most Recent Posts</h2>
              <p className="text-lg text-gray-600">Fresh listings from our community</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/browse">
                Browse All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(recentListings) && recentListings.slice(0, 8).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          
          {/* Show message when no recent listings */}
          {recentListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No recent listings available</p>
              <p className="text-sm text-gray-400">Be the first to post something!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BikfayaList?</h2>
            <p className="text-lg text-gray-600">Join thousands of users who trust our platform</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Your safety is our priority. All listings are moderated and users verified.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">Post your ad in minutes. Our intuitive interface makes buying and selling effortless.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Community</h3>
              <p className="text-gray-600">Connect with buyers and sellers in your area. Build lasting relationships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.isArray(categories) && categories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.slug}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                  <span className="text-blue-600 font-semibold text-sm">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/browse">
                Browse All Categories
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Join our community and turn your unused items into cash today.
          </p>
          <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
            <Link href="/dashboard/create">Post Your First Ad</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}