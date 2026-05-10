'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MobileSheet from '@/components/ui/MobileSheet'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function CustomDropdown({ value, options, onChange, label, icon: Icon, upward = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const isMobile = useIsMobile()

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: upward ? rect.top + window.scrollY : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  useEffect(() => {
    if (isOpen && !isMobile) {
      updateCoords()
      window.addEventListener('scroll', updateCoords)
      window.addEventListener('resize', updateCoords)
    }
    return () => {
      window.removeEventListener('scroll', updateCoords)
      window.removeEventListener('resize', updateCoords)
    }
  }, [isOpen, isMobile])

  useEffect(() => {
    if (isMobile) return
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        const portalMenu = document.querySelector('.dd-portal-menu')
        if (portalMenu && portalMenu.contains(event.target)) return
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile])

  const handleSelect = (opt) => {
    onChange(opt)
    setIsOpen(false)
  }

  const optionList = options.map(opt => (
    <li
      key={opt}
      className={`dd-item ${value === opt ? 'selected' : ''}`}
      onClick={() => handleSelect(opt)}
    >
      <span>{opt}</span>
      {value === opt && <CheckCircle2 size={14} className="dd-check" />}
    </li>
  ))

  const desktopMenu = (
    <AnimatePresence>
      {isOpen && !isMobile && (
        <motion.ul
          className={`dd-menu dd-portal-menu ${upward ? 'upward' : ''}`}
          initial={{ opacity: 0, y: upward ? 8 : -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: upward ? 8 : -8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: upward ? coords.top - 6 : coords.top + 6,
            left: coords.left,
            width: coords.width,
            transform: upward ? 'translateY(-100%)' : 'none',
            zIndex: 99999
          }}
        >
          {optionList}
        </motion.ul>
      )}
    </AnimatePresence>
  )

  return (
    <div className="custom-dropdown-container" ref={containerRef}>
      <label className="dropdown-label">{Icon && <Icon size={14} />} {label}</label>
      <button
        ref={triggerRef}
        type="button"
        className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`arrow ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && isMobile && (
        <MobileSheet onClose={() => setIsOpen(false)} title={label}>
          <ul className="dd-mobile-list">{optionList}</ul>
        </MobileSheet>
      )}

      {typeof document !== 'undefined' && createPortal(desktopMenu, document.body)}

      <style jsx>{`
        .custom-dropdown-container { margin-bottom: 24px; position: relative; }

        .dropdown-label {
          display: flex; align-items: center; gap: 8px;
          color: var(--text-secondary); font-weight: 600; font-size: 0.85rem; margin-bottom: 8px;
        }

        .dropdown-trigger {
          width: 100%; height: 44px;
          background: var(--bg-secondary); border: 1px solid var(--border-subtle);
          border-radius: 10px; padding: 0 14px;
          color: var(--text-primary);
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: all 0.2s; font-size: 0.9rem;
          font-weight: 500;
        }
        .dropdown-trigger:hover { border-color: var(--accent); background: var(--bg-primary); }
        .dropdown-trigger.active { border-color: var(--accent); background: var(--bg-primary); box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .arrow { color: var(--text-muted); transition: transform 0.25s; }
        .arrow.rotate { transform: rotate(180deg); color: var(--accent); }

        :global(.dd-menu) {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 4px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.1);
          list-style: none; margin: 0;
          max-height: 220px; overflow-y: auto; overflow-x: hidden;
        }
        :global(.dd-menu::-webkit-scrollbar) { width: 4px; }
        :global(.dd-menu::-webkit-scrollbar-thumb) { background: rgba(124, 58, 237, 0.2); border-radius: 4px; }

        :global(.dd-item) {
          padding: 9px 12px; border-radius: 8px;
          color: var(--text-secondary); font-size: 0.875rem; font-weight: 500;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: background 0.15s, color 0.15s;
          list-style: none;
        }
        :global(.dd-item:hover) { background: rgba(124,58,237,0.08); color: var(--text-primary); }
        :global(.dd-item.selected) { background: rgba(124,58,237,0.14); color: var(--accent-soft); font-weight: 700; }
        :global(.dd-check) { color: var(--accent); flex-shrink: 0; }

        :global(.dd-mobile-list) { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
        :global(.dd-mobile-list .dd-item) {
          padding: 14px 16px; border-radius: 12px;
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          font-size: 0.95rem;
        }
        :global(.dd-mobile-list .dd-item.selected) {
          background: rgba(124,58,237,0.1); border-color: var(--accent-soft);
        }
      `}</style>
    </div>
  )
}
