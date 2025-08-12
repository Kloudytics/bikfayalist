'use client'

import { useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, analytics } from '@/lib/analytics'

function PostHogTracking({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog()
  }, [])

  // Track user identification
  useEffect(() => {
    if (session?.user) {
      analytics.identify(session.user.id!, {
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role || 'USER',
        is_business_user: (session.user as any).isBusinessUser || false,
        signup_date: (session.user as any).createdAt || new Date().toISOString(),
        // Lebanese market properties
        market: 'lebanon',
        platform: 'bikfayalist'
      })
    }
  }, [session])

  // Track page views
  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    
    // Track page view
    analytics.pageview(url)
    
    // Track Lebanese market page views
    if (pathname.includes('browse') || pathname.includes('categories')) {
      analytics.track('category_browsed', {
        page_url: url,
        is_marketplace_page: true
      })
    }
    
    // Track dashboard usage
    if (pathname.includes('dashboard')) {
      analytics.track('search_performed', {
        page_url: url,
        section: 'dashboard',
        user_type: session?.user ? 'authenticated' : 'anonymous'
      })
    }
    
  }, [pathname, searchParams, session])

  // Reset analytics on logout
  useEffect(() => {
    if (!session) {
      analytics.reset()
    }
  }, [session])

  return <>{children}</>
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PostHogTracking>{children}</PostHogTracking>
    </Suspense>
  )
}

// Hook for easy analytics access
export function useAnalytics() {
  const { data: session } = useSession()
  
  return {
    track: analytics.track,
    identify: analytics.identify,
    pageview: analytics.pageview,
    
    // Lebanese marketplace specific tracking
    trackListingAction: (action: string, listingId?: string, properties?: Record<string, any>) => {
      analytics.track('listing_created', {
        action,
        listing_id: listingId,
        user_id: session?.user?.id,
        user_type: session?.user ? 'authenticated' : 'anonymous',
        ...properties
      })
    },
    
    trackPaymentAction: (action: string, amount?: number, method?: 'cash' | 'whish' | 'omt') => {
      analytics.track('payment_completed', {
        action,
        payment_amount: amount,
        payment_method: method,
        user_id: session?.user?.id
      })
    },
    
    trackContactReveal: (listingId: string, contactType: 'phone' | 'whatsapp' | 'message') => {
      analytics.track('phone_number_revealed', {
        listing_id: listingId,
        contact_type: contactType,
        user_id: session?.user?.id,
        high_intent_action: true
      })
    },
    
    trackSearch: (query?: string, category?: string, location?: string) => {
      analytics.track('search_performed', {
        search_query: query,
        category,
        location,
        user_id: session?.user?.id
      })
    }
  }
}