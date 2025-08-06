import './globals.css'
import type { Metadata } from 'next/types'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BikfayaList - Buy, Sell, Trade in Bikfaya & Surrounding Areas',
  description: 'The premier classified listing platform for Bikfaya, Lebanon. Buy, sell, and trade items locally in Bikfaya, Mazraat Yachou, Beit Chabeb, and surrounding villages. Connect with your local community.',
  keywords: 'Bikfaya, Lebanon, classified ads, buy sell, marketplace, local trading, classified listings, Mazraat Yachou, Beit Chabeb',
  authors: [{ name: 'BikfayaList Team' }],
  creator: 'BikfayaList',
  publisher: 'BikfayaList',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bikfayalist.com',
    siteName: 'BikfayaList',
    title: 'BikfayaList - Buy, Sell, Trade in Bikfaya & Surrounding Areas',
    description: 'The premier classified listing platform for Bikfaya, Lebanon. Connect with your local community and find great deals.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BikfayaList - Local Classified Listings for Bikfaya, Lebanon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BikfayaList - Buy, Sell, Trade in Bikfaya & Surrounding Areas',
    description: 'The premier classified listing platform for Bikfaya, Lebanon. Connect with your local community.',
    images: ['/og-image.jpg'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
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