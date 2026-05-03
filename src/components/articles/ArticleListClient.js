'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Clock, ArrowRight, Tag } from 'lucide-react'
import RevealOnScroll from '@/components/animations/RevealOnScroll'
import TiltCard from '@/components/animations/TiltCard'
import { formatDate, truncate } from '@/lib/utils'

export default function ArticleListClient({ initialArticles }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('All')

  const allTags = ['All', ...new Set(
    initialArticles.flatMap(a => (a.tags || []))
  )]

  const filtered = initialArticles.filter(a => {
    const matchesQuery = !query || a.title?.toLowerCase().includes(query.toLowerCase())
    const matchesTag   = activeTag === 'All' || (a.tags || []).includes(activeTag)
    return matchesQuery && matchesTag
  })

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '60px 5%' }}>
      {/* Header */}
      <RevealOnScroll>
        <div style={{ marginBottom: 48 }}>
          <span className="badge badge-purple" style={{ marginBottom: 12 }}>All Articles</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 12 }}>
            Technical{' '}
            <span style={{
              background: 'var(--gradient-purple)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>deep-dives</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480 }}>
            In-depth content on modern web development, system design, and engineering best practices.
          </p>
        </div>
      </RevealOnScroll>

      {/* Search */}
      <RevealOnScroll delay={0.1}>
        <div style={{ position: 'relative', maxWidth: 480, marginBottom: 32 }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search articles…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: 12,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              minHeight: 44,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
          />
        </div>
      </RevealOnScroll>

      {/* Tag filters */}
      {allTags.length > 1 && (
        <RevealOnScroll delay={0.15}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
            {allTags.map(tag => (
              <motion.button
                key={tag}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTag(tag)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 999,
                  border: `1px solid ${activeTag === tag ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                  background: activeTag === tag ? 'hsl(270,75%,55%,0.15)' : 'var(--bg-card)',
                  color: activeTag === tag ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  minHeight: 36,
                  transition: 'all 0.2s ease',
                }}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </RevealOnScroll>
      )}

      {/* Article Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px 0' }}>
          No articles found.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {filtered.map((article, i) => (
            <RevealOnScroll key={article.id} delay={i * 0.06}>
              <TiltCard>
                <Link href={`/articles/${article.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="glass-card" style={{ padding: 28, height: '100%' }}>
                    {/* Tags */}
                    {article.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                        {article.tags.slice(0, 2).map(t => (
                          <span key={t} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 style={{ fontSize: '1.1rem', marginBottom: 10, lineHeight: 1.4 }}>{article.title}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>
                      {truncate(article.excerpt || '', 110)}
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: 'var(--text-muted)', fontSize: '0.78rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {article.read_time || '5 min read'}
                      </div>
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
                      color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600,
                    }}>
                      Read more <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      )}
    </div>
  )
}
