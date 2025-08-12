'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Eye, EyeOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useAnalytics } from '@/components/providers/PostHogProvider'

interface PhoneNumberPrivacyProps {
  phoneNumber: string
  listingId: string
  userId: string
}

export function PhoneNumberPrivacy({ phoneNumber, listingId, userId }: PhoneNumberPrivacyProps) {
  const { data: session } = useSession()
  const { trackContactReveal } = useAnalytics()
  const [isRevealed, setIsRevealed] = useState(false)

  // Don't show anything if no session
  if (!session) {
    return (
      <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Phone className="w-4 h-4 mr-2" />
        <span className="mr-2">Phone number hidden</span>
        <Button asChild variant="link" size="sm" className="p-0 h-auto">
          <Link href="/auth/signin">Sign in to view</Link>
        </Button>
      </div>
    )
  }

  // Mask the phone number
  const maskPhoneNumber = (phone: string) => {
    if (phone.length <= 4) return '●●●●'
    // Show first 3 digits and mask the rest except last 2
    return phone.slice(0, 3) + '●'.repeat(Math.max(0, phone.length - 5)) + phone.slice(-2)
  }

  const handleRevealPhone = async () => {
    // Track client-side analytics for phone reveal
    trackContactReveal(listingId, 'phone')
    
    // Log the phone reveal for audit purposes (future feature)
    try {
      await fetch('/api/listings/phone-reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          sellerId: userId,
          revealedAt: new Date().toISOString()
        })
      })
    } catch (error) {
      // Non-critical error, don't block the reveal
      console.warn('Failed to log phone reveal:', error)
    }
    
    setIsRevealed(true)
  }

  return (
    <div className="flex items-center text-sm">
      <Phone className="w-4 h-4 mr-2" />
      {isRevealed ? (
        <div className="flex items-center">
          <span className="font-medium">{phoneNumber}</span>
          <EyeOff className="w-3 h-3 ml-2 text-gray-400" />
        </div>
      ) : (
        <div className="flex items-center">
          <span className="text-gray-600 mr-3 font-mono tracking-wider">
            {maskPhoneNumber(phoneNumber)}
          </span>
          <Button 
            onClick={handleRevealPhone}
            variant="outline" 
            size="sm"
            className="h-7 px-2 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Show Number
          </Button>
        </div>
      )}
    </div>
  )
}