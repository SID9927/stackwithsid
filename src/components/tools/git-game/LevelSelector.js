'use client'
/**
 * LevelSelector.js
 * Custom compact dropdown for selecting game levels.
 * Replaces the native <select> with a searchable, styled panel.
 */
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, Lock } from 'lucide-react'

export default function LevelSelector({ levels, currentIndex, completedLevels, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const dropdownRef = useRef(null)
  const filterRef = useRef(null)

  const activeLevel = levels[currentIndex]

  // Helper to determine if a level is unlocked
  const isLevelUnlocked = (idx) => {
    if (idx === 0) return true
    const prevLevelId = levels[idx - 1].id
    return completedLevels.includes(prevLevelId)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setFilter('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && filterRef.current) {
      setTimeout(() => filterRef.current?.focus(), 50)
    }
  }, [isOpen])

  // ESC closes dropdown
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen])

  const filtered = levels.filter(l =>
    l.title.toLowerCase().includes(filter.toLowerCase()) ||
    String(l.id).includes(filter)
  )

  const shortTitle = (title) => {
    // Shorten "1. Initialize Repository" → "Initialize Repository"
    return title.replace(/^\d+\.\s+/, '')
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setFilter('') }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border-subtle)'}`,
          color: 'var(--text-primary)', padding: '8px 12px',
          borderRadius: isOpen ? '10px 10px 0 0' : 10,
          fontSize: '0.78rem', cursor: 'pointer', gap: 8,
          transition: 'border-color 0.15s',
          outline: 'none'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden', flex: 1 }}>
          {completedLevels.includes(activeLevel?.id) && (
            <Check size={11} style={{ color: '#10b981', flexShrink: 0 }} />
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', flexShrink: 0 }}>
            #{activeLevel?.id}
          </span>
          <span style={{
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', color: 'var(--text-primary)'
          }}>
            {activeLevel ? shortTitle(activeLevel.title) : 'Select level'}
          </span>
        </span>
        <ChevronDown
          size={13}
          style={{
            flexShrink: 0, color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s'
          }}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'var(--bg-card)',
          border: '1px solid var(--accent)',
          borderTop: '1px solid var(--border-subtle)',
          borderRadius: '0 0 10px 10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}>
          {/* Search bar */}
          <div style={{
            padding: '8px 10px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Search size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={filterRef}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search levels…"
              style={{
                flex: 1, background: 'none', border: 'none',
                color: 'var(--text-primary)', fontSize: '0.72rem',
                outline: 'none', fontFamily: 'inherit'
              }}
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>

          {/* Options list */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                No levels match
              </div>
            ) : filtered.map(level => {
              const idx = levels.findIndex(l => l.id === level.id)
              const isDone = completedLevels.includes(level.id)
              const isActive = idx === currentIndex
              const isLocked = !isLevelUnlocked(idx)
              return (
                <button
                  key={level.id}
                  onClick={() => {
                    if (!isLocked) {
                      onChange(idx)
                      setIsOpen(false)
                      setFilter('')
                    }
                  }}
                  disabled={isLocked}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 12px',
                    background: isActive ? 'rgba(124,58,237,0.1)' : 'none',
                    border: 'none',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    color: isLocked ? 'var(--text-muted)' : isActive ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: '0.73rem',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.4 : 1,
                    textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => { if (!isActive && !isLocked) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={e => { if (!isActive && !isLocked) e.currentTarget.style.background = 'none' }}
                >
                  {/* Level badge */}
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: isDone ? '#10b981' : isLocked ? 'var(--bg-secondary)' : isActive ? 'rgba(124,58,237,0.2)' : 'var(--bg-elevated)',
                    border: isActive && !isDone && !isLocked ? '1px solid var(--accent)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 700,
                    color: isDone ? 'white' : isLocked ? 'var(--text-muted)' : isActive ? 'var(--accent)' : 'var(--text-muted)'
                  }}>
                    {isDone ? <Check size={9} /> : isLocked ? <Lock size={9} /> : level.id}
                  </span>
                  {/* Title */}
                  <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', flex: 1,
                    color: isLocked ? 'var(--text-muted)' : 'inherit'
                  }}>
                    {shortTitle(level.title)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
