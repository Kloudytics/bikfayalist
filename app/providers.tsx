'use client'

import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      // Add basePath for better compatibility
      basePath="/api/auth"
      // Reduce refetch interval to prevent issues
      refetchInterval={5 * 60}
      // Ensure session is refreshed on window focus
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}