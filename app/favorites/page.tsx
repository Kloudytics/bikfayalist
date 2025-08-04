'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import ListingCard from '@/components/ListingCard'
import { Search, Heart, Grid, List } from 'lucide-react'
import { toast } from 'sonner'

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
  favoriteId?: string
  favoritedAt?: Date
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Listing[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    fetchFavorites()
  }, [session, status])

  useEffect(() => {
    filterAndSortFavorites()
  }, [favorites, searchQuery, sortBy])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }
      
      const data = await response.json()
      setFavorites(data.favorites || [])
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
      toast.error('Failed to load favorites')
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortFavorites = () => {
    let filtered = favorites

    if (searchQuery) {
      filtered = filtered.filter((favorite) =>
        favorite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        favorite.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        favorite.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.favoritedAt || 0).getTime() - new Date(a.favoritedAt || 0).getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredFavorites(filtered)
  }

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.favoriteId !== favoriteId))
        toast.success('Removed from favorites')
      } else {
        toast.error('Failed to remove from favorites')
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      toast.error('Failed to remove favorite')
    }
  }

  const handleClearAllFavorites = async () => {
    if (!confirm('Are you sure you want to remove all favorites?')) return

    try {
      // Delete all favorites one by one
      const deletePromises = favorites.map(favorite => 
        fetch(`/api/favorites/${favorite.favoriteId}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      setFavorites([])
      toast.success('All favorites cleared')
    } catch (error) {
      console.error('Failed to clear favorites:', error)
      toast.error('Failed to clear favorites')
    }
  }

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
            <p className="text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {favorites.length > 0 && (
            <Button variant="outline" onClick={handleClearAllFavorites}>
              Clear All
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title">Title A-Z</option>
            </select>
            
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      ) : filteredFavorites.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredFavorites.map((favorite) => (
            <div key={favorite.favoriteId} className="relative group">
              {viewMode === 'grid' ? (
                <ListingCard listing={favorite} />
              ) : (
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {JSON.parse(favorite.images || '[]')[0] && (
                          <img
                            src={JSON.parse(favorite.images)[0]}
                            alt={favorite.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {favorite.title}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600 mb-2">
                          ${favorite.price.toLocaleString()}
                        </p>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {favorite.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{favorite.location}</span>
                          <span className="text-sm text-gray-500">{favorite.category.name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <button
                onClick={() => handleRemoveFavorite(favorite.favoriteId!)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove from favorites"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No favorites found' : 'No favorites yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms.'
                : 'Start browsing listings and save your favorites here.'
              }
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/browse">Browse Listings</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}