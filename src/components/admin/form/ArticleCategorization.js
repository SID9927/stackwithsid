'use client'

import { useState } from 'react'
import { Layout, Tag, Plus, Sparkles, Layers } from 'lucide-react'
import CustomDropdown from './CustomDropdown'
import { supabase } from '@/lib/supabase'

export default function ArticleCategorization({ 
  formData, 
  setFormData, 
  categories = [], 
  onCategoryAdded,
  tagInput,
  setTagInput
}) {
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    setIsAdding(true)

    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategory.trim() }])

    if (!error) {
      setFormData({ ...formData, category: newCategory.trim() })
      if (onCategoryAdded) onCategoryAdded(newCategory.trim())
      setNewCategory('')
      setShowAddCategory(false)
    } else {
      alert('Error adding category: ' + error.message)
    }
    setIsAdding(false)
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const trimmed = tagInput.trim()
      if (!formData.tags.includes(trimmed)) {
        setFormData({ ...formData, tags: [...formData.tags, trimmed] })
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) })
  }

  return (
    <div className="sidebar-card glass-card">
      <h3><Layout size={16} /> Categorization</h3>

      {/* Category Section */}
      <div className="category-selector">
        <CustomDropdown 
          label="Category"
          value={formData.category || 'Select Category'}
          options={categories}
          icon={Layers}
          onChange={(val) => setFormData({...formData, category: val})}
        />
        {!showAddCategory ? (
          <button 
            type="button" 
            className="add-category-btn"
            onClick={() => setShowAddCategory(true)}
          >
            <Plus size={14} /> Add New Category
          </button>
        ) : (
          <div className="add-category-form">
            <input 
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Category name..."
              className="new-category-input"
            />
            <div className="add-category-actions">
              <button type="button" onClick={() => setShowAddCategory(false)} className="cancel-btn">Cancel</button>
              <button type="button" onClick={handleAddCategory} disabled={isAdding} className="confirm-btn">
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="divider" />

      {/* Tags Section */}
      <div className="tags-manager">
        <label className="tags-label"><Tag size={14} /> Tags (SEO & Keywords)</label>
        <div className="tags-list">
          {formData.tags?.map(tag => (
            <span key={tag} className="tag-pill">
              {tag} <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
            </span>
          ))}
        </div>
        <div className="tag-input-wrapper">
          <Tag size={14} className="tag-icon" />
          <input 
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tag and press Enter..."
          />
        </div>
      </div>

      <style jsx>{`
        .sidebar-card { padding: 24px; }
        .sidebar-card h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 20px; color: var(--text-primary); }
        
        .add-category-btn {
          background: none; border: none; color: var(--accent-soft); font-size: 0.75rem; 
          font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;
          padding: 0; margin-top: -12px; margin-bottom: 20px; opacity: 0.8; transition: opacity 0.2s;
        }
        .add-category-btn:hover { opacity: 1; }

        .add-category-form {
          margin-top: -12px; margin-bottom: 20px; padding: 12px; 
          background: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.1); 
          border-radius: 10px; display: flex; flex-direction: column; gap: 8px;
        }
        .new-category-input {
          background: var(--bg-primary) !important; border: 1px solid var(--border-subtle) !important;
          padding: 8px 12px !important; font-size: 0.85rem !important; border-radius: 8px !important;
          color: var(--text-primary);
        }
        .add-category-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .add-category-actions button {
          padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer;
        }
        .cancel-btn { background: none; border: 1px solid var(--border-subtle); color: var(--text-muted); }
        .confirm-btn { background: var(--accent); border: none; color: white; }
        .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .divider {
          height: 1px; background: var(--border-subtle); margin: 24px 0;
        }

        .tags-manager { display: flex; flex-direction: column; gap: 12px; }
        .tags-label {
          display: flex; align-items: center; gap: 8px;
          color: var(--text-secondary); font-weight: 600; font-size: 0.85rem;
        }
        .tags-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag-pill {
          background: rgba(124, 58, 237, 0.1); color: var(--accent-soft); padding: 4px 12px; border-radius: 8px;
          font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(124, 58, 237, 0.2);
        }
        .tag-pill button { background: none; border: none; color: inherit; cursor: pointer; font-size: 1.1rem; padding: 0; line-height: 1; }
        .tag-input-wrapper { display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0 12px; }
        .tag-icon { color: var(--text-muted); }
        .tag-input-wrapper input { flex: 1; background: transparent !important; border: none !important; padding: 10px 0 !important; font-size: 0.85rem !important; color: var(--text-primary); }
      `}</style>
    </div>
  )
}
