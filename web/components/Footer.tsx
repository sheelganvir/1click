import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-white relative overflow-hidden pt-12 pb-6 border-t border-light-accent/30">
      {/* Optional faint background overlay if needed to match the geometric shapes, but for now we keep it clean white */}
      
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12">
          
          {/* Column 1: Brand & Info (Span 3) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-start">
            <div className="text-4xl font-black tracking-tighter mb-4">
              <span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span>
            </div>
            
            <p className="text-sm font-extrabold text-[#0B7A2A] mb-1">
              Privacy-first. AI-powered.
            </p>
            <p className="text-sm font-extrabold text-black mb-4">
              Applications made effortless.
            </p>
            
            <p className="text-[12px] font-bold text-black/60 leading-relaxed max-w-sm mb-6">
              <span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span> is a privacy-first, AI-powered Chrome extension and Next.js dashboard that autofills complex job applications across major ATS platforms.
            </p>
            
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-accent text-[10px] font-bold text-black/70 bg-white shadow-sm w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B7A2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Secure
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-accent text-[10px] font-bold text-black/70 bg-white shadow-sm w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B7A2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  AI-Powered
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* X */}
                <a href="#" className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-light-accent text-primary hover:bg-[#0B7A2A] hover:text-white hover:border-[#0B7A2A] transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-light-accent text-primary hover:bg-[#0B7A2A] hover:text-white hover:border-[#0B7A2A] transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* GitHub */}
                <a href="#" className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-light-accent text-primary hover:bg-[#0B7A2A] hover:text-white hover:border-[#0B7A2A] transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                </a>
                {/* Email */}
                <a href="#" className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-light-accent text-primary hover:bg-[#0B7A2A] hover:text-white hover:border-[#0B7A2A] transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Column 2: Links (Span 6) */}
          <div className="lg:col-span-5 xl:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-6 xl:gap-8">
            {/* Product */}
            <div className="flex flex-col">
              <h3 className="text-[12px] font-extrabold text-[#0B7A2A] mb-4 flex items-center gap-2 whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
                Product
              </h3>
              <ul className="space-y-3 text-[11px] font-bold text-black/70 whitespace-nowrap">
                <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Chrome Extension</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Roadmap</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            {/* For Users */}
            <div className="flex flex-col">
              <h3 className="text-[12px] font-extrabold text-[#0B7A2A] mb-4 flex items-center gap-2 whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                For Users
              </h3>
              <ul className="space-y-3 text-[11px] font-bold text-black/70 whitespace-nowrap">
                <li><Link href="#" className="hover:text-primary transition-colors">Use Cases</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Supported ATS</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Getting Started</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div className="flex flex-col">
              <h3 className="text-[12px] font-extrabold text-[#0B7A2A] mb-4 flex items-center gap-2 whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Resources
              </h3>
              <ul className="space-y-3 text-[11px] font-bold text-black/70 whitespace-nowrap">
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Application Tips</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">ATS List</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Templates</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Release Notes</Link></li>
              </ul>
            </div>
            
            {/* For Developers */}
            <div className="flex flex-col">
              <h3 className="text-[12px] font-extrabold text-[#0B7A2A] mb-4 flex items-center gap-2 whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                For Developers
              </h3>
              <ul className="space-y-3 text-[11px] font-bold text-black/70 whitespace-nowrap">
                <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">API (Coming Soon)</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Open Source</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contribute</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Report an Issue</Link></li>
              </ul>
            </div>
            
          </div>
          
          {/* Column 3: Newsletter & Extension (Span 3) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col items-start xl:items-end">
            <div className="w-full xl:max-w-[280px]">
              <h3 className="text-[12px] font-extrabold text-[#0B7A2A] mb-3 flex items-center gap-2 whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Stay in the Loop
              </h3>
              <p className="text-[11px] font-bold text-black/70 mb-4 leading-relaxed">
                Get the latest updates, features, and application tips.
              </p>
              
              <form className="w-full flex mb-6">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full rounded-l-lg border border-r-0 border-light-accent px-4 py-2.5 text-[11px] font-bold text-black placeholder:text-black/30 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-[#0B7A2A] text-white px-4 rounded-r-lg hover:bg-primary transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>
              
              <a href="#" className="w-full group">
                <div className="flex items-center justify-between p-3 rounded-xl border border-light-accent bg-white shadow-sm hover:shadow-md hover:border-accent transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 flex items-center justify-center">
                      {/* Basic Chrome Logo SVG reproduction for the aesthetic */}
                      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#4285F4" d="M24 12c0-6.627-5.373-12-12-12v12h12z"/>
                        <path fill="#0F9D58" d="M12 24c6.627 0 12-5.373 12-12H12v12z"/>
                        <path fill="#F4B400" d="M0 12C0 18.627 5.373 24 12 24V12H0z"/>
                        <path fill="#DB4437" d="M12 0C5.373 0 0 5.373 0 12h12V0z"/>
                        <circle fill="white" cx="12" cy="12" r="5.5"/>
                        <circle fill="#4285F4" cx="12" cy="12" r="4.5"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-black group-hover:text-primary transition-colors"><span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span> Chrome Extension</span>
                      <span className="text-[9px] font-bold text-black/50">Available on Chrome Web Store</span>
                    </div>
                  </div>
                  <div className="text-black/30 group-hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              </a>
            </div>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-light-accent flex flex-col md:flex-row items-center justify-between gap-6 pb-2">
          
          {/* Left: Lock & Text */}
          <div className="flex items-center gap-4 flex-1 justify-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-accent/30 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-primary">Your data stays yours.</span>
              <span className="text-[10px] font-bold text-black/60">We never store your personal information without your permission.</span>
            </div>
          </div>
          
          {/* Center: Copyright & Links */}
          <div className="flex flex-col items-center justify-center gap-3 flex-1">
            <div className="text-[11px] font-extrabold text-black">
              © 2025 <span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span>. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-[10px] font-extrabold text-black">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <span className="text-primary">•</span>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <span className="text-primary">•</span>
              <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
            </div>
          </div>

          {/* Right: Credits */}
          <div className="flex items-center justify-end gap-6 flex-1">
            {/* Very faint separator */}
            <div className="hidden md:block h-10 w-[1px] bg-light-accent/50"></div>
            
            <div className="flex flex-col items-start gap-1">
              <div className="text-[11px] font-extrabold text-black">
                A Product by <span className="text-[#0B7A2A]">1</span><span className="text-black">Click</span> Company
              </div>
              <div className="text-[11px] font-extrabold text-black flex items-center gap-1.5">
                Made by <span className="text-primary">Sheel Ganvir</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </footer>
  )
}
