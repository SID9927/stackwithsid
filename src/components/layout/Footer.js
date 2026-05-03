'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers, Mail, Heart, ChevronDown, AlertCircle, CheckCircle
} from 'lucide-react'
import { SiYoutube, SiGithub } from 'react-icons/si'
import { FaTwitter } from 'react-icons/fa'
import { IoArrowForward, IoGlobeOutline } from 'react-icons/io5'

const FOOTER_LINKS = {
  Content: [
    { href: '/articles',  label: 'Articles' },
    { href: '/interview', label: 'Interview Prep' },
    { href: '/tools',     label: 'Dev Tools' },
    { href: '/videos',    label: 'Videos' },
  ],
  Community: [
    { href: '/discuss',   label: 'Discussions' },
    { href: '/login',     label: 'Sign Up' },
    { href: '/profile',   label: 'Profile' },
  ],
  Connect: [
    { href: 'https://youtube.com/@stackwithsid', label: 'YouTube', external: true },
    { href: 'https://twitter.com/stackwithsid',  label: 'Twitter', external: true },
    { href: 'https://github.com/SID9927',        label: 'GitHub',  external: true },
  ],
}

function FooterColumn({ title, links }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const active = !isMobile || isOpen

  return (
    <div style={{ borderBottom: isMobile ? '1px solid var(--border-subtle)' : 'none', paddingBottom: isMobile ? 16 : 0 }}>
      <h4 
        onClick={() => isMobile && setIsOpen(!isOpen)}
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: isMobile ? (isOpen ? 16 : 0) : 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isMobile ? 'pointer' : 'default',
          userSelect: 'none',
          padding: isMobile ? '8px 0' : 0,
        }}
      >
        {title}
        {isMobile && (
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <ChevronDown size={14} />
          </motion.div>
        )}
      </h4>
      
      <AnimatePresence initial={false}>
        {active && (
          <motion.ul
            initial={isMobile ? { height: 0, opacity: 0, marginTop: 0 } : false}
            animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              listStyle: 'none', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 10,
              overflow: 'hidden'
            }}
          >
            {links.map(({ href, label, external }) => (
              <li key={href}>
                <Link
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    padding: isMobile ? '4px 0' : 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  className={`footer-link ${external ? 'link-with-icon' : ''}`}
                >
                  <span className="footer-link-text">{label}</span>
                  {external && (
                    <motion.span className="footer-link-icon">
                      <IoArrowForward size={13} style={{ transform: 'rotate(-45deg)' }} />
                    </motion.span>
                  )}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState('idle') // idle, loading, success, error
  const [newsletterError, setNewsletterError] = useState('')
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || pathname?.startsWith('/admin')) return null

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) {
      setNewsletterError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterError('Enter a valid email')
      return
    }
    
    setNewsletterStatus('loading')
    // Simulate API call
    setTimeout(() => {
      setNewsletterStatus('success')
      setNewsletterEmail('')
      setTimeout(() => setNewsletterStatus('idle'), 3000)
    }, 1000)
  }

  const handleNewsletterChange = (e) => {
    setNewsletterEmail(e.target.value)
    if (newsletterError) setNewsletterError('')
  }
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient orb */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, hsl(270,75%,55%,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1500,
        margin: '0 auto',
        padding: '64px 24px 32px',
        position: 'relative',
      }}>
        {/* Top section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 48,
          marginBottom: 56,
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: 'var(--gradient-purple)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 12px hsl(270,75%,55%,0.4)',
                }}>
                  <Layers size={18} color="white" />
                </div>
                <span style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  background: 'var(--gradient-purple)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  StackWithSid
                </span>
              </div>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>
              A modern tech platform {"\u2014"} articles, interview prep, tools, and community for developers.
            </p>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 10 }}>
                {[
                { href: 'https://youtube.com/@stackwithsid', icon: SiYoutube, label: 'YouTube' },
                { href: 'https://twitter.com/stackwithsid',  icon: FaTwitter, label: 'Twitter / X' },
                { href: 'https://github.com/SID9927',        icon: SiGithub,  label: 'GitHub' },
                { href: 'https://dsiddharth.in',             icon: IoGlobeOutline,   label: 'Portfolio' },
                { href: 'mailto:hello@dsiddharth.in',        icon: Mail,    label: 'Email' },
              ].map(({ href, icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    transition: 'color 0.2s ease, border-color 0.2s ease',
                  }}
                  aria-label={label}
                  className="social-icon"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <FooterColumn key={section} title={section} links={links} />
          ))}

          {/* Newsletter */}
          <div style={{ gridColumn: 'span 1' }}>
            <h4 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 16,
            }}>
              Stay Updated
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>
              Get the latest articles and updates delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} style={{ position: 'relative' }} noValidate>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={handleNewsletterChange}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: newsletterError ? 44 : 44,
                    borderRadius: 12,
                    background: 'var(--bg-primary)',
                    border: newsletterError ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  className="newsletter-input"
                />
                {newsletterError && (
                  <div style={{
                    position: 'absolute',
                    right: 48,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ef4444',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <AlertCircle size={14} />
                  </div>
                )}
                <button 
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: 4,
                    bottom: 4,
                    width: 36,
                    borderRadius: 8,
                    background: newsletterStatus === 'success' ? '#10b981' : 'var(--gradient-purple)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: newsletterStatus === 'loading' ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px hsla(270,75%,55%,0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {newsletterStatus === 'success' ? <CheckCircle size={18} /> : <IoArrowForward size={18} style={{ transform: 'rotate(-45deg)' }} />}
                </button>
              </div>
              {newsletterError && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    position: 'absolute', 
                    bottom: -18, 
                    right: 4, 
                    color: '#ef4444', 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    fontStyle: 'italic' 
                  }}
                >
                  {newsletterError}
                </motion.span>
              )}
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ marginBottom: 24 }} />

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          textAlign: 'center'
        }} className="footer-bottom">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', width: 'auto' }}>
            {"\u00A9"} {new Date().getFullYear()} StackWithSid {"\u00B7"}{" "}
            <a href="mailto:hello@dsiddharth.in" style={{ color: 'inherit', textDecoration: 'none' }} className="footer-bottom-link">
              hello@dsiddharth.in
            </a>
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}>
            Made with <Heart size={12} style={{ color: 'var(--accent)' }} fill="currentColor" /> by Sid
          </p>
        </div>
      </div>

      <style jsx>{`
        .social-icon:hover { color: var(--accent) !important; border-color: var(--border-accent) !important; }
        :global(.footer-link) { 
          position: relative; 
          display: inline-flex !important; 
          align-items: center; 
          gap: 0; 
          width: max-content;
        }
        :global(.footer-link-text) {
          position: relative;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease;
          display: inline-flex;
          align-items: center;
        }
        :global(.footer-link:not(.link-with-icon) .footer-link-text::before) {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          position: absolute;
          left: -14px;
          top: 50%;
          transform: translateY(-50%) translateX(-8px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        :global(.footer-link:not(.link-with-icon):hover .footer-link-text) { 
          transform: translateX(14px);
        }
        :global(.footer-link:not(.link-with-icon):hover .footer-link-text::before) {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
        :global(.footer-link.link-with-icon .footer-link-icon) {
          display: flex;
          align-items: center;
          margin-left: 4px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease;
        }
        :global(.footer-link.link-with-icon:hover .footer-link-icon) {
          transform: translate(2px, -2px);
          color: var(--accent) !important;
        }
        :global(.footer-link:hover .footer-link-text) { 
          color: var(--accent) !important;
        }
        :global(.footer-link:hover) { 
          color: var(--accent) !important;
          text-decoration: none !important; 
        }
        :global(.footer-bottom-link:hover) {
          color: var(--accent) !important;
        }
        @media (max-width: 640px) {
          .footer-bottom { justify-content: center !important; }
          .footer-bottom p { width: 100% !important; }
        }
      `}</style>
    </footer>
  )
}
