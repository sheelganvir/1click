'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import GeometricBackground from '@/components/GeometricBackground'

export default function ConnectClient({ email, extensionId }: { email: string, extensionId: string }) {
  const [status, setStatus] = useState<'connecting' | 'done' | 'error' | 'no-extension'>('connecting')
  const [errMsg, setErrMsg] = useState('')

  const attemptConnect = useCallback(async () => {
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
    } catch (e: unknown) {
      setStatus('error')
      setErrMsg(e instanceof Error ? e.message : String(e))
    }
  }, [email, extensionId])

  useEffect(() => {
    const timer = setTimeout(() => {
      attemptConnect()
    }, 0)
    return () => clearTimeout(timer)
  }, [attemptConnect])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 relative overflow-hidden font-sans">
      {/* Home Page Matching Background */}
      <GeometricBackground />

      {/* Styled Connection Card */}
      <div className="max-w-[440px] w-full bg-white border border-[#e2e8f0] p-8 sm:p-10 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] relative z-10 text-center flex flex-col items-center">
        
        {/* Logo Container with Sparkling Elements */}
        <div className="relative flex justify-center w-full mb-6">
          <span className="absolute top-4 left-[34%] text-[#22c55e] text-lg font-light leading-none select-none animate-pulse">+</span>
          <span className="absolute top-1 right-[36%] text-[#22c55e] text-xs font-light leading-none select-none animate-pulse">+</span>
          <span className="absolute bottom-5 left-[32%] text-[#22c55e] text-xs font-light leading-none select-none animate-pulse">+</span>
          <span className="absolute bottom-1 right-[34%] text-[#22c55e] text-sm font-light leading-none select-none animate-pulse">+</span>
          
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f0fdf4] border border-[#dcfce7] shadow-sm relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md border border-slate-100">
              <img src="/1click_logo.png" alt="1Click Logo" className="h-10 w-10 object-contain" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Connect Extension</h2>
        
        {/* Horizontal Divider */}
        <div className="h-px bg-slate-100 my-6 w-full"></div>

        {/* Status Views */}
        {status === 'connecting' && (
          <div className="py-6 flex flex-col items-center justify-center gap-4 w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-500">
              <svg className="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div className="text-slate-600 font-bold text-lg">
              Connecting...
            </div>
            <p className="text-slate-400 text-xs font-medium max-w-[280px]">
              Linking your 1Click profile credentials with the extension runtime...
            </p>
          </div>
        )}

        {status === 'done' && (
          <div className="w-full flex flex-col items-center">
            {/* Success checkmark inside green circle */}
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#22c55e] text-[#22c55e]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            
            <div className="text-[#15803d] font-bold text-xl mb-2">
              Successfully connected!
            </div>
            <p className="text-slate-500 text-xs font-semibold max-w-[280px] mb-8 leading-relaxed">
              Your profile is now synced with the extension.
            </p>

            {/* Go to Dashboard button */}
            <Link 
              href="/dashboard" 
              className="flex w-full items-center justify-between bg-[#1b7638] hover:bg-[#155d2c] text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(27,118,56,0.15)] hover:shadow-[0_6px_20px_rgba(27,118,56,0.2)]"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2.5"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                <span>Go to Dashboard</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full flex flex-col items-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
            </div>
            
            <div className="text-red-500 font-bold text-xl mb-2">
              Connection failed
            </div>
            <p className="text-xs font-semibold text-slate-500 max-w-[280px] mb-4">
              {errMsg || 'Extension not found or not listening.'}
            </p>
            <p className="text-slate-400 text-[11px] font-medium mb-6 leading-normal">
              Make sure the extension is installed, enabled, and matches your Extension ID.
            </p>

            <button 
              onClick={attemptConnect}
              className="flex w-full items-center justify-center bg-[#1b7638] hover:bg-[#155d2c] text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(27,118,56,0.15)]"
            >
              Retry Connection
            </button>
          </div>
        )}

        {status === 'no-extension' && (
          <div className="w-full flex flex-col items-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>
            
            <div className="text-amber-600 font-bold text-xl mb-2">
              Extension not detected
            </div>
            <p className="text-xs font-semibold text-slate-500 max-w-[280px] mb-6 leading-relaxed">
              Please install the 1ClickJobs extension first, then try again.
            </p>

            <button 
              onClick={attemptConnect}
              className="flex w-full items-center justify-center bg-[#1b7638] hover:bg-[#155d2c] text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(27,118,56,0.15)]"
            >
              Retry Connection
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
