'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      redirect('/')
    }
  }, [session, status])

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
      
      <div className="flex gap-4 mt-8">
        <Button asChild>
          <Link href="/admin/listings">Manage Listings</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/messages">Manage Messages</Link>  
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/advertisements">Manage Advertisements</Link>
        </Button>
      </div>
    </div>
  )
}