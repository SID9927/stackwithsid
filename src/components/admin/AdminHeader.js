'use client'

import { motion } from 'framer-motion'
import { PanelLeftOpen, PanelLeftClose, Layers, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/ThemeProvider'

export default function AdminHeader({ isCollapsed, onToggle }) {
  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="mobile-toggle" onClick={onToggle}>
          <PanelLeftOpen size={22} />
        </button>
      </div>

      <div className="header-center">
        <div className="header-brand">
          <div className="header-logo">
            <Layers size={18} color="white" />
          </div>
          <div className="header-brand-text">
            <h2>SidCMS</h2>
            <span>Admin Portal</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {mounted && (
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      </div>

      <style jsx>{`
        .admin-header {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: rgba(17, 17, 20, 0.8);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        :global(.light) .admin-header {
          background: rgba(255, 255, 255, 0.7);
          border-bottom: 1px solid var(--border-subtle);
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .mobile-toggle {
          display: none;
          width: 40px; height: 40px; border-radius: 12px;
          align-items: center; justify-content: center;
          background: var(--bg-secondary); border: 1px solid var(--border-subtle);
          color: var(--text-muted); cursor: pointer; transition: all 0.3s;
        }
        .mobile-toggle:hover { color: var(--accent); border-color: var(--accent); }

        @media (max-width: 1024px) {
          .mobile-toggle { display: flex; }
        }

        .header-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-logo {
          width: 32px;
          height: 32px;
          background: var(--gradient-purple);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(124, 58, 237, 0.2);
        }

        .header-brand-text {
          display: flex;
          flex-direction: column;
          font-family: var(--font-syne);
        }

        .header-brand-text h2 {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
          line-height: 1;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }

        .header-brand-text span {
          font-size: 0.6rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-top: 2px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .theme-toggle-btn {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: 1px solid transparent;
          color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
        }
        .theme-toggle-btn:hover {
          background: var(--bg-elevated);
          color: var(--accent);
          border-color: var(--border-subtle);
        }
      `}</style>
    </header>
  )
}
