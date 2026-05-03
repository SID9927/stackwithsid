'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminStyles from '@/components/admin/AdminStyles'

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Collapse sidebar by default on mobile/tablet
    if (window.innerWidth <= 1024) {
      setIsCollapsed(true)
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
      } else {
        setIsLoading(false)
      }
    }
    
    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [pathname, router])

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>Loading workspace...</div>
  }

  // Hide sidebar and header on the login page
  if (pathname === '/admin/login') {
    return (
      <div className="admin-layout" style={{ display: 'block' }}>
        <AdminStyles />
        {children}
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <AdminStyles />
      
      {/* Mobile Overlay (Behind Sidebar) */}
      {!isCollapsed && (
        <div 
          className="admin-overlay" 
          onClick={() => setIsCollapsed(true)}
          style={{ zIndex: 10 }}
        />
      )}

      <main className="admin-main">
        <AdminHeader isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <div className="admin-content-wrapper">
          {children}
        </div>
      </main>

      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} zIndex={9999} />

      <style jsx>{`
        .admin-content-wrapper {
          padding: 32px 40px 80px;
          max-width: 1600px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}
