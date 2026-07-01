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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-light-accent/30 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-cards/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-light-accent relative z-10 text-center space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-[#0B7A2A] to-primary shadow-[0_0_20px_var(--glow)] border border-accent/20 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white h-8 w-8"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">Connect Extension</h2>
        </div>
        
        {status === 'connecting' && (
          <div className="text-foreground/70 font-medium flex items-center justify-center gap-3">
            <svg className="h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Connecting to <span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span>Jobs...
          </div>
        )}
        
        {status === 'done' && (
          <div className="space-y-6">
            <div className="text-emerald-500 font-extrabold text-xl flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Successfully connected!
            </div>
            <p className="text-foreground/60 text-sm font-medium">Your profile is now synced with the extension.</p>
            <Link href="/dashboard" className="inline-block mt-2 font-extrabold text-primary hover:text-secondary drop-shadow-[0_0_5px_var(--soft-glow)] transition-colors">
              Go to Dashboard &rarr;
            </Link>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-6">
            <div className="text-red-500 font-extrabold text-xl flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Connection failed
            </div>
            <p className="text-sm font-bold text-foreground/50 bg-red-50 p-3 rounded-lg border border-red-100">{errMsg}</p>
            <p className="text-sm text-foreground/60 font-medium">Make sure the extension is installed and enabled.</p>
            <button 
              onClick={attemptConnect}
              className="w-full bg-gradient-to-b from-[#0B7A2A] to-primary text-white px-6 py-3.5 rounded-xl font-extrabold shadow-[0_4px_15px_var(--soft-glow)] hover:shadow-[0_6px_20px_var(--glow)] transition-all hover:-translate-y-0.5 active:translate-y-0 border border-primary/50"
            >
              Retry Connection
            </button>
          </div>
        )}
        
        {status === 'no-extension' && (
          <div className="space-y-6">
            <div className="text-amber-500 font-extrabold text-xl flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Extension not detected
            </div>
            <p className="text-sm text-foreground/60 font-medium">Please install the <span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span>Jobs extension first, then try again.</p>
            <button 
              onClick={attemptConnect}
              className="w-full bg-gradient-to-b from-[#0B7A2A] to-primary text-white px-6 py-3.5 rounded-xl font-extrabold shadow-[0_4px_15px_var(--soft-glow)] hover:shadow-[0_6px_20px_var(--glow)] transition-all hover:-translate-y-0.5 active:translate-y-0 border border-primary/50"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
