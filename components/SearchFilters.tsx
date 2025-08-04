'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void
  categories: Array<{ id: string; name: string; slug: string }>
  initialFilters?: {
    search: string
    category: string
    minPrice: string
    maxPrice: string
    location: string
  }
}

export default function SearchFilters({ onFiltersChange, categories, initialFilters }: SearchFiltersProps) {
  const [search, setSearch] = useState(initialFilters?.search || '')
  const [category, setCategory] = useState(initialFilters?.category || 'all')
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || '')
  const [location, setLocation] = useState(initialFilters?.location || '')
  const [isInitialized, setIsInitialized] = useState(false)

  const handleSearch = () => {
    onFiltersChange({
      search: search || undefined,
      category: category && category !== 'all' ? category : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      location: location || undefined,
    })
  }

  const handleReset = () => {
    setSearch('')
    setCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setLocation('')
    onFiltersChange({})
  }

  // Update state when initialFilters change (e.g., when navigating from categories)
  useEffect(() => {
    if (initialFilters) {
      setSearch(initialFilters.search || '')
      setCategory(initialFilters.category || 'all')
      setMinPrice(initialFilters.minPrice || '')
      setMaxPrice(initialFilters.maxPrice || '')
      setLocation(initialFilters.location || '')
    }
    // Mark as initialized after setting initial values to prevent immediate filtering
    setIsInitialized(true)
  }, [initialFilters])

  useEffect(() => {
    // Only trigger search after component is initialized to prevent double filtering on load
    if (!isInitialized) return
    
    const debounceTimer = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [search, category, minPrice, maxPrice, location, isInitialized])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Array.isArray(categories) && categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={handleSearch} className="flex-1">
            Search
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}