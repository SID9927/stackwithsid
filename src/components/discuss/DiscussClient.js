'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MessageSquare, Plus, ArrowRight, Clock } from 'lucide-react'
import RevealOnScroll from '@/components/animations/RevealOnScroll'
import { timeAgo } from '@/lib/utils'

export default function DiscussClient({ threads }) {
  const [activeTag, setActiveTag] = useState('All')

  const allTags = ['All', ...new Set(threads.flatMap(t => t.tags || []))]
  const filtered = activeTag === 'All' ? threads : threads.filter(t => (t.tags || []).includes(activeTag))

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '60px 5%' }}>
      <RevealOnScroll>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: 12 }}>Community</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Open{' '}
              <span style={{
                background: 'var(--gradient-purple)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Discussions</span>
            </h1>
          </div>
          <Link href="/discuss/new">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary">
              <Plus size={15} /> New Thread
            </motion.div>
          </Link>
        </div>
      </RevealOnScroll>

      {/* Tags */}
      {allTags.length > 1 && (
        <RevealOnScroll delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)} style={{
                padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 500,
                cursor: 'pointer', minHeight: 36, transition: 'all 0.2s',
                border: `1px solid ${activeTag === tag ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                background: activeTag === tag ? 'hsl(270,75%,55%,0.15)' : 'var(--bg-card)',
                color: activeTag === tag ? 'var(--accent)' : 'var(--text-muted)',
              }}>{tag}</button>
            ))}
          </div>
        </RevealOnScroll>
      )}

      {/* Thread list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0
          ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>No discussions yet. Start one!</p>
          : filtered.map((thread, i) => (
              <RevealOnScroll key={thread.id} delay={i * 0.05}>
                <Link href={`/discuss/${thread.id}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="glass-card"
                    style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'hsl(270,75%,55%,0.12)', border: '1px solid hsl(270,60%,55%,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>
                        {thread.title}
                      </h3>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {(thread.tags || []).map(t => (
                          <span key={t} className="badge badge-purple" style={{ fontSize: '0.68rem' }}>{t}</span>
                        ))}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {timeAgo(thread.created_at)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </motion.div>
                </Link>
              </RevealOnScroll>
            ))
        }
      </div>
    </div>
  )
}
