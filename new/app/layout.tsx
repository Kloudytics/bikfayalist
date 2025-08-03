import './globals.css'
import type { Metadata } from 'next/types'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/sonner'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BikfayaList - Buy, Sell, Trade Locally',
  description: 'The premier classified listing platform for buying, selling, and trading items locally. Find great deals and connect with your community.',
  keywords: 'classified ads, buy sell, marketplace, local trading, classified listings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}