import { NextRequest, NextResponse } from 'next/server'
import { getSecurityHeaders } from '@/lib/security'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Create response
  const response = NextResponse.next()

  // Add security headers to all responses
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // CORS configuration
  const origin = request.headers.get('origin')
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ]

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    // Check if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    )

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }
  }

  // Additional security for admin routes
  if (pathname.startsWith('/admin')) {
    // Add extra security headers for admin panel
    response.headers.set('X-Admin-Protection', 'enabled')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  }

  // Block common attack patterns
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burpsuite/i,
    /acunetix/i
  ]

  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return response
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match admin routes
    '/admin/:path*',
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}