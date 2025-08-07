export interface Advertisement {
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
  clickCount: number
  impressionCount: number
  startDate?: Date
  endDate?: Date
  budget?: number
  targetAudience?: string[]
  priority: 'low' | 'medium' | 'high'
}

export interface AdvertisingAnalytics {
  impressions: number
  clicks: number
  ctr: number // Click-through rate
  revenue: number
  uniqueUsers: number
}

export interface AdvertisingConfig {
  autoSlideInterval: number
  maxAdsPerCarousel: number
  showDismissButton: boolean
  enableAnalytics: boolean
}