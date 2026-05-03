'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, ArrowLeft, TerminalSquare, Sun, Moon } from 'lucide-react'
import InteractiveSwarm from '@/components/animations/InteractiveSwarm'
import { useTheme } from '@/lib/ThemeProvider'

export default function NotFound() {
  const { theme, toggleTheme, mounted } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  return (
    <div className="not-found-page">
      {/* Global overrides for this page only */}
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh !important;
        }
        header, footer {
          display: none !important;
        }
        /* Override Next.js layout wrappers and PageWrapper inline styles */
        #__next, #root, [data-reactroot], body > div:first-child, main {
          height: 100vh !important;
          padding-top: 0 !important;
          margin: 0 !important;
          min-height: 0 !important;
        }
      `}</style>

      {/* Theme Toggle Button */}
      {isMounted && mounted && (
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <Sun size={20} style={{ color: '#fbbf24' }} />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Moon size={20} style={{ color: '#7c3aed' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      )}

      {/* Hero Swarm Animation */}
      <div className="bg-decorations">
        <InteractiveSwarm count={12000} />
      </div>

      <div className="content-wrapper">
        <motion.div 
          className="error-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="error-code">404</div>
          <div className="terminal-badge">
            <TerminalSquare size={16} />
            <span>ERR_PAGE_NOT_FOUND</span>
          </div>
          
          <h1 className="error-title">Looks like you're lost in the void.</h1>
          <p className="error-desc">
            The page you are looking for has been moved, deleted, or never existed in the first place.
          </p>

          <div className="action-buttons">
            <button 
              onClick={() => window.history.back()} 
              className="btn-ghost"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            <Link href="/" className="btn-primary">
              <Home size={18} />
              Return Home
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .not-found-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
          padding: 20px;
        }

        .bg-decorations {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          /* InteractiveSwarm manages its own pointer events */
        }

        .theme-toggle-btn {
          position: absolute;
          top: 32px;
          right: 32px;
          width: 48px;
          height: 48px;    
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 50;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover {
          transform: scale(1.05); 
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 800px;
          pointer-events: none; /* Let clicks pass through to the swarm where possible */
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 60px 20px;
          pointer-events: auto; /* Enable clicks on the text/buttons */
        }

        .error-code {
          font-family: Syne, sans-serif;
          font-size: clamp(8rem, 20vw, 15rem);
          font-weight: 800;
          line-height: 1;
          background: var(--gradient-purple);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 24px;
          letter-spacing: -0.04em;
          text-shadow: 0 10px 40px rgba(124, 58, 237, 0.2);
        }

        .terminal-badge {
          display: flex;
          align-items: center;
          width: fit-content;
          gap: 8px;
          background: var(--bg-card);
          padding: 8px 16px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--accent);
          border: 1px solid var(--border-subtle);
          margin-bottom: 32px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .error-title {
          font-family: Syne, sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .error-desc {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 48px;
          max-width: 600px;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--accent);
          color: #fff;
          padding: 16px 32px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 1.05rem;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4);
        }

        .btn-ghost {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          color: var(--text-primary);
          padding: 16px 32px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 1.05rem;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid var(--border-mid);
          cursor: pointer;
        }

        .btn-ghost:hover {
          background: var(--bg-elevated);
          border-color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .action-buttons {
            flex-direction: column;
            width: 100%;
          }
          .btn-primary, .btn-ghost {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
