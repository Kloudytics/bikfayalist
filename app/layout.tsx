import './globals.css'
import type { Metadata } from 'next/types'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Providers>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </Providers>
          <Toaster />
        </div>
      </body>
    </html>
  )
}