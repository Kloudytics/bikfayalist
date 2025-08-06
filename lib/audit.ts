import { prisma } from '@/lib/db'

export interface AuditLogEntry {
  action: string
  resourceType: 'USER' | 'LISTING' | 'MESSAGE' | 'CATEGORY'
  resourceId: string
  adminUserId: string
  details?: any
  ipAddress?: string
  userAgent?: string
}

export async function logAdminAction({
  action,
  resourceType,
  resourceId,
  adminUserId,
  details,
  ipAddress,
  userAgent
}: AuditLogEntry) {
  try {
    // In production, you might want to store this in a separate audit table
    // For now, we'll use console logging with structured data
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      resourceType,
      resourceId,
      adminUserId,
      details,
      ipAddress,
      userAgent,
      severity: getActionSeverity(action)
    }

    // Log to console (in production, send to logging service)
    console.log('AUDIT_LOG:', JSON.stringify(logEntry))

    // You could also store in database if needed:
    // await prisma.auditLog.create({ data: logEntry })

    return logEntry
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}

function getActionSeverity(action: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const highRiskActions = [
    'user_ban',
    'user_role_change',
    'listing_delete',
    'message_delete',
    'system_settings_change'
  ]
  
  const mediumRiskActions = [
    'listing_reject',
    'listing_flag',
    'message_flag',
    'user_suspend'
  ]
  
  const lowRiskActions = [
    'listing_approve',
    'listing_view',
    'message_view'
  ]

  if (highRiskActions.some(risk => action.includes(risk))) {
    return 'HIGH'
  } else if (mediumRiskActions.some(risk => action.includes(risk))) {
    return 'MEDIUM'
  } else if (lowRiskActions.some(risk => action.includes(risk))) {
    return 'LOW'
  }
  
  return 'MEDIUM' // Default
}

// Helper function to log common admin actions
export const auditActions = {
  listingApprove: (listingId: string, adminId: string, ip?: string, ua?: string) =>
    logAdminAction({
      action: 'listing_approve',
      resourceType: 'LISTING',
      resourceId: listingId,
      adminUserId: adminId,
      ipAddress: ip,
      userAgent: ua
    }),

  listingReject: (listingId: string, adminId: string, reason: string, ip?: string, ua?: string) =>
    logAdminAction({
      action: 'listing_reject',
      resourceType: 'LISTING',
      resourceId: listingId,
      adminUserId: adminId,
      details: { rejectionReason: reason },
      ipAddress: ip,
      userAgent: ua
    }),

  listingFlag: (listingId: string, adminId: string, ip?: string, ua?: string) =>
    logAdminAction({
      action: 'listing_flag',
      resourceType: 'LISTING',
      resourceId: listingId,
      adminUserId: adminId,
      ipAddress: ip,
      userAgent: ua
    }),

  messageDelete: (messageId: string, adminId: string, ip?: string, ua?: string) =>
    logAdminAction({
      action: 'message_delete',
      resourceType: 'MESSAGE',
      resourceId: messageId,
      adminUserId: adminId,
      ipAddress: ip,
      userAgent: ua
    }),

  messageFlag: (messageId: string, adminId: string, flagged: boolean, ip?: string, ua?: string) =>
    logAdminAction({
      action: flagged ? 'message_flag' : 'message_unflag',
      resourceType: 'MESSAGE',
      resourceId: messageId,
      adminUserId: adminId,
      details: { flagged },
      ipAddress: ip,
      userAgent: ua
    }),
}