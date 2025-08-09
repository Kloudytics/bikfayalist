'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Zap, Crown } from 'lucide-react'

interface UserLimits {
  freeListingsPerMonth: number
  canCreateFreeListing: boolean
  freeListingsUsed: number
  nextResetDate: Date
}

interface BusinessRulesSummary {
  limits: UserLimits
  userType: 'BUSINESS' | 'INDIVIDUAL'
  subscriptionPlan?: string
  subscriptionEndsAt?: Date
  rules: {
    freeListingsPerMonth: number
    canPostInPremiumCategories: boolean
    hasActivePaidPlan: boolean
  }
}

export default function UserLimitsCard() {
  const [summary, setSummary] = useState<BusinessRulesSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await fetch('/api/user/limits')
        if (response.ok) {
          const data = await response.json()
          setSummary(data)
        }
      } catch (error) {
        console.error('Failed to fetch user limits:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLimits()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return null
  }

  const { limits, userType, rules } = summary
  const usagePercentage = (limits.freeListingsUsed / limits.freeListingsPerMonth) * 100
  const resetDate = new Date(limits.nextResetDate).toLocaleDateString()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {userType === 'BUSINESS' ? (
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
            ) : (
              <Users className="h-5 w-5 text-blue-500 mr-2" />
            )}
            Monthly Listing Limits
          </div>
          <Badge variant={userType === 'BUSINESS' ? 'default' : 'secondary'}>
            {userType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free Listings Usage */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Free Listings Used</span>
            <span className="font-medium">
              {limits.freeListingsUsed} / {limits.freeListingsPerMonth}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="h-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Resets on {resetDate}
          </p>
        </div>

        {/* Status Messages */}
        {!limits.canCreateFreeListing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-yellow-500 mr-2" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Free limit reached</p>
                <p className="text-yellow-600">
                  Choose a paid plan to continue posting or wait until {resetDate}
                </p>
              </div>
            </div>
          </div>
        )}

        {limits.canCreateFreeListing && limits.freeListingsUsed > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="text-sm">
                <p className="font-medium text-green-800">
                  {limits.freeListingsPerMonth - limits.freeListingsUsed} free listings remaining
                </p>
                <p className="text-green-600">
                  Resets {resetDate}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Suggestion */}
        {userType === 'INDIVIDUAL' && limits.freeListingsUsed >= 2 && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Need more listings? Business users get {10} free listings per month.
            </p>
            <Button size="sm" variant="outline" className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Business
            </Button>
          </div>
        )}

        {/* Premium Categories Access */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Premium Categories</span>
            <Badge variant={rules.canPostInPremiumCategories ? 'default' : 'secondary'}>
              {rules.canPostInPremiumCategories ? 'Available' : 'Requires Payment'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Cars, Real Estate require paid plans
          </p>
        </div>
      </CardContent>
    </Card>
  )
}