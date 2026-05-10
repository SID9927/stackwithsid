'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * MobileSheet component
 * Renders as a bottom sheet on mobile (<= 768px) using React Portals
 * Renders as a normal absolute/relative container on desktop
 */
export default function MobileSheet({ children, onClose, extraClass = '', title = 'Options' }) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Lock body scroll when sheet is open on mobile
  useEffect(() => {
    if (!mounted) return
    if (isMobile) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      const originalTouch = window.getComputedStyle(document.body).touchAction
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      return () => {
        document.body.style.overflow = originalStyle
        document.body.style.touchAction = originalTouch
      }
    }
  }, [isMobile, mounted])

  if (!mounted) return null

  if (isMobile) {
    return createPortal(
      <>
        {/* Dimmed backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 99998,
          }}
        />
        {/* Bottom sheet */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 'auto', bottom: 0, left: 0, right: 0,
            width: '100vw', maxWidth: '100vw',
            minWidth: 'unset', margin: 0,
            borderRadius: '24px 24px 0 0',
            padding: `36px 20px calc(env(safe-area-inset-bottom, 16px) + 24px)`,
            border: '1px solid var(--border-subtle)',
            borderBottom: 'none',
            boxShadow: '0 -10px 60px rgba(0,0,0,0.6)',
            background: 'var(--bg-elevated)',
            zIndex: 99999,
            animation: 'sheetSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
            maxHeight: '60vh',
          }}
        >
          {/* Handle bar */}
          <div style={{
            position: 'absolute', top: 10, left: '50%',
            transform: 'translateX(-50%)',
            width: 40, height: 4,
            background: 'var(--border-mid)',
            borderRadius: 4,
          }} />
          
          {/* Sheet title */}
          <div style={{
            fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: '12px', paddingBottom: '10px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            {title}
          </div>

          <div className={extraClass}>
            {children}
          </div>
        </div>

        <style jsx>{`
          @keyframes sheetSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </>,
      document.body
    )
  }

  // Desktop: normal inline wrapper
  return (
    <div className={extraClass} onClick={e => e.stopPropagation()}>
      {children}
    </div>
  )
}
