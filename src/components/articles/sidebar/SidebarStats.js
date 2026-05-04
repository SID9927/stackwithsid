'use client'

import { motion } from 'framer-motion'
import { Clock, MessageSquare, ThumbsUp, ThumbsDown, Share2, Bookmark } from 'lucide-react'

export default function SidebarStats({ readTime, commentsCount, likes, isLiked, onLikeToggle }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '28px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Stats</h4>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              <Clock size={14} color="var(--accent)" /> {readTime}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              <MessageSquare size={14} color="var(--accent)" /> {commentsCount} Comments
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Engagement</h4>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className={`sidebar-btn ${isLiked ? 'active' : ''}`}
              onClick={onLikeToggle}
            >
              <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} /> {likes}
            </button>
            <button className="sidebar-btn" onClick={() => {
              const el = document.getElementById('comments');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <MessageSquare size={16} /> Discuss
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="sidebar-action-btn primary">
            <Share2 size={16} /> Share
          </button>
          <button className="sidebar-action-btn icon">
            <Bookmark size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .sidebar-btn {
          flex: 1; height: 42px; border-radius: 10px; background: var(--bg-elevated); 
          border: 1px solid var(--border-subtle); color: var(--text-primary); cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem;
          transition: all 0.2s ease; padding: 0;
        }
        .sidebar-btn:hover { background: var(--border-subtle); transform: translateY(-2px); }
        
        .sidebar-action-btn {
          height: 42px; border-radius: 10px; cursor: pointer; display: flex; 
          align-items: center; justify-content: center; transition: all 0.2s ease; padding: 0;
        }
        .sidebar-action-btn.primary {
          flex: 1; background: var(--gradient-purple); border: none; color: white; font-weight: 600; gap: 8px; font-size: 0.85rem;
        }
        .sidebar-action-btn.icon {
          width: 42px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); color: var(--text-primary);
        }
        .sidebar-action-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
      `}</style>
    </motion.div>
  )
}
