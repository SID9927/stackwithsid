'use client'
/**
 * LevelBanner.js
 * Slide-in banner at the top of the main area when a level is complete.
 * Does NOT overlay the visualizer — it pushes it down ~60px.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RotateCcw, ArrowRight, X } from 'lucide-react'

export default function LevelBanner({
  isCompleted, isSandbox, activeLevel, levelIndex, totalLevels,
  xp, xpPerLevel, completedLevels,
  onRestart, onNext, onDismiss
}) {
  if (isSandbox) return null

  return (
    <AnimatePresence>
      {isCompleted && (
        <>
          <motion.div
            className="level-banner-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 58, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            style={{ overflow: 'hidden', flexShrink: 0 }}
          >
            <div className="level-banner-container" style={{
              height: 58, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '0 16px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.03) 100%)',
              borderBottom: '1px solid rgba(16,185,129,0.3)'
            }}>
              {/* Left: icon + text */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Trophy size={15} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#10b981', lineHeight: 1.2 }}>
                    Level {activeLevel.id} Complete!
                  </p>
                  <p style={{ margin: 0, fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 1 }}>
                    {completedLevels.includes(activeLevel.id)
                      ? 'XP already earned'
                      : `+${xpPerLevel} XP · Total: ${xp} XP`}
                    {' · '}ESC to dismiss
                  </p>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="level-banner-actions" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={onRestart}
                  style={{
                    padding: '6px 12px', borderRadius: 9,
                    background: 'transparent', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-mid)', fontSize: '0.73rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    outline: 'none'
                  }}
                >
                  <RotateCcw size={11} /> Restart
                </button>
                <button
                  onClick={onNext}
                  style={{
                    padding: '6px 14px', borderRadius: 9,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', border: 'none', fontSize: '0.73rem', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                    outline: 'none'
                  }}
                >
                  {levelIndex < totalLevels - 1 ? 'Next Level' : 'Go to Sandbox'}
                  <ArrowRight size={11} />
                </button>
                <button
                  onClick={onDismiss}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: 4, borderRadius: 6,
                    display: 'flex', alignItems: 'center', outline: 'none'
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          </motion.div>
          
          <style jsx>{`
            @media (max-width: 640px) {
              :global(.level-banner-wrapper) {
                height: auto !important;
              }
              .level-banner-container {
                height: auto !important;
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 12px !important;
                padding: 12px 16px !important;
              }
              .level-banner-actions {
                width: 100% !important;
                justify-content: flex-start !important;
                gap: 8px !important;
              }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  )
}
