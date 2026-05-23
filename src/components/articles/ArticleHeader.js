'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

export default function ArticleHeader({ title, tags = [], category, publishDate, readTime }) {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Link href="/articles" style={{ textDecoration: 'none' }}>
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '40px' }}
        >
          <ArrowLeft size={16} /> Back to articles
        </motion.div>
      </Link>

      <div className="header-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {category && (
              <span className="badge" style={{
                background: 'var(--gradient-purple)',
                color: 'white',
                fontWeight: '700',
                border: 'none',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                padding: '5px 14px'
              }}>{category}</span>
            )}
            {tags.map(tag => (
              <span key={tag} className="badge badge-purple">{tag}</span>
            ))}
          </div>

          {/* Mobile-only meta */}
          <div className="mobile-meta" style={{ display: 'none', gap: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {publishDate}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {readTime}</div>
          </div>

          <h1 className="article-title">
            {title}
          </h1>
        </motion.div>
      </div>

      <style jsx>{`
        .article-title {
          font-family: Syne, sans-serif; 
          font-size: clamp(1.8rem, 4vw, 2.8rem); 
          font-weight: 700; 
          line-height: 1.15; 
          margin-bottom: 32px; 
          background: var(--gradient-purple);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        @media (max-width: 1024px) {
          .mobile-meta { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
