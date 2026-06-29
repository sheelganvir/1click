'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ConnectClient({ email, extensionId }: { email: string, extensionId: string }) {
  const [status, setStatus] = useState<'connecting' | 'done' | 'error' | 'no-extension'>('connecting')
  const [errMsg, setErrMsg] = useState('')

  const attemptConnect = async () => {
    setStatus('connecting')
    setErrMsg('')
    
    if (!(window as any).chrome || !(window as any).chrome.runtime) {
      setStatus('no-extension')
      return
    }

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      setStatus('error')
      setErrMsg('No active session found.')
      return
    }

    const payload = {
      type: 'SESSION',
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
        email: email
      }
    }

    try {
      (window as any).chrome.runtime.sendMessage(extensionId, payload, (response: any) => {
        if ((window as any).chrome.runtime.lastError) {
          setStatus('error')
          setErrMsg((window as any).chrome.runtime.lastError.message || 'Extension not found or not listening.')
        } else if (response && response.ok) {
          setStatus('done')
        } else {
          setStatus('error')
          setErrMsg('Extension rejected the connection.')
        }
      })
    } catch (e: any) {
      setStatus('error')
      setErrMsg(e.message)
    }
  }

  useEffect(() => {
    attemptConnect()
  }, [])

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm text-center space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Connect Extension</h2>
      
      {status === 'connecting' && (
        <div className="text-gray-600">Connecting to Job Autofill extension...</div>
      )}
      
      {status === 'done' && (
        <div className="space-y-4">
          <div className="text-green-600 font-medium text-lg">Successfully connected!</div>
          <p className="text-gray-600 text-sm">Your profile is now synced with the extension.</p>
          <Link href="/dashboard" className="inline-block mt-4 text-indigo-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      )}
      
      {status === 'error' && (
        <div className="space-y-4">
          <div className="text-red-600 font-medium">Connection failed</div>
          <p className="text-sm text-gray-500">{errMsg}</p>
          <p className="text-sm text-gray-600">Make sure the extension is installed and enabled.</p>
          <button 
            onClick={attemptConnect}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}
      
      {status === 'no-extension' && (
        <div className="space-y-4">
          <div className="text-amber-600 font-medium">Extension not detected</div>
          <p className="text-sm text-gray-600">Please install the Job Autofill extension first, then try again.</p>
          <button 
            onClick={attemptConnect}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
