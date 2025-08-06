'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Don't log sensitive information in production
      console.error('Global error occurred:', {
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error('Global error:', error)
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong!
            </h1>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. Our team has been notified and is working to fix this issue.
            </p>
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
              <a
                href="/"
                className="block w-full text-blue-600 hover:text-blue-800 transition-colors"
              >
                Return to homepage
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Error ID: {error.digest || 'N/A'}
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}