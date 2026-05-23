'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Layers, 
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Square
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [feedback, setFeedback] = useState(null)
  
  const [selectedIds, setSelectedIds] = useState([])
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (!error) {
      setCategories(data)
    } else {
      showFeedback('Error fetching categories: ' + error.message, 'error')
    }
    setLoading(false)
  }

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim() || isAdding) return
    setIsAdding(true)

    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategoryName.trim() }])

    if (!error) {
      setNewCategoryName('')
      await fetchCategories()
      showFeedback('Category added successfully!')
    } else {
      showFeedback('Error: ' + error.message, 'error')
    }
    setIsAdding(false)
  }

  const handleDeleteSingle = async (id) => {
    if (!confirm('Are you sure you want to delete this category? Articles assigned this category will no longer have it.')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      setCategories(categories.filter(c => c.id !== id))
      setSelectedIds(selectedIds.filter(cid => cid !== id))
      showFeedback('Category deleted.')
    } else {
      showFeedback('Error deleting category: ' + error.message, 'error')
    }
  }

  const handleDeleteBulk = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) return
    setIsDeletingBulk(true)

    const { error } = await supabase
      .from('categories')
      .delete()
      .in('id', selectedIds)

    if (!error) {
      setCategories(categories.filter(c => !selectedIds.includes(c.id)))
      setSelectedIds([])
      showFeedback(`${selectedIds.length} categories deleted successfully.`)
    } else {
      showFeedback('Error in bulk delete: ' + error.message, 'error')
    }
    setIsDeletingBulk(false)
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    const currentFilteredIds = filteredCategories.map(c => c.id)
    const allSelected = currentFilteredIds.length > 0 && currentFilteredIds.every(id => selectedIds.includes(id))
    
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !currentFilteredIds.includes(id)))
    } else {
      setSelectedIds([...new Set([...selectedIds, ...currentFilteredIds])])
    }
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="manager-card glass-card">
      <header className="manager-header">
        <div className="title-group">
          <div className="icon-badge"><Layers size={20} /></div>
          <div>
            <h3>Article Category Registry</h3>
            <p>Manage categories used for organizing and filtering technical articles.</p>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input 
            placeholder="Search categories..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="form-container">
        <form className="add-form" onSubmit={handleAddCategory}>
          <input 
            required
            placeholder="New category name (e.g. Next.js, Architecture)" 
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            className="add-input"
          />
          <button type="submit" className="add-btn" disabled={isAdding || !newCategoryName.trim()}>
            {isAdding ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
            <span>Add Category</span>
          </button>
        </form>
      </div>

      <div className="selection-toolbar">
        <button className="select-all-btn" onClick={toggleSelectAll}>
          {filteredCategories.length > 0 && filteredCategories.every(c => selectedIds.includes(c.id)) ? (
            <CheckSquare className="checked" size={18} />
          ) : (
            <Square size={18} />
          )}
          <span>{selectedIds.length > 0 ? `Selected ${selectedIds.length}` : 'Select All'}</span>
        </button>

        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleDeleteBulk}
              className="bulk-delete-btn"
              disabled={isDeletingBulk}
            >
              {isDeletingBulk ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
              <span>Delete Selected</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`feedback-msg ${feedback.type}`}
          >
            {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="stacks-list">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="spin" size={32} />
            <p>Synchronizing Category Registry...</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="stacks-grid">
            {filteredCategories.map(category => {
              const isSelected = selectedIds.includes(category.id)
              return (
                <motion.div 
                  key={category.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`stack-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSelect(category.id)}
                >
                  <div className="icon-placeholder">{category.name.charAt(0)}</div>
                  <span className="name">{category.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSingle(category.id)
                    }} 
                    className="delete-btn"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No categories found. {searchQuery ? 'Try a different search.' : 'Add your first category above!'}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .manager-card { padding: 32px; position: relative; }
        
        .manager-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 24px; margin-bottom: 32px;
        }

        .title-group { display: flex; gap: 16px; align-items: center; }
        .icon-badge {
          width: 44px; height: 44px; border-radius: 12px; background: var(--gradient-purple);
          display: flex; align-items: center; justify-content: center; color: #fff;
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.2);
        }
        .title-group h3 { font-size: 1.25rem; color: var(--text-primary); margin: 0; font-family: Syne, sans-serif; font-weight: 800; }
        .title-group p { font-size: 0.85rem; color: var(--text-muted); margin: 4px 0 0; }

        .search-box { position: relative; width: 280px; }
        .search-box :global(svg) { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-box input {
          width: 100%; padding: 12px 14px 12px 42px !important;
          background: var(--bg-secondary); border: 1px solid var(--border-subtle);
          border-radius: 12px; color: var(--text-primary); font-size: 0.9rem; outline: none;
        }

        .form-container { margin-bottom: 24px; }
        .add-form {
          display: flex; gap: 12px; padding: 20px;
          background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-subtle);
        }
        .add-input {
          flex: 1; height: 48px !important; border-radius: 12px !important;
          background: var(--bg-primary) !important; color: var(--text-primary) !important;
        }
        .add-btn {
          height: 48px; padding: 0 24px; border-radius: 12px;
          background: var(--accent); color: #fff; border: none;
          display: flex; align-items: center; gap: 8px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }

        .selection-toolbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle);
        }
        .select-all-btn {
          display: flex; align-items: center; gap: 10px; color: var(--text-muted);
          background: none; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 700;
          padding: 8px; border-radius: 8px; transition: all 0.2s;
        }
        .select-all-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
        .select-all-btn .checked { color: var(--accent); }
        
        .bulk-delete-btn {
          display: flex; align-items: center; gap: 10px; padding: 10px 20px;
          background: #ef4444; color: #fff; border: none;
          border-radius: 12px; font-size: 0.9rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .bulk-delete-btn:hover { background: #dc2626; transform: translateY(-1px); }

        .stacks-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
        }

        .stack-card {
          position: relative; padding: 32px 20px 24px;
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 24px; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 14px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(8px); min-height: 160px; cursor: pointer;
        }
        .stack-card:hover { transform: translateY(-4px); border-color: var(--accent-soft); background: var(--bg-card-hover); }
        .stack-card.selected { 
          border-color: var(--accent); 
          background: rgba(124, 58, 237, 0.08);
          box-shadow: 0 0 0 1px var(--accent);
        }

        .icon-placeholder {
          width: 48px; height: 48px; border-radius: 16px; background: var(--bg-secondary);
          display: flex; align-items: center; justify-content: center; color: var(--accent);
          font-weight: 800; font-size: 1.4rem; font-family: Syne, sans-serif;
          transition: all 0.3s;
        }
        .stack-card:hover .icon-placeholder { background: var(--bg-primary); transform: rotate(-5deg) scale(1.1); }
        .stack-card.selected .icon-placeholder { background: var(--accent); color: white; }

        .name { font-family: Syne, sans-serif; font-size: 1.05rem; font-weight: 700; color: var(--text-primary); text-align: center; }
        
        .delete-btn {
          position: absolute; top: 16px; right: 16px; width: 32px; height: 32px;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); background: transparent; border: none;
          cursor: pointer; transition: all 0.2s; opacity: 0;
        }
        .stack-card:hover .delete-btn { opacity: 1; }
        .delete-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

        .feedback-msg {
          display: flex; align-items: center; gap: 8px; padding: 14px 20px;
          border-radius: 12px; font-size: 0.95rem; font-weight: 700; margin-bottom: 24px;
        }
        .feedback-msg.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .feedback-msg.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

        .loading-state { padding: 80px; text-align: center; color: var(--text-muted); width: 100%; grid-column: 1 / -1; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
