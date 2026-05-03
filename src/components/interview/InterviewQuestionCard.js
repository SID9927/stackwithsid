'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Award } from 'lucide-react'

export default function InterviewQuestionCard({ q, index, isActive, onClick }) {
  const diffColor = {
    Beginner: '#10b981',
    Intermediate: '#f59e0b',
    Advanced: '#ef4444',
  }[q.difficulty] || 'var(--accent)'

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '16px 20px',
        borderRadius: '16px',
        background: isActive ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(124, 58, 237, 0.2)' : 'transparent'}`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '16px',
        transition: 'all 0.2s ease',
        position: 'relative',
        marginBottom: '4px'
      }}
      className="question-list-item group"
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <motion.div 
          layoutId="active-bar"
          style={{ position: 'absolute', left: '0', top: '25%', bottom: '25%', width: '3px', background: 'var(--accent)', borderRadius: '0 4px 4px 0' }} 
        />
      )}

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ 
            fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
            background: isActive ? 'var(--accent)' : 'var(--bg-elevated)', 
            color: isActive ? '#fff' : diffColor,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {q.difficulty}
          </span>
          {q.company && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              • {q.company}
            </span>
          )}
        </div>
        <h4 style={{ 
          fontSize: '0.9rem', fontWeight: 600, 
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          margin: 0, lineHeight: 1.5,
          fontFamily: 'Inter, sans-serif',
          transition: 'color 0.2s'
        }}>
          {q.question}
        </h4>
      </div>
      
      <div style={{ 
        color: isActive ? 'var(--accent)' : 'var(--text-muted)', 
        opacity: isActive ? 1 : 0.2,
        transition: 'all 0.2s'
      }} className="group-hover:opacity-100 group-hover:translate-x-1 transform">
        <ChevronRight size={16} />
      </div>

      <style jsx>{`
        .question-list-item:hover h4 { color: var(--text-primary); }
      `}</style>
    </motion.button>
  )
}
