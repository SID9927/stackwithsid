'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Search, Sparkles, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import RevealOnScroll from '@/components/animations/RevealOnScroll'
import TiltCard from '@/components/animations/TiltCard'

// High-fidelity built-in interactive tools
const localTools = [
  {
    id: 'image-compressor',
    name: 'Universal Image Compressor & Converter',
    description: 'Compress, resize, and convert images to WebP, PNG, or JPEG client-side. Custom lossless optimization, adaptive target size matching, and bulk queues.',
    url: '/tools/image-compressor',
    category: 'Assets',
    isLocal: true,
  },
  {
    id: 'git-game',
    name: 'Interactive Git Learning Game & Visualizer',
    description: 'Master Git commits, branching, merging, rebasing, and cherry-picking through an interactive, level-based visual puzzle game and simulator.',
    url: '/tools/git-game',
    category: 'Development',
    isLocal: true,
  }
]

export default function ToolsClient({ tools }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Merge built-in premium tools with handpicked DB tools
  const allTools = [...localTools, ...tools]

  const categories = ['All', ...new Set(allTools.map(t => t.category).filter(Boolean))]
  const filtered = allTools.filter(t => {
    const mQ = !query || t.name?.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase())
    const mC = activeCategory === 'All' || t.category === activeCategory
    return mQ && mC
  })

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '60px 5%' }}>
      <RevealOnScroll>
        <span className="badge badge-purple" style={{ marginBottom: 12 }}>Dev Tools</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 12 }}>
          Handpicked{' '}
          <span style={{
            background: 'var(--gradient-purple)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>developer tools</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>Tools to boost your productivity and workflow.</p>
      </RevealOnScroll>

      {/* Search + filter */}
      <RevealOnScroll delay={0.1}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              placeholder="Search tools…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                padding: '10px 14px 10px 38px', borderRadius: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
                color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', minHeight: 44, width: 240,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
            />
          </div>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} style={{
              padding: '8px 16px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', minHeight: 44,
              border: `1px solid ${activeCategory === c ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              background: activeCategory === c ? 'hsl(270,75%,55%,0.15)' : 'var(--bg-card)',
              color: activeCategory === c ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.2s',
            }}>{c}</button>
          ))}
        </div>
      </RevealOnScroll>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }}>
        {filtered.map((tool, i) => {
          const cardContent = (
            <div className="glass-card" style={{ 
              padding: 24, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {tool.name}
                    {tool.isLocal && (
                      <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                    )}
                  </h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {tool.category && (
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{tool.category}</span>
                    )}
                    {tool.isLocal && (
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>Interactive</span>
                    )}
                  </div>
                </div>
                {tool.isLocal ? (
                  <ChevronRight size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />
                ) : (
                  <ExternalLink size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {tool.description}
              </p>
            </div>
          )

          return (
            <RevealOnScroll key={tool.id} delay={i * 0.05}>
              <TiltCard style={{ height: '100%' }}>
                {tool.isLocal ? (
                  <Link href={tool.url} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    {cardContent}
                  </Link>
                ) : (
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    {cardContent}
                  </a>
                )}
              </TiltCard>
            </RevealOnScroll>
          )
        })}
      </div>

      {/* Coming Soon Headline */}
      <RevealOnScroll delay={0.2}>
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          background: 'rgba(124, 58, 237, 0.03)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            width: 50, height: 50, borderRadius: 14, 
            background: 'rgba(124, 58, 237, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, color: 'var(--accent)'
          }}>
            <Search size={24} />
          </div>
          <h2 style={{ 
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 800,
            marginBottom: 12,
            color: 'var(--text-primary)'
          }}>
            More Tools Coming Soon
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 450, fontSize: '1rem', lineHeight: 1.6 }}>
            I'm currently handpicking and testing the best developer resources to boost your productivity. Stay tuned for the next batch!
          </p>
        </div>
      </RevealOnScroll>
    </div>
  )
}

