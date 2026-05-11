'use client'

import { motion } from 'framer-motion'
import { ThumbsUp, MessageSquare, Share2, Bookmark } from 'lucide-react'

export default function UnifiedMobileBar({ 
  likes = 0, 
  isLiked, 
  onLikeToggle, 
  onShare, 
  commentsCount = 0,
  onCommentClick,
  isBookmarked,
  onBookmarkToggle
}) {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mobile-action-bar"
    >
      <div className="bar-container">
        <div className="left-actions">
          <button 
            className={`mobile-btn ${isLiked ? 'active' : ''}`}
            onClick={onLikeToggle}
          >
            <ThumbsUp size={20} fill={isLiked ? 'var(--accent)' : 'none'} color="var(--accent)" /> 
            <span>{likes}</span>
          </button>
          <button className="mobile-btn" onClick={onCommentClick}>
            <MessageSquare size={20} color="var(--accent)" /> 
            <span>{commentsCount}</span>
          </button>
        </div>
        
        <div className="right-actions">
          <button className="mobile-btn icon" onClick={onShare} title="Share">
            <Share2 size={20} />
          </button>
          <button 
            className={`mobile-btn icon ${isBookmarked ? 'active' : ''}`} 
            onClick={onBookmarkToggle}
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark size={20} fill={isBookmarked ? 'var(--accent)' : 'none'} color={isBookmarked ? 'var(--accent)' : 'currentColor'} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .mobile-action-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0 16px 16px;
          pointer-events: none;
        }

        .bar-container {
          pointer-events: auto;
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          height: 64px; 
          padding: 0 24px; 
          background: rgba(15, 15, 20, 0.85); 
          backdrop-filter: blur(20px); 
          border: 1px solid var(--border-subtle);
          border-radius: 32px; 
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          max-width: 500px;
          margin: 0 auto;
        }

        .left-actions, .right-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .mobile-btn {
          background: none; 
          border: none; 
          color: var(--text-primary); 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer; 
          padding: 8px 4px;
          transition: all 0.2s;
        }
        
        .mobile-btn.active {
          color: var(--accent);
        }

        .mobile-btn.icon {
          color: var(--text-muted);
        }
        
        .mobile-btn.icon:hover {
          color: var(--accent);
        }
      `}</style>
    </motion.div>
  )
}
