'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  ChevronLeft, 
  Sparkles, 
  Layout, 
  Type, 
  Eye,
  Globe,
  Tag,
  CheckCircle2,
  Circle,
  FileEdit
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RichTextEditor from '@/components/admin/RichTextEditor'

// Frontend Components for Preview
import ArticleDetailLayout from '@/components/articles/ArticleDetailLayout'

export default function ArticleForm({ initialData = null, isEdit = false }) {
  const router = useRouter()
  const [formData, setFormData] = useState(initialData || {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: false,
    tags: []
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('edit') // 'edit' | 'preview'
  const [tagInput, setTagInput] = useState('')

  // We don't need the useEffect anymore since initialData is used for initial state
  // But we'll keep it just in case initialData changes dynamically later
  useEffect(() => {
    if (initialData) setFormData(initialData)
  }, [initialData])

  const handleTitleChange = (e) => {
    const title = e.target.value
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
    
    setFormData({ ...formData, title, slug: isEdit ? formData.slug : slug })
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      }
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const fn = isEdit 
      ? supabase.from('articles').update(formData).eq('id', initialData.id)
      : supabase.from('articles').insert([formData])
    
    const { error } = await fn
    if (!error) {
      router.push('/admin/articles')
      router.refresh()
    } else {
      alert('Error saving article: ' + error.message)
      setSaving(false)
    }
  }

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const words = content ? content.split(/\s+/).length : 0
    return Math.ceil(words / wordsPerMinute) + ' min read'
  }

  return (
    <div className="form-container">
      <header className="form-header">
        <div className="header-main">
          <Link href="/admin/articles" className="back-link">
            <ChevronLeft size={18} /> All Articles
          </Link>
          <h1>{isEdit ? 'Edit Article' : 'Draft New Article'}</h1>
          <div className="header-placeholder" style={{ width: 100 }}></div>
        </div>
      </header>

      <div className="editor-layout-wrapper">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.form 
              key="edit"
              id="article-form"
              onSubmit={handleSubmit} 
              className="editor-grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="editor-main glass-card">
                <div className="field-group">
                  <label><Type size={16} /> Article Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Mastering Next.js Performance"
                    className="title-input"
                  />
                </div>

                <div className="field-group">
                  <label><Globe size={16} /> URL Slug</label>
                  <div className="slug-input-wrapper">
                    <span className="slug-prefix">stackwithsid.com/articles/</span>
                    <input 
                      required
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value})}
                      placeholder="article-url-slug"
                      className="slug-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label><FileEdit size={16} /> Article Content</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                  />
                </div>
              </div>

              <aside className="editor-sidebar">
                {/* ── QUICK ACTIONS CARD ── */}
                <div className="glass-card actions-card">
                  <div className="actions-row">
                    <div className="tab-switcher-mini">
                      <button 
                        type="button"
                        className={activeTab === 'edit' ? 'active' : ''} 
                        onClick={() => setActiveTab('edit')}
                        title="Edit Mode"
                      >
                        <FileEdit size={16} />
                      </button>
                      <button 
                        type="button"
                        className={activeTab === 'preview' ? 'active' : ''} 
                        onClick={() => setActiveTab('preview')}
                        title="Preview Mode"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, published: !formData.published})}
                      className={`status-toggle ${formData.published ? 'published' : ''}`}
                    >
                      {formData.published ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      <span>{formData.published ? 'Live' : 'Draft'}</span>
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    form="article-form"
                    disabled={saving} 
                    className="admin-btn btn-primary publish-btn"
                  >
                    <Save size={18} /> 
                    <span>{saving ? 'Saving...' : (isEdit ? 'Update Changes' : 'Publish Article')}</span>
                  </button>
                </div>

                <div className="sidebar-card glass-card">
                  <h3><Layout size={16} /> SEO Summary</h3>
                  <div className="field-group">
                    <p className="field-hint">Used for search engine results and social shares.</p>
                    <textarea 
                      value={formData.excerpt}
                      onChange={e => setFormData({...formData, excerpt: e.target.value})}
                      placeholder="Brief summary for cards..."
                      rows={5}
                    />
                  </div>
                </div>

                <div className="sidebar-card glass-card">
                  <h3><Tag size={16} /> Categorization</h3>
                  <div className="tags-manager">
                    <div className="tags-list">
                      {formData.tags?.map(tag => (
                        <span key={tag} className="tag-pill">
                          {tag} <button type="button" onClick={() => removeTag(tag)}>×</button>
                        </span>
                      ))}
                    </div>
                    <div className="tag-input-wrapper">
                      <Tag size={14} className="tag-icon" />
                      <input 
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tag..."
                      />
                    </div>
                  </div>
                </div>
              </aside>
            </motion.form>
          ) : (
            <motion.div 
              key="preview"
              className="full-preview-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="preview-header-bar">
                <div className="flex items-center gap-4">
                  <div className="preview-badge">Live Preview Mode</div>
                  <span className="text-muted text-sm italic">Showing exactly as it appears on frontend</span>
                </div>
                <button onClick={() => setActiveTab('edit')} className="btn-secondary-sm">
                  <FileEdit size={14} /> Back to Editor
                </button>
              </div>
              
              <div className="preview-content-wrapper">
                <ArticleDetailLayout 
                  title={formData.title || 'Article Title Placeholder'}
                  tags={formData.tags.length > 0 ? formData.tags : ['General']}
                  publishDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  readTime={calculateReadTime(formData.content)}
                  stats={{ likes: 42, dislikes: 2, comments: 12 }}
                >
                  <div 
                    className="article-content-render" 
                    dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-muted italic">No content written yet...</p>' }} 
                  />
                </ArticleDetailLayout>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .form-container { max-width: 1400px; margin: 0 auto; }
        .form-header { margin-bottom: 32px; }
        .header-main { display: flex; justify-content: space-between; align-items: center; }
        .back-link { display: flex; align-items: center; gap: 8px; color: var(--text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: color 0.2s; }
        .back-link:hover { color: var(--accent); }
        .form-header h1 { font-family: Syne, sans-serif; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; }

        @media (max-width: 1024px) {
          .form-header { margin-bottom: 24px; padding: 0 16px; }
          .header-main { flex-direction: column; align-items: flex-start; gap: 12px; }
          .header-placeholder { display: none; }
          .form-header h1 { font-size: 1.6rem !important; margin-top: 8px; }
        }

        .actions-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; border-color: var(--accent-soft); }
        .actions-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        
        .tab-switcher-mini {
          display: flex; background: var(--bg-secondary); padding: 4px; border-radius: 12px; border: 1px solid var(--border-subtle);
          flex: 1;
        }
        .tab-switcher-mini button {
          display: flex; align-items: center; justify-content: center; flex: 1; height: 32px; border-radius: 8px; border: none; background: transparent;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .tab-switcher-mini button.active { background: var(--bg-elevated); color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        
        .status-toggle {
          display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 40px; border-radius: 12px;
          border: 1px solid var(--border-subtle); background: var(--bg-secondary); color: var(--text-muted);
          font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .status-toggle.published { border-color: var(--accent-soft); color: var(--accent); background: rgba(124, 58, 237, 0.05); }
        .publish-btn { width: 100%; justify-content: center; height: 48px; font-size: 0.95rem; }

        .editor-grid { 
          display: flex; 
          gap: 24px; 
          align-items: stretch; 
          position: relative; 
          width: 100%;
          min-height: calc(100vh - 220px);
        }

        @media (max-width: 1024px) {
          .editor-grid { flex-direction: column; gap: 40px; }
          .editor-main { padding: 24px !important; }
          .editor-sidebar { width: 100% !important; position: relative !important; top: 0 !important; }
        }
        
        .editor-main { 
          flex: 1; 
          min-width: 0; 
          padding: 40px; 
        }
        .editor-sidebar { 
          width: 340px; 
          flex-shrink: 0;
          position: sticky; 
          top: 96px; 
          display: flex; 
          flex-direction: column; 
          gap: 24px; 
          max-height: calc(100vh - 150px);
          overflow-y: auto;
        }
        /* Custom scrollbar for sidebar */
        .editor-sidebar::-webkit-scrollbar { width: 4px; }
        .editor-sidebar::-webkit-scrollbar-track { background: transparent; }
        .editor-sidebar::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
        .editor-sidebar:hover::-webkit-scrollbar-thumb { background: var(--border-mid); }
        .field-group { margin-bottom: 28px; }
        .field-group label { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; margin-bottom: 10px; }
        .field-hint { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; }

        .title-input { 
          font-family: Syne, sans-serif; font-size: 1.8rem !important; font-weight: 700; width: 100%;
          background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px;
          padding: 20px 24px !important; color: var(--text-primary); transition: all 0.3s;
          letter-spacing: -0.01em;
          margin-bottom: 24px;
        }
        @media (max-width: 1024px) {
          .title-input { font-size: 1.3rem !important; padding: 14px 16px !important; border-radius: 12px; }
        }
        .title-input:focus { border-color: var(--accent); background: var(--bg-primary); box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }

        .slug-input-wrapper { display: flex; align-items: center; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; overflow: hidden; }
        .slug-prefix { padding-left: 16px; font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono); }
        .slug-input { 
          flex: 1; border: none !important; background: transparent !important; padding: 12px 16px !important; 
          font-family: var(--font-mono); font-size: 0.85rem !important; color: var(--accent-soft) !important; 
        }

        .textarea-wrapper { border-radius: 16px; overflow: hidden; border: 1px solid var(--border-subtle); background: var(--bg-secondary); }
        .editor-toolbar {
          display: flex; align-items: center; gap: 8px; padding: 12px 16px; 
          background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle);
          position: sticky; top: 0; z-index: 10;
        }
        .editor-toolbar button {
          display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;
          border-radius: 8px; border: 1px solid transparent; background: transparent;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .editor-toolbar button:hover {
          color: var(--accent); background: rgba(124, 58, 237, 0.1); border-color: rgba(124, 58, 237, 0.2);
        }
        .toolbar-divider { width: 1px; height: 20px; background: var(--border-subtle); margin: 0 4px; }

        .content-textarea { 
          width: 100%; border: none !important; background: transparent !important; padding: 24px !important; 
          font-family: var(--font-mono); font-size: 1rem; line-height: 1.6; color: var(--text-secondary);
          resize: vertical; min-height: 600px;
        }

        .editor-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .sidebar-card { padding: 24px; }
        .sidebar-card h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 20px; color: var(--text-primary); }
        
        .sidebar-card textarea {
          width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px;
          padding: 12px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; resize: none;
        }

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

        .promo-card { background: linear-gradient(to bottom right, var(--bg-card), rgba(124, 58, 237, 0.05)); border-color: rgba(124, 58, 237, 0.1); }
        .promo-icon { color: var(--accent); margin-bottom: 12px; }
        .promo-card h4 { margin-bottom: 8px; font-size: 0.95rem; }
        .promo-card p { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; line-height: 1.4; }
        
        .btn-ghost-sm {
          display: flex; align-items: center; gap: 6px; background: rgba(124, 58, 237, 0.1); color: var(--accent-soft);
          border: 1px solid rgba(124, 58, 237, 0.2); padding: 8px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer;
          transition: all 0.2s; width: 100%; justify-content: center;
        }
        .btn-ghost-sm:hover { background: var(--accent); color: white; }

        /* Preview Styles */
        .full-preview-container {
          background: var(--bg-primary); border-radius: 32px; border: 1px solid var(--border-subtle); overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        .preview-header-bar {
          background: var(--bg-secondary); padding: 16px 32px; border-bottom: 1px solid var(--border-subtle);
          display: flex; justify-content: space-between; align-items: center;
        }
        .preview-badge {
          background: var(--accent); color: white; padding: 4px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .btn-secondary-sm {
          display: flex; align-items: center; gap: 6px; background: var(--bg-elevated); color: var(--text-primary);
          border: 1px solid var(--border-subtle); padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
        }

        .preview-content-wrapper {
          padding: 20px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .article-content-render {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.15rem;
        }
        .article-content-render h2 { font-size: 2rem; margin: 48px 0 24px; color: var(--text-primary); }
        .article-content-render p { margin-bottom: 24px; }
        .article-content-render code { background: var(--bg-elevated); padding: 3px 8px; border-radius: 6px; color: var(--accent-soft); font-size: 0.9em; }
        .article-content-render pre { background: var(--bg-elevated); padding: 24px; border-radius: 16px; margin: 32px 0; overflow-x: auto; border: 1px solid var(--border-subtle); font-size: inherit; }
      `}</style>
    </div>
  )
}
