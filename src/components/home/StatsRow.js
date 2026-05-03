'use client'

import { motion } from 'framer-motion'
import Counter from './Counter'

export default function StatsRow({ stats }) {
  if (!stats) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1, duration: 0.6 }}
      style={{
        display: 'flex', gap: 32, justifyContent: 'center',
        flexWrap: 'wrap', marginTop: 64,
      }}
    >
      {stats.map(({ label, value }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.8rem',
            fontWeight: 800,
            background: 'var(--gradient-purple)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            <Counter value={value} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {label}
          </div>
        </div>
      ))}
    </motion.div>
  )
}
