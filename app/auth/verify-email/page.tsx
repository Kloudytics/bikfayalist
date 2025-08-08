'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const tokenParam = searchParams.get('token')

    if (!emailParam || !tokenParam) {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email for the correct link.')
      return
    }

    setEmail(emailParam)
    setToken(tokenParam)

    // Verify the email
    verifyEmail(emailParam, tokenParam)
  }, [searchParams])

  const verifyEmail = async (email: string, token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        toast.success('Email verified! You can now sign in.')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to verify email')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Failed to verify email. Please try again.')
    }
  }

  const resendVerification = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.')
        setMessage('New verification email sent. Please check your inbox.')
      } else {
        toast.error(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'loading' && <Loader2 className="w-12 h-12 animate-spin text-blue-600" />}
              {status === 'success' && <CheckCircle className="w-12 h-12 text-green-600" />}
              {status === 'error' && <XCircle className="w-12 h-12 text-red-600" />}
            </div>
            <CardTitle className="text-2xl font-bold">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className={
              status === 'success' ? 'border-green-200 bg-green-50' :
              status === 'error' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }>
              <AlertDescription className={
                status === 'success' ? 'text-green-800' :
                status === 'error' ? 'text-red-800' :
                'text-blue-800'
              }>
                {message}
              </AlertDescription>
            </Alert>

            {status === 'success' && (
              <div className="space-y-4">
                <div className="text-center text-sm text-gray-600">
                  Your email has been verified successfully. You can now sign in to your account.
                </div>
                <Button asChild className="w-full">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="text-center text-sm text-gray-600">
                  The verification link may have expired or is invalid.
                </div>
                <div className="flex flex-col space-y-2">
                  {email && (
                    <Button 
                      onClick={resendVerification} 
                      disabled={isResending}
                      className="w-full"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/signin">Back to Sign In</Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center text-sm text-gray-600">
                Please wait while we verify your email address...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}