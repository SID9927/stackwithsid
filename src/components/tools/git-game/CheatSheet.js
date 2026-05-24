'use client'
/**
 * CheatSheet.js
 * Expandable Git command reference organized by category.
 * Clicking a command runs it in the terminal.
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function CheatSheet({ sections, onRunCommand }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {sections.map(section => {
        const isOpen = expanded === section.id
        return (
          <div key={section.id}>
            {/* Section toggle button */}
            <button
              onClick={() => setExpanded(isOpen ? null : section.id)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                background: isOpen ? 'rgba(124,58,237,0.07)' : 'none',
                border: 'none', borderRadius: 8, padding: '7px 10px',
                cursor: 'pointer', color: 'var(--text-secondary)',
                fontSize: '0.72rem', fontWeight: 600, textAlign: 'left',
                transition: 'background 0.15s', outline: 'none'
              }}
            >
              <span>{section.label}</span>
              {isOpen
                ? <ChevronDown size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                : <ChevronRight size={11} style={{ flexShrink: 0, opacity: 0.4 }} />
              }
            </button>

            {/* Command list */}
            {isOpen && (
              <div style={{ padding: '4px 4px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {section.commands.map(({ cmd, desc }) => (
                  <button
                    key={cmd}
                    onClick={() => onRunCommand(cmd.replace(/<[^>]+>/g, 'example'))}
                    title={`Run: ${cmd}`}
                    style={{
                      display: 'flex', alignItems: 'baseline', gap: 6,
                      background: 'none', border: 'none', borderRadius: 6,
                      padding: '5px 8px', cursor: 'pointer',
                      textAlign: 'left', width: '100%', transition: 'background 0.1s',
                      outline: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <code style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.64rem',
                      color: 'var(--accent-soft)', flexShrink: 0,
                      whiteSpace: 'nowrap', lineHeight: 1.4
                    }}>
                      {cmd}
                    </code>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
