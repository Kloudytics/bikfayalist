import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith('/api/auth')) return true
        if (req.nextUrl.pathname.startsWith('/auth')) return true
        if (req.nextUrl.pathname === '/') return true
        if (req.nextUrl.pathname.startsWith('/browse')) return true
        if (req.nextUrl.pathname.startsWith('/listing/')) return true
        
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/listings/:path*',
    '/api/admin/:path*'
  ]
}