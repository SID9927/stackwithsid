'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, Layers, BookOpen, MessageSquare, Wrench, PlayCircle, LogIn, Zap, ChevronRight, Mail } from 'lucide-react'
import { useTheme } from '@/lib/ThemeProvider'
import { supabase } from '@/lib/supabase'

const NAV_LINKS = [
  { href: '/articles',  label: 'Articles',  icon: BookOpen },
  { href: '/interview', label: 'Interview',  icon: Zap },
  { href: '/tools',     label: 'Tools',      icon: Wrench },
  // { href: '/discuss',   label: 'Discuss',    icon: MessageSquare },
  { href: '/videos',    label: 'Videos',     icon: PlayCircle },
  { href: '/contact',   label: 'Contact',    icon: Mail },
]

/* ── Balloon Theme Toggle ──────────────────────────────────────────── */
function BalloonToggle({ theme, toggleTheme, mounted }) {
  const [animating, setAnimating] = useState(false)
  const [showBalloon, setShowBalloon] = useState(false)
  const isDark = theme === 'dark'

  const handleClick = () => {
    if (animating) return
    setAnimating(true)
    setShowBalloon(true)
    setTimeout(() => toggleTheme(), 200) 
    setTimeout(() => { setShowBalloon(false); setAnimating(false) }, 550) 
  }

  if (!mounted) return <div style={{ width: 42, height: 42 }} />

  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence>
        {showBalloon && (
          <motion.div
            key="balloon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 200, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              animate: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              exit: { duration: 0.25 }
            }}
            style={{
              position: 'fixed',
              top: 32, right: 72,
              width: 20, height: 20,
              borderRadius: '50%',
              background: isDark ? '#fafaf9' : '#09090b',
              zIndex: 9998,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        disabled={animating}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'relative', zIndex: 9991,
          width: 42, height: 42,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Sun size={18} style={{ color: '#fbbf24' }} />
            </motion.div>
          ) : (
            <motion.div key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Moon size={18} style={{ color: '#7c3aed' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

/* ── Mobile Drawer ─────────────────────────────────────────────────── */
function MobileDrawer({ open, onClose, pathname, user, handleSignOut }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 9980,
            }}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 'min(320px, 85vw)',
              background: 'var(--bg-primary)',
              borderLeft: '1px solid var(--border-subtle)',
              zIndex: 9985,
              padding: '80px 24px 40px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            {NAV_LINKS.map(({ href, label, icon: Icon }, i) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={href} onClick={onClose} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 20px',
                      borderRadius: 16,
                      background: active ? 'hsl(270,75%,55%,0.1)' : 'var(--bg-secondary)',
                      border: `1px solid ${active ? 'hsl(270,75%,55%,0.3)' : 'var(--border-subtle)'}`,
                      color: active ? 'var(--accent)' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                    }}>
                      <Icon size={20} />
                      <span style={{ fontWeight: 600, flex: 1 }}>{label}</span>
                      <ChevronRight size={16} opacity={0.4} />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
            {user?.email === '5065sid@gmail.com' && (
              <Link href="/admin" onClick={onClose} style={{ textDecoration: 'none' }}>
                <motion.div className="mobile-nav-item" style={{ color: 'var(--accent)' }}>
                  <Layers size={20} />
                  <span>Admin Portal</span>
                </motion.div>
              </Link>
            )}
            <div style={{ flex: 1 }} />
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                <Link href="/profile/settings" onClick={onClose} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}>
                    <Zap size={20} color="var(--accent)" />
                    <span style={{ fontWeight: 600, flex: 1 }}>My Profile</span>
                  </div>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="btn-ghost" 
                  style={{ width: '100%', borderRadius: 16, height: 56, justifyContent: 'center' }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={onClose} style={{ textDecoration: 'none' }}>
                <div className="btn-primary" style={{ width: '100%', borderRadius: 16, height: 56 }}>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </div>
              </Link>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Navbar ────────────────────────────────────────────────────────── */
export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme, mounted } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    const handleScroll = () => setScrolled(window.scrollY > 20)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    
    handleScroll()
    handleResize()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 80,
          zIndex: 9970,
          padding: isMobile ? '0 6px' : '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          animate={{
            width: scrolled ? (isMobile ? 'calc(100% - 12px)' : 'min(1200px, 95%)') : '100%',
            y: scrolled ? 12 : 0,
            borderRadius: scrolled ? 24 : 0,
            padding: scrolled ? (isMobile ? '0 12px' : '0 24px') : (isMobile ? '0 20px' : '0 32px'),
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: scrolled ? 64 : 80,
            maxWidth: 1500,
            background: scrolled ? 'var(--bg-card)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
            border: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
            boxShadow: scrolled ? 'var(--shadow-card)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            pointerEvents: 'auto',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--gradient-purple)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px hsl(270,75%,55%,0.4)',
              }}>
                <Layers size={22} color="white" />
              </div>
              <div className="hidden sm:block">
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.15rem', lineHeight: 1, color: 'var(--text-primary)' }}>
                  StackWithSid
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  Dev Platform
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', gap: 4 }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 14,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                      position: 'relative',
                    }}
                  >
                    {label}
                    {active && (
                      <motion.div
                        layoutId="navActiveUnderline"
                        style={{
                          position: 'absolute',
                          bottom: 1,
                          left: '15%',
                          right: '15%',
                          height: 3,
                          background: 'var(--gradient-purple)',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px hsl(270,75%,55%,0.3)',
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
            {user?.email === '5065sid@gmail.com' && (
              <Link href="/admin" style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 14,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}
                >
                  Admin
                </motion.div>
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BalloonToggle theme={theme} toggleTheme={toggleTheme} mounted={mounted} />
            
            <div className="hidden lg:block">
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Link href="/profile/settings" style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ 
                        padding: '8px 16px',
                        borderRadius: 12,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        width: 24, height: 24, borderRadius: '50%', 
                        background: 'var(--gradient-purple)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: 'white', fontWeight: 800
                      }}>
                        {user.email[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user.email.split('@')[0]}
                      </span>
                    </motion.div>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="btn-ghost"
                    style={{ height: 42, width: 42, padding: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Sign Out"
                  >
                    <LogIn size={18} style={{ transform: 'rotate(180deg)' }} />
                  </motion.button>
                </div>
              ) : (
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    style={{ padding: '0 20px', height: 42, borderRadius: 12, fontSize: '0.85rem' }}
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </motion.div>
                </Link>
              )}
            </div>

            <button
              className="flex lg:hidden"
              onClick={() => setMobileOpen(true)}
              style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)', cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </motion.div>
      </header>

      <MobileDrawer 
        open={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        pathname={pathname} 
        user={user}
        handleSignOut={handleSignOut}
      />
    </>
  )
}
