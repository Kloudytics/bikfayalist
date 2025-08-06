import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page not found
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Go to homepage</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/browse">Browse listings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}