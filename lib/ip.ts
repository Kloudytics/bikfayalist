import { NextRequest } from 'next/server'

/**
 * Extract the real client IP address from a Next.js request
 * Handles various proxy headers and edge cases
 */
export function getClientIP(req: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip') // Cloudflare
  const xClientIP = req.headers.get('x-client-ip')
  const xForwardedFor = req.headers.get('x-forwarded-for')
  
  // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Real IP header (nginx proxy)
  if (realIP) {
    return realIP
  }
  
  // X-Client-IP
  if (xClientIP) {
    return xClientIP
  }
  
  // X-Forwarded-For can contain multiple IPs, take the first one
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    return ips[0]
  }
  
  // X-Forwarded-For alternative
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim())
    return ips[0]
  }
  
  // Fallback to remote address header or localhost
  const remoteAddr = req.headers.get('remote-addr') || '127.0.0.1'
  
  return remoteAddr
}

/**
 * Hash an IP address for privacy compliance
 * Useful for GDPR compliance while maintaining uniqueness
 */
export function hashIP(ip: string): string {
  // Simple hash function for demo - in production use crypto.subtle or similar
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}