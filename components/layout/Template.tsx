'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // List of paths where header should not be shown
  const noHeaderPaths = ['/login', '/signup', '/verify-email', '/forgot-password']
  const shouldShowHeader = !noHeaderPaths.includes(pathname)

  return (
    <div className="min-h-screen bg-black text-white">
      {shouldShowHeader && <Header />}
      <main className={shouldShowHeader ? 'pt-16' : ''}>
        {children}
      </main>
      <Footer />
    </div>
  )
} 