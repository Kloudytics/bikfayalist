import posthog from 'posthog-js'

// Client-side PostHog configuration
export const initPostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      // Lebanese market privacy settings
      respect_dnt: true, // Respect Do Not Track headers
      disable_session_recording: false, // Enable session recordings for UX insights
      disable_cookie: false, // Enable cookies for user journey tracking
      cross_subdomain_cookie: false, // Single domain for now
      secure_cookie: process.env.NODE_ENV === 'production',
      
      // Lebanese business compliance
      opt_out_capturing_by_default: false,
      capture_pageview: true,
      capture_pageleave: true,
      
      // Performance settings
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') console.log('PostHog loaded')
      }
    })
  }
}

// Server-side PostHog configuration
let serverPostHog: any = null

export const getServerPostHog = async () => {
  if (!serverPostHog && process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window === 'undefined') {
    const { PostHog } = await import('posthog-node')
    serverPostHog = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
      }
    )
  }
  return serverPostHog
}

// Lebanese marketplace specific event types
export type MarketplaceEvent = 
  // Business Events
  | 'listing_created'
  | 'listing_featured_requested'
  | 'payment_completed'
  | 'payment_method_selected'
  
  // User Engagement
  | 'phone_number_revealed'
  | 'whatsapp_contact_clicked'
  | 'listing_shared'
  | 'listing_favorited'
  
  // Search & Discovery
  | 'search_performed'
  | 'category_browsed'
  | 'location_searched'
  | 'price_filter_applied'
  
  // Lebanese Market Specific
  | 'lebanese_location_selected'
  | 'arabic_content_viewed'
  | 'local_payment_selected'

// Event properties interface
export interface EventProperties {
  // Common properties
  user_id?: string
  listing_id?: string
  category_id?: string
  
  // Business properties
  payment_amount?: number
  payment_method?: 'cash' | 'whish' | 'omt'
  featured_duration?: number
  
  // Lebanese market properties
  location?: string
  is_lebanese_location?: boolean
  language_preference?: 'en' | 'ar'
  
  // Technical properties
  page_url?: string
  referrer?: string
  user_agent?: string
  
  // Custom metadata
  [key: string]: any
}

// Analytics utility functions
export const analytics = {
  // Track events client-side
  track: (event: MarketplaceEvent, properties?: EventProperties) => {
    if (typeof window !== 'undefined') {
      posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      })
    }
  },

  // Identify users
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, {
        ...properties,
        platform: 'bikfayalist',
        market: 'lebanon'
      })
    }
  },

  // Track page views
  pageview: (url?: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('$pageview', {
        $current_url: url || window.location.href
      })
    }
  },

  // Reset user (logout)
  reset: () => {
    if (typeof window !== 'undefined') {
      posthog.reset()
    }
  },

  // Server-side tracking
  trackServer: async (event: MarketplaceEvent, distinctId: string, properties?: EventProperties) => {
    if (typeof window === 'undefined') {
      const serverPH = await getServerPostHog()
      if (serverPH) {
        serverPH.capture({
          distinctId,
          event,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            server_side: true
          }
        })
        await serverPH.flush()
      }
    }
  }
}

// Lebanese marketplace utility functions
export const lebanonAnalytics = {
  // Track Lebanese-specific locations
  trackLocationInteraction: (location: string, action: string) => {
    const lebaneseCities = ['bikfaya', 'baalbek', 'beirut', 'tripoli', 'sidon', 'tyre', 'jounieh', 'zahle']
    const isLebaneseLLocation = lebaneseCities.some(city => 
      location.toLowerCase().includes(city)
    )
    
    analytics.track('lebanese_location_selected', {
      location,
      is_lebanese_location: isLebaneseLLocation,
      action
    })
  },

  // Track payment method preferences (Lebanese market insight)
  trackPaymentMethod: (method: 'cash' | 'whish' | 'omt', amount: number, listingId?: string) => {
    analytics.track('local_payment_selected', {
      payment_method: method,
      payment_amount: amount,
      listing_id: listingId,
      is_local_method: ['cash', 'whish', 'omt'].includes(method)
    })
  },

  // Track marketplace performance
  trackMarketplaceAction: (action: string, value?: number, metadata?: Record<string, any>) => {
    analytics.track('listing_created', {
      action,
      value,
      marketplace: 'bikfayalist',
      region: 'lebanon',
      ...metadata
    })
  }
}