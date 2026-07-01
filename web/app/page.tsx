import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LoginCard from '@/components/LoginCard'
import Footer from '@/components/Footer'
import GeometricBackground from '@/components/GeometricBackground'
import ApplyButton from '@/components/ApplyButton'
import PlatformsCarousel from '@/components/PlatformsCarousel'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const resolvedSearchParams = await searchParams
  const showLogin = resolvedSearchParams.login === 'true'

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden relative">
      <GeometricBackground />
      <main className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden shrink-0">
      
      {/* Absolute Header (matches reference) */}
      <header className="absolute top-0 left-0 right-0 w-full z-50 flex items-center justify-between px-8 py-8 md:px-16">
        {/* Left: Text Titles */}
        <div className="flex items-center gap-12">
          <Link href="/" className="text-xl font-bold tracking-wider text-black hover:opacity-80 transition-opacity">
            <span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span><span className="text-primary">.</span>JOBS
          </Link>
          <div className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-black/80 leading-relaxed">
            Extension /<br />Job Autofill
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-12">
          {/* Navigation Links */}
          <nav className="flex items-center gap-8 text-sm font-bold tracking-widest text-black">
            {/* We are on the Home page, so HOME is active */}
            <Link href="/" className="text-primary group relative">
              HOME<span className="text-primary relative -top-0.5">.</span>
            </Link>
            {user ? (
              <Link href="/dashboard" className="hover:text-primary transition-colors group relative">
                DASHBOARD<span className="text-primary transition-opacity opacity-0 group-hover:opacity-100 relative -top-0.5">.</span>
              </Link>
            ) : (
              <Link href="?login=true" scroll={false} className="hover:text-primary transition-colors group relative">
                LOGIN<span className="text-primary transition-opacity opacity-0 group-hover:opacity-100 relative -top-0.5">.</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-black">
            <span>❤️ Enjoying the app?</span>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:text-[#0B7A2A] transition-colors">
              ⭐ Star on GitHub
            </a>
          </div>
        </div>
      </header>

      <img 
        src="/1click_logo.png" 
        alt="1Click" 
        style={{ 
          position: 'absolute', 
          left: '10.2%', 
          top: '21.8%', 
          width: '31.1%', 
          height: '47.3%',
          objectFit: 'contain'
        }} 
      />

      {/* Text under logo matching screenshot */}
      <div 
        className="absolute z-10 pointer-events-none"
        style={{ left: '10.2%', top: '65%', width: '31.1%' }}
      >
        <h1 className="text-xl sm:text-2xl lg:text-[1.75rem] font-extrabold text-black leading-snug tracking-tight">
          One <span className="text-primary">Click</span> Closer<br />
          to Your <span className="text-primary">Dream Job.</span>
        </h1>
      </div>

      <div 
        className="absolute z-10 pointer-events-none flex items-start gap-3"
        style={{ left: '2.9%', top: '86.5%', width: '35%' }}
      >
        <div className="text-primary mt-1 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/></svg>
        </div>
        <div>
          <p className="text-sm font-extrabold text-black tracking-wide mb-1">
            Smart. <span className="text-primary">Simple.</span> Secure.
          </p>
          <p className="text-[11px] font-bold text-black/80 leading-relaxed max-w-sm">
            Let <span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span>.JOBS autofill applications across any career site instantly<br />
            while you focus on your future.
          </p>
        </div>
      </div>
      <img 
        src="/detective.png" 
        alt="ATS Detective" 
        style={{ 
          position: 'absolute', 
          left: '70.3%', 
          top: '6.4%', 
          width: '15.3%', 
          height: '32.4%',
          objectFit: 'contain'
        }} 
        className="z-10 animate-fade-in-up drop-shadow-xl"
      />
      {showLogin ? (
        <LoginCard />
      ) : (
        <>
          {user ? (
            <ApplyButton href="/dashboard" />
          ) : (
            <ApplyButton href="?login=true" scroll={false} />
          )}
          {/* "Click here" hint pointing at the Apply button */}
          <div
            className="absolute z-20 pointer-events-none hidden sm:block"
            style={{ left: 'calc(58.9% - 180px)', top: 'calc(52.6% + 37px)', width: '220px', height: '160px' }}
          >
            <svg
              width="200"
              height="140"
              viewBox="0 0 200 140"
              fill="none"
              className="absolute left-0 top-0"
            >
              <path
                d="M8 108 C 30 65, 55 65, 78 92 C 100 118, 118 60, 150 18"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeDasharray="7 7"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M150 18 L 135 25 M150 18 L 147 35"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <p
              className="absolute top-[110px] text-3xl leading-[1.15] text-primary whitespace-nowrap"
              style={{ fontFamily: 'var(--font-caveat)', fontWeight: 700, transform: 'rotate(-4deg)', left: '-28px' }}
            >
              Click here<br />to setup profile
            </p>
          </div>
        </>
      )}
      {/* Social Media Icons */}
      <div className="absolute z-20 flex flex-col gap-[23px]" style={{ left: '92.6%', top: '50.2%', transform: 'translateY(-50%)' }}>
        {/* Twitter / X */}
        <a 
          href="#" 
          target="_blank" 
          rel="noreferrer"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-transparent border-2 border-[#1B5E20] shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-[400ms] hover:scale-110 hover:bg-[#1B5E20] hover:shadow-[0_0_25px_var(--glow)] text-[#1B5E20] hover:text-white group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-[400ms] group-hover:scale-110">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* LinkedIn */}
        <a 
          href="#" 
          target="_blank" 
          rel="noreferrer"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-transparent border-2 border-[#1B5E20] shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-[400ms] hover:scale-110 hover:bg-[#1B5E20] hover:shadow-[0_0_25px_var(--glow)] text-[#1B5E20] hover:text-white group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-[400ms] group-hover:scale-110">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>

        {/* Behance */}
        <a 
          href="#" 
          target="_blank" 
          rel="noreferrer"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-transparent border-2 border-[#1B5E20] shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-[400ms] hover:scale-110 hover:bg-[#1B5E20] hover:shadow-[0_0_25px_var(--glow)] text-[#1B5E20] hover:text-white group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-[400ms] group-hover:scale-110">
            <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.918 2.338-5.697 5.32-5.697 3.113 0 5.108 1.994 5.108 5.368v1.14h-7.722c.145 1.547 1.341 2.502 2.915 2.502 1.573 0 2.536-.599 2.872-1.638h2.172zm-5.111-5.163c-1.336 0-2.164.764-2.52 1.838h5.029c-.157-1.077-1.171-1.838-2.509-1.838zm-11.644-2.261c1.884 0 3.328 1.157 3.328 2.934 0 1.597-1.334 2.213-1.879 2.316v.058c1.335.257 2.457.977 2.457 2.622 0 2.159-2.028 3.535-4.453 3.535h-6.424v-11.465h6.971zm-4.321 4.298h2.365c1.17 0 2.083-.719 2.083-1.85 0-1.129-.912-1.85-2.083-1.85h-2.365v3.7zm0 4.779h2.518c1.474 0 2.541-.821 2.541-2.156 0-1.334-1.066-2.158-2.541-2.158h-2.518v4.314z"/>
          </svg>
        </a>
      </div>
      
      {/* Footer Text removed because it's replaced by the new global Footer component below the hero section */}

    </main>
    <PlatformsCarousel />
    <Footer />
  </div>
  )
}
