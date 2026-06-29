import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-indigo-600">Job Autofill</h1>
        <p className="text-xl text-gray-600">
          The completely free, AI-powered system that autofills job applications.
        </p>
        
        <div className="pt-8">
          {user ? (
            <Link href="/dashboard" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
