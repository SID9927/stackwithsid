'use client'

import { motion } from 'framer-motion'
import { Trophy, Target, TrendingUp, Users, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function InterviewSidebar({ stats }) {
  return (
    <aside className="hidden lg:flex flex-col gap-6 sticky top-[100px] h-fit">
      {/* Readiness Card */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '28px' }}
      >
        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={14} className="text-accent" /> Prep Progress
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>72%</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Ready for React roles</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 1, delay: 0.8 }}
              style={{ height: '100%', background: 'var(--gradient-purple)' }} 
            />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            You've solved <strong>42 questions</strong> this week. Keep it up!
          </p>
        </div>
      </motion.div>

      {/* Popular Topics */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '28px' }}
      >
        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={14} className="text-accent" /> Hot Topics
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <TopicBadge label="Hooks" count="12" />
          <TopicBadge label="Redux" count="8" />
          <TopicBadge label="Memory Leaks" count="5" />
          <TopicBadge label="SSR" count="15" />
          <TopicBadge label="Zustand" count="4" />
        </div>
      </motion.div>

      {/* Community CTA */}
      <div style={{ background: 'var(--gradient-purple)', borderRadius: '24px', padding: '32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>Mock Interview?</h4>
          <p style={{ fontSize: '0.9rem', color: '#fff', opacity: 0.9, marginBottom: '24px', lineHeight: 1.5 }}>
            Practice with our community and get real-time feedback.
          </p>
          <Link href="/discuss" style={{ textDecoration: 'none' }}>
            <div className="cta-button">
              Book a Slot <ArrowUpRight size={18} />
            </div>
          </Link>
        </div>
        <div className="cta-decoration" />
      </div>

      <style jsx>{`
        .cta-button {
          height: 48px; background: #fff; color: var(--accent); border-radius: 14px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-weight: 700; fontSize: 0.95rem; transition: all 0.2s ease;
        }
        .cta-button:hover { transform: scale(1.02); }
        .cta-decoration {
          position: absolute; top: -20%; right: -20%; width: 140px; height: 140px;
          background: rgba(255,255,255,0.15); border-radius: 50%; filter: blur(25px);
        }
      `}</style>
    </aside>
  )
}

function TopicBadge({ label, count }) {
  return (
    <div style={{ 
      padding: '6px 12px', borderRadius: '10px', background: 'var(--bg-elevated)', 
      border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-primary)',
      display: 'flex', gap: '8px', alignItems: 'center'
    }}>
      {label} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{count}</span>
    </div>
  )
}
