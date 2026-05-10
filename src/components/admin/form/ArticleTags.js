'use client'

import { Tag } from 'lucide-react'

export default function ArticleTags({ tags, onAddTag, onRemoveTag, tagInput, setTagInput }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      onAddTag(tagInput.trim())
      setTagInput('')
    }
  }

  return (
    <div className="sidebar-card glass-card">
      <h3><Tag size={16} /> Categorization</h3>
      <div className="tags-manager">
        <div className="tags-list">
          {tags?.map(tag => (
            <span key={tag} className="tag-pill">
              {tag} <button type="button" onClick={() => onRemoveTag(tag)}>×</button>
            </span>
          ))}
        </div>
        <div className="tag-input-wrapper">
          <Tag size={14} className="tag-icon" />
          <input 
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag..."
          />
        </div>
      </div>
      <style jsx>{`
        .tags-manager { display: flex; flex-direction: column; gap: 12px; }
        .tags-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag-pill {
          background: rgba(124, 58, 237, 0.1); color: var(--accent-soft); padding: 4px 12px; border-radius: 8px;
          font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(124, 58, 237, 0.2);
        }
        .tag-pill button { background: none; border: none; color: inherit; cursor: pointer; font-size: 1.1rem; padding: 0; line-height: 1; }
        .tag-input-wrapper { display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0 12px; }
        .tag-icon { color: var(--text-muted); }
        .tag-input-wrapper input { flex: 1; background: transparent !important; border: none !important; padding: 10px 0 !important; font-size: 0.85rem !important; }
      `}</style>
    </div>
  )
}
