'use client'

import { motion } from 'framer-motion'
import { Sparkles, Users } from 'lucide-react'

export default function InterviewHeader({ totalCount }) {
  return (
    <div style={{ marginBottom: '56px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> Interview Prep
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} /> 2.4k developers practicing today
          </span>
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, 
          lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em',
          fontFamily: 'Syne, sans-serif'
        }}>
          Ace your <span style={{ 
            background: 'var(--gradient-purple)', WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', display: 'inline-block' 
          }}>next interview</span>
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', 
          lineHeight: 1.6, marginBottom: 0 
        }}>
          A curated collection of <strong style={{ color: 'var(--text-primary)' }}>{totalCount} real-world questions</strong> across modern stacks and top-tier companies. Practice, learn, and grow.
        </p>
      </motion.div>
    </div>
  )
}
