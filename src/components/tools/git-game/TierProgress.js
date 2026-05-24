'use client'
/**
 * TierProgress.js
 * Three-tier progress dots showing Foundation / Branching / Advanced progress.
 * Each dot represents a level; clicking jumps to that level.
 */
import { Lock } from 'lucide-react'

export default function TierProgress({ tiers, levels, levelIndex, completedLevels, isSandbox, onSelectLevel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {tiers.map(tier => {
        const tierCompleted = tier.levels.filter(id => completedLevels.includes(id)).length
        const pct = Math.round((tierCompleted / tier.levels.length) * 100)
        return (
          <div key={tier.id}>
            {/* Tier header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 5
            }}>
              <span style={{
                fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4
              }}>
                {tier.emoji} {tier.name.toUpperCase()}
              </span>
              <span style={{
                fontSize: '0.58rem', color: tierCompleted === tier.levels.length ? tier.color : 'var(--text-muted)',
                fontWeight: 600
              }}>
                {tierCompleted}/{tier.levels.length}
              </span>
            </div>

            {/* Thin progress bar */}
            <div style={{
              height: 2, borderRadius: 1,
              background: 'var(--border-subtle)',
              marginBottom: 6, overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: 1,
                width: `${pct}%`,
                background: tier.color,
                transition: 'width 0.5s ease'
              }} />
            </div>

            {/* Level dots */}
            <div style={{ display: 'flex', gap: 4 }}>
              {tier.levels.map(levelId => {
                const idx = levels.findIndex(l => l.id === levelId)
                const isActive = idx === levelIndex && !isSandbox
                const isDone = completedLevels.includes(levelId)
                const isLocked = idx > 0 && !completedLevels.includes(levels[idx - 1]?.id)
                return (
                  <button
                    key={levelId}
                    onClick={() => { if (!isLocked) onSelectLevel(idx) }}
                    title={isLocked ? `${levels[idx]?.title} (Locked)` : levels[idx]?.title}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: isDone
                        ? tier.color
                        : isActive
                          ? `${tier.color}22`
                          : 'var(--bg-secondary)',
                      border: isActive
                        ? `2px solid ${tier.color}`
                        : isDone
                          ? 'none'
                          : '1px solid var(--border-subtle)',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.4 : 1,
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.52rem', fontWeight: 700,
                      color: isDone ? 'white' : isActive ? tier.color : 'var(--text-muted)',
                      boxShadow: isActive ? `0 0 8px ${tier.color}66` : 'none',
                      outline: 'none'
                    }}
                  >
                    {isLocked ? <Lock size={7} /> : levelId}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
