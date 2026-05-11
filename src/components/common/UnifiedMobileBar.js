'use client'

import { motion } from 'framer-motion'
import { ThumbsUp, MessageSquare, Bookmark, Share2 } from 'lucide-react'

export default function UnifiedMobileBar({ 
  likes, 
  isLiked, 
  onLikeToggle, 
  commentsCount, 
  onCommentClick,
  isBookmarked, 
  onBookmarkToggle, 
  onShare 
}) {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mobile-action-bar-anchored"
    >
      <div className="bar-container">
        <div className="action-group">
          <button 
            className={`mobile-btn ${isLiked ? 'active' : ''}`}
            onClick={onLikeToggle}
          >
            <ThumbsUp size={20} fill={isLiked ? 'var(--accent)' : 'none'} color="var(--accent)" /> 
            <span className="count">{likes}</span>
          </button>
          <button className="mobile-btn" onClick={onCommentClick}>
            <MessageSquare size={20} color="var(--accent)" /> 
            <span className="count">{commentsCount}</span>
          </button>
        </div>
        
        <div className="action-group">
          <button className="mobile-btn icon-only" onClick={onShare}>
            <Share2 size={20} />
          </button>
          <button 
            className={`mobile-btn icon-only ${isBookmarked ? 'active' : ''}`} 
            onClick={onBookmarkToggle}
          >
            <Bookmark size={20} fill={isBookmarked ? 'var(--accent)' : 'none'} color={isBookmarked ? 'var(--accent)' : 'currentColor'} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .mobile-action-bar-anchored {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding-bottom: env(safe-area-inset-bottom);
          background: #09090b;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border-top: 1px solid var(--border-subtle);
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
        }

        .bar-container {
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          height: 70px; 
          padding: 0 32px;
          max-width: 800px;
          margin: 0 auto;
        }

        .action-group {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .mobile-btn {
          background: none; 
          border: none; 
          color: #fff; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer; 
          padding: 12px 4px;
          transition: all 0.2s;
        }
        
        .count {
          color: var(--text-secondary);
          font-variant-numeric: tabular-nums;
        }

        .mobile-btn.active .count {
          color: var(--accent-soft);
        }

        .mobile-btn.icon-only {
          color: var(--text-muted);
          padding: 10px;
        }
        
        .mobile-btn:active {
          transform: scale(0.9);
        }
      `}</style>
    </motion.div>
  )
}
