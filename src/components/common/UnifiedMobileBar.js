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
      className="unified-mobile-bar"
    >
      <div className="bar-content">
        {/* Like Action */}
        <button 
          className={`bar-action ${isLiked ? 'active' : ''}`}
          onClick={onLikeToggle}
        >
          <div className="icon-box">
            <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} />
          </div>
          <span className="count">{likes > 0 ? likes : ''}</span>
          <span className="label">Like</span>
        </button>

        {/* Comment Action */}
        <button 
          className="bar-action"
          onClick={onCommentClick}
        >
          <div className="icon-box">
            <MessageSquare size={20} />
          </div>
          <span className="count">{commentsCount > 0 ? commentsCount : ''}</span>
          <span className="label">Discuss</span>
        </button>

        {/* Bookmark Action */}
        <button 
          className={`bar-action ${isBookmarked ? 'active' : ''}`}
          onClick={onBookmarkToggle}
        >
          <div className="icon-box">
            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </div>
          <span className="label">{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>

        {/* Share Action */}
        <button 
          className="bar-action"
          onClick={onShare}
        >
          <div className="icon-box">
            <Share2 size={20} />
          </div>
          <span className="label">Share</span>
        </button>
      </div>

      <style jsx>{`
        .unified-mobile-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: rgba(13, 13, 18, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: env(safe-area-inset-bottom);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bar-content {
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 100%;
          max-width: 500px;
          padding: 0 10px;
        }

        .bar-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          min-width: 64px;
        }

        .bar-action:active {
          transform: scale(0.9);
        }

        .icon-box {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          transition: all 0.3s;
        }

        .bar-action.active {
          color: var(--accent);
        }

        .bar-action.active .icon-box {
          background: rgba(124, 58, 237, 0.1);
        }

        .count {
          position: absolute;
          top: 0;
          right: 12px;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--accent-soft);
          background: var(--bg-card);
          padding: 1px 5px;
          border-radius: 6px;
          border: 1px solid var(--border-subtle);
        }

        .label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          opacity: 0.8;
        }
      `}</style>
    </motion.div>
  )
}
