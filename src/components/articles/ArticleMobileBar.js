'use client'

import { motion } from 'framer-motion'
import { ThumbsUp, MessageSquare, Share2, Bookmark } from 'lucide-react'

export default function ArticleMobileBar({ likes = 42, commentsCount = 12 }) {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="mobile-action-bar"
    >
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        height: '60px', padding: '0 24px', background: 'rgba(9, 9, 11, 0.8)', 
        backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border-subtle)',
        borderRadius: '24px 24px 0 0', boxShadow: '0 -10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="mobile-btn">
            <ThumbsUp size={20} color="var(--accent)" /> {likes}
          </button>
          <button className="mobile-btn">
            <MessageSquare size={20} color="var(--accent)" /> {commentsCount}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="mobile-btn icon"><Share2 size={20} /></button>
          <button className="mobile-btn icon"><Bookmark size={20} /></button>
        </div>
      </div>

      <style jsx>{`
        .mobile-action-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .mobile-btn {
          background: none; border: none; color: #fff; 
          display: flex; align-items: center; gap: 6px; font-size: 0.9rem;
          cursor: pointer; padding: 0;
        }
        .mobile-btn.icon { padding: 4px; }
      `}</style>
    </motion.div>
  )
}
