'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function AuthDebug() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState('')
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setCookies(document.cookie)
    }
  }, [])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [`${timestamp}: ${message}`, ...prev])
  }
  
  const testSignOut = async () => {
    addLog('Attempting signOut...')
    try {
      await signOut({ redirect: false })
      addLog('SignOut completed')
    } catch (error) {
      addLog(`SignOut error: ${error}`)
    }
  }
  
  const testSignOutWithRedirect = async () => {
    addLog('Attempting signOut with redirect...')
    try {
      await signOut({ callbackUrl: '/auth/signin' })
      addLog('SignOut with redirect completed')
    } catch (error) {
      addLog(`SignOut with redirect error: ${error}`)
    }
  }
  
  const clearCookies = () => {
    addLog('Clearing cookies manually...')
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    window.location.reload()
  }
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug Console</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Session Status</h3>
            <div>Status: <span className="font-mono">{status}</span></div>
            <div>User ID: <span className="font-mono">{session?.user?.id || 'null'}</span></div>
            <div>User Role: <span className="font-mono">{session?.user?.role || 'null'}</span></div>
            <div>User Email: <span className="font-mono">{session?.user?.email || 'null'}</span></div>
          </div>
          
          <div className="bg-white p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Environment</h3>
            <div>Origin: <span className="font-mono">{typeof window !== 'undefined' ? window.location.origin : 'server'}</span></div>
            <div>NODE_ENV: <span className="font-mono">{process.env.NODE_ENV}</span></div>
            <div>Path: <span className="font-mono">{typeof window !== 'undefined' ? window.location.pathname : 'server'}</span></div>
          </div>
          
          <div className="bg-white p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Test Actions</h3>
            <div className="space-y-2">
              <Button onClick={testSignOut} variant="outline" className="w-full">
                Test SignOut (no redirect)
              </Button>
              <Button onClick={testSignOutWithRedirect} variant="outline" className="w-full">
                Test SignOut (with redirect)
              </Button>
              <Button onClick={clearCookies} variant="destructive" className="w-full">
                Clear All Cookies Manually
              </Button>
              <Button onClick={() => window.location.reload()} variant="secondary" className="w-full">
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Full Session Object</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-48">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Cookies</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-32">
              {cookies || 'No cookies found'}
            </pre>
          </div>
          
          <div className="bg-white p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Debug Log</h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-64 space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="font-mono text-xs border-b border-gray-200 pb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}