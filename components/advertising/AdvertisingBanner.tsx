'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Advertisement {
  id: string
  company: string
  headline: string
  description: string
  ctaText: string
  ctaUrl: string
  backgroundImage?: string
  backgroundColor: string
  textColor: string
  isActive: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  clickCount: number
  impressionCount: number
}

interface AdvertisingBannerProps {
  className?: string
  autoSlideInterval?: number
  showDismissButton?: boolean
  onDismiss?: () => void
  onAdClick?: (adId: string, adUrl: string) => void
}

export default function AdvertisingBanner({ 
  className = '',
  autoSlideInterval = 5000,
  showDismissButton = true,
  onDismiss,
  onAdClick
}: AdvertisingBannerProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  const activeAds = advertisements.filter(ad => ad.isActive)
  const currentAd = activeAds[currentAdIndex]

  // Fetch advertisements from API (non-blocking)
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/advertisements')
        if (response.ok) {
          const data = await response.json()
          setAdvertisements(data.advertisements || [])
        } else {
          // Graceful fallback - hide banner on API error
          setAdvertisements([])
        }
      } catch (error) {
        console.error('Failed to fetch advertisements:', error)
        // Graceful fallback - hide banner on network error
        setAdvertisements([])
      } finally {
        setLoading(false)
        // Smooth fade-in animation after loading
        setTimeout(() => setIsVisible(true), 50)
      }
    }

    // Non-blocking: Set a minimal delay to allow page to render first
    const timer = setTimeout(fetchAds, 100)
    return () => clearTimeout(timer)
  }, [])

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered || activeAds.length <= 1) return

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % activeAds.length)
      setProgress(0)
      setProgressKey(prev => prev + 1)
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [isHovered, activeAds.length, autoSlideInterval])

  // Reset progress when ad changes or hover state changes
  useEffect(() => {
    setProgress(0)
    setProgressKey(prev => prev + 1)
  }, [currentAdIndex, isHovered])

  const goToSlide = useCallback((index: number) => {
    setCurrentAdIndex(index)
    setProgress(0)
    setProgressKey(prev => prev + 1)
  }, [])

  const handleAdClick = useCallback(async (ad: Advertisement) => {
    // Track click in database
    try {
      await fetch('/api/advertisements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, type: 'click' })
      })
    } catch (error) {
      console.error('Failed to track ad click:', error)
    }
    
    if (onAdClick) {
      onAdClick(ad.id, ad.ctaUrl)
    }
    
    // Open in new tab
    window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer')
  }, [onAdClick])

  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
    if (onDismiss) {
      onDismiss()
    }
  }, [onDismiss])

  // Track impressions
  useEffect(() => {
    if (currentAd) {
      // Track impression in database
      fetch('/api/advertisements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: currentAd.id, type: 'impression' })
      }).catch(error => {
        console.error('Failed to track ad impression:', error)
      })
    }
  }, [currentAdIndex, currentAd])

  // Non-blocking approach: Don't show anything while loading
  if (loading || isDismissed || activeAds.length === 0) {
    return null
  }

  return (
    <div 
      className={`relative w-full rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-blue-600 to-purple-700 text-white transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="banner"
      aria-label="Advertisement"
    >
      {/* Progress bar */}
      {activeAds.length > 1 && !isHovered && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
          <div 
            key={progressKey}
            className="h-full bg-white transition-all ease-linear"
            style={{
              width: '100%',
              animation: isHovered ? 'none' : `progress ${autoSlideInterval}ms linear`
            }}
          />
        </div>
      )}

      {/* Main Ad Content */}
      <div 
        className="relative h-32 md:h-40 flex items-center"
      >
        {/* Background Image with Overlay */}
        {currentAd.backgroundImage && (
          <div className="absolute inset-0">
            <Image
              src={currentAd.backgroundImage}
              alt={currentAd.headline}
              fill
              className="object-cover opacity-30"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-700/80" />
          </div>
        )}
        
        {/* Close Button */}
        {showDismissButton && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 z-20 bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
            aria-label="Close advertisement"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Ad Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Sponsored
                </span>
                <span className="text-sm font-medium opacity-90">
                  {currentAd.company}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-1 truncate">
                {currentAd.headline}
              </h2>
              <p className="text-sm md:text-base opacity-90 line-clamp-2">
                {currentAd.description}
              </p>
            </div>
            
            <div className="ml-6 flex-shrink-0">
              <Button
                onClick={() => handleAdClick(currentAd)}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-2"
              >
                {currentAd.ctaText}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dot Indicators */}
      {activeAds.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {activeAds.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentAdIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to advertisement ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}