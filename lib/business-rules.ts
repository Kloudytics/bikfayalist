import { prisma } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

/**
 * Business Rules Engine for BikfayaList
 * Handles monetization logic, limits, and user restrictions
 */

export interface ListingLimits {
  freeListingsPerMonth: number
  canCreateFreeListing: boolean
  freeListingsUsed: number
  nextResetDate: Date
}

export interface BusinessRuleResult {
  allowed: boolean
  message?: string
  requiresPayment?: boolean
  suggestedPlan?: string
  limits?: ListingLimits
}

/**
 * Check if user needs monthly reset and perform it if needed
 */
export async function checkAndResetMonthlyLimits(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      freeListingsThisMonth: true,
      monthlyResetAt: true
    }
  })

  if (!user) return

  const now = new Date()
  const shouldReset = !user.monthlyResetAt || now >= user.monthlyResetAt

  if (shouldReset) {
    // Calculate next reset date (first day of next month)
    const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    await prisma.user.update({
      where: { id: userId },
      data: {
        freeListingsThisMonth: 0,
        monthlyResetAt: nextResetDate
      }
    })
  }
}

/**
 * Get user's current listing limits and usage
 */
export async function getUserListingLimits(userId: string): Promise<ListingLimits> {
  // Ensure monthly limits are up to date
  await checkAndResetMonthlyLimits(userId)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      freeListingsThisMonth: true,
      monthlyResetAt: true,
      isBusinessUser: true,
      subscriptionPlan: true
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Business rules for free listings per month
  const freeListingsPerMonth = user.isBusinessUser ? 10 : 3
  const freeListingsUsed = user.freeListingsThisMonth
  const canCreateFreeListing = freeListingsUsed < freeListingsPerMonth
  const nextResetDate = user.monthlyResetAt || new Date()

  return {
    freeListingsPerMonth,
    canCreateFreeListing,
    freeListingsUsed,
    nextResetDate
  }
}

/**
 * Check if user can create a listing in a specific category with given plan
 */
export async function checkListingPermissions(
  userId: string,
  categoryId: string,
  pricingPlanId?: string
): Promise<BusinessRuleResult> {
  // Get user limits
  const limits = await getUserListingLimits(userId)
  
  // Get category requirements
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      name: true,
      requiresPayment: true,
      pricingTier: true,
      basePrice: true
    }
  })

  if (!category) {
    return {
      allowed: false,
      message: 'Category not found'
    }
  }

  // Get pricing plan if specified
  let pricingPlan = null
  if (pricingPlanId) {
    pricingPlan = await prisma.pricingPlan.findUnique({
      where: { id: pricingPlanId },
      select: { name: true, price: true }
    })
  }

  const isFreePlan = !pricingPlan || pricingPlan.price === 0

  // Rule 1: Premium categories require paid plans
  if (category.requiresPayment && isFreePlan) {
    return {
      allowed: false,
      message: `${category.name} listings require a premium plan. Please select a paid plan to continue.`,
      requiresPayment: true,
      suggestedPlan: 'PREMIUM',
      limits
    }
  }

  // Rule 2: Free plan limits
  if (isFreePlan && !limits.canCreateFreeListing) {
    const resetDate = limits.nextResetDate.toLocaleDateString()
    return {
      allowed: false,
      message: `You've reached your free listing limit (${limits.freeListingsPerMonth} per month). Your limit resets on ${resetDate}. Upgrade to a paid plan to continue posting.`,
      requiresPayment: true,
      suggestedPlan: 'PREMIUM',
      limits
    }
  }

  // All rules passed
  return {
    allowed: true,
    limits
  }
}

/**
 * Apply business rules after listing creation
 */
export async function applyPostCreationRules(
  userId: string,
  listingId: string,
  pricingPlanId?: string
): Promise<void> {
  // Get pricing plan to check if it was free
  let isFreeListing = true
  
  if (pricingPlanId) {
    const pricingPlan = await prisma.pricingPlan.findUnique({
      where: { id: pricingPlanId },
      select: { price: true }
    })
    isFreeListing = !pricingPlan || pricingPlan.price === 0
  }

  // If it was a free listing, increment the counter
  if (isFreeListing) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        freeListingsThisMonth: {
          increment: 1
        }
      }
    })
  }

  // Future: Add webhook triggers, analytics tracking, etc.
  await triggerPostCreationHooks(userId, listingId, { isFreeListing })
}

/**
 * Trigger post-creation hooks (analytics, notifications, etc.)
 */
async function triggerPostCreationHooks(
  userId: string, 
  listingId: string, 
  metadata: { isFreeListing: boolean }
): Promise<void> {
  // This is where you'd integrate with:
  // - Analytics services (PostHog, Mixpanel)
  // - Email notifications
  // - WhatsApp notifications
  // - Webhook endpoints
  // - AI moderation queues
  
  console.log('Post-creation hooks triggered:', {
    userId,
    listingId,
    isFreeListing: metadata.isFreeListing,
    timestamp: new Date().toISOString()
  })
  
  // Example: Log user event for analytics
  await logUserEvent(userId, 'listing_created', {
    listingId,
    isFreeListing: metadata.isFreeListing
  })
}

/**
 * Log user events for analytics and business intelligence
 */
export async function logUserEvent(
  userId: string, 
  eventType: string, 
  metadata: Record<string, any> = {}
): Promise<void> {
  // Future: Integrate with analytics services
  // For now, we'll just log to console
  console.log('User Event:', {
    userId,
    eventType,
    metadata,
    timestamp: new Date().toISOString()
  })
  
  // Future integration examples:
  // - await posthog.capture(userId, eventType, metadata)
  // - await mixpanel.track(eventType, { distinct_id: userId, ...metadata })
  // - await customAnalytics.track(userId, eventType, metadata)
}

/**
 * Get business rules summary for a user
 */
export async function getBusinessRulesSummary(userId: string) {
  const limits = await getUserListingLimits(userId)
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isBusinessUser: true,
      subscriptionPlan: true,
      subscriptionEndsAt: true
    }
  })

  return {
    limits,
    userType: user?.isBusinessUser ? 'BUSINESS' : 'INDIVIDUAL',
    subscriptionPlan: user?.subscriptionPlan,
    subscriptionEndsAt: user?.subscriptionEndsAt,
    rules: {
      freeListingsPerMonth: limits.freeListingsPerMonth,
      canPostInPremiumCategories: user?.isBusinessUser || false,
      hasActivePaidPlan: user?.subscriptionPlan && user?.subscriptionEndsAt && user.subscriptionEndsAt > new Date()
    }
  }
}