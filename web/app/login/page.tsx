'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    
    let error
    if (type === 'login') {
      const res = await supabase.auth.signInWithPassword({ email, password })
      error = res.error
    } else {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        }
      })
      error = res.error
    }
    
    if (error) {
      setMsg(error.message)
    } else {
      if (type === 'signup') {
        setMsg('Check your email for a confirmation link, or log in if auto-confirm is enabled.')
      } else {
        window.location.href = next
      }
    }
    setLoading(false)
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    })
    if (error) setMsg(error.message)
    else setMsg('Magic link sent!')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">Sign In</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={e => handleEmailLogin(e, 'login')}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Log In
            </button>
            <button 
              onClick={e => handleEmailLogin(e, 'signup')}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
          
          <button 
            type="button"
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full border border-indigo-600 text-indigo-600 py-2 rounded-md hover:bg-indigo-50 disabled:opacity-50"
          >
            Send Magic Link
          </button>
        </form>
        
        {msg && <p className="text-center text-sm text-red-600 font-medium">{msg}</p>}
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
