'use client'

import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'

export default function InterviewFilters({ 
  query, setQuery, 
  stack, setStack, stacks,
  difficulty, setDifficulty, difficulties 
}) {
  return (
    <div style={{ marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
        <div style={{ 
          position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', 
          color: 'var(--text-muted)', display: 'flex', alignItems: 'center' 
        }}>
          <Search size={18} />
        </div>
        <input
          placeholder="Search by question, company, or topic..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%', padding: '16px 20px 16px 52px', borderRadius: '16px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)', fontSize: '1rem', outline: 'none',
            transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          className="focus:border-accent focus:ring-2 focus:ring-accent/10"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            style={{ 
              position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
        {/* Stack Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {stacks.map(s => (
            <FilterChip 
              key={s} 
              label={s} 
              isActive={stack === s} 
              onClick={() => setStack(s)} 
            />
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)', display: 'none' }} className="lg:block" />

        {/* Difficulty Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {difficulties.map(d => (
            <FilterChip 
              key={d} 
              label={d} 
              isActive={difficulty === d} 
              onClick={() => setDifficulty(d)} 
              variant="outline"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, isActive, onClick, variant = 'solid' }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
        background: isActive 
          ? 'var(--gradient-purple)' 
          : 'var(--bg-card)',
        color: isActive ? '#fff' : 'var(--text-muted)',
        boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
      }}
      className="hover:scale-105 active:scale-95"
    >
      {label}
    </button>
  )
}
