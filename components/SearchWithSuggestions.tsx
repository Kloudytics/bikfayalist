'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Eye } from 'lucide-react'
import Image from 'next/image'

interface SearchSuggestion {
  id: string
  title: string
  price: number
  location: string
  category: string
  thumbnail: string | null
  views: number
}

interface SearchWithSuggestionsProps {
  placeholder?: string
  className?: string
}

export default function SearchWithSuggestions({ 
  placeholder = "Search for anything...", 
  className = "" 
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search function
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new timeout - 400ms delay is optimal for search
    debounceRef.current = setTimeout(async () => {
      await fetchSuggestions(query)
    }, 400)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      setSuggestions(data.suggestions || [])
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setShowSuggestions(false)
      router.push(`/browse?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false)
    setQuery('')
    router.push(`/listing/${suggestion.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            className="pl-12 h-14 text-lg bg-white text-gray-900"
            autoComplete="off"
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-4 top-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        <Button type="submit" size="lg" className="h-14 px-8 bg-orange-500 hover:bg-orange-600">
          Search
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-w-2xl mx-auto z-50 shadow-lg border">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                }`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {suggestion.thumbnail ? (
                    <Image
                      src={suggestion.thumbnail}
                      alt={suggestion.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </h4>
                    <span className="font-semibold text-blue-600 ml-2">
                      ${suggestion.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {suggestion.category}
                    </Badge>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {suggestion.location}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Eye className="w-3 h-3 mr-1" />
                      {suggestion.views}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show all results link */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              >
                View all results for "{query}"
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* No results state */}
      {showSuggestions && !isLoading && suggestions.length === 0 && query.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-w-2xl mx-auto z-50 shadow-lg border">
          <div className="px-4 py-6 text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No items found for "{query}"</p>
            <button
              onClick={handleSubmit}
              className="text-blue-600 hover:text-blue-700 text-sm mt-1"
            >
              Search all listings
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}