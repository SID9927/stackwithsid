'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layout, 
  Type, 
  Globe,
  FileEdit
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RichTextEditor from '@/components/admin/RichTextEditor'

// Shared Components
import FormHeader from '@/components/admin/form/FormHeader'
import FormActions from '@/components/admin/form/FormActions'
import AdminFormStyles from '@/components/admin/form/AdminFormStyles'
import ArticleCategorization from '@/components/admin/form/ArticleCategorization'

// Frontend Components for Preview
import ArticleDetailLayout from '@/components/articles/ArticleDetailLayout'

export default function ArticleForm({ initialData = null, isEdit = false }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    published: initialData?.published || false,
    tags: initialData?.tags || [],
    category: initialData?.category || ''
  })
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('edit') // 'edit' | 'preview'
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true })
      
      if (!error && data) {
        setCategories(data.map(c => c.name))
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        content: initialData.content || '',
        excerpt: initialData.excerpt || '',
        published: initialData.published || false,
        tags: initialData.tags || [],
        category: initialData.category || ''
      })
    }
  }, [initialData])

  const handleTitleChange = (e) => {
    const title = e.target.value
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
    
    setFormData({ ...formData, title, slug: isEdit ? formData.slug : slug })
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
      <AdminFormStyles />
      
      <FormHeader 
        backLink="/admin/articles" 
        backText="All Articles" 
        title={isEdit ? 'Edit Article' : 'Draft New Article'} 
      />

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
                <FormActions 
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  published={formData.published}
                  onTogglePublished={() => setFormData({...formData, published: !formData.published})}
                  saving={saving}
                  saveText={isEdit ? 'Update Changes' : 'Publish Article'}
                  formId="article-form"
                />

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

                <ArticleCategorization 
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  onCategoryAdded={(newCat) => setCategories(prev => [...prev, newCat].sort())}
                  tagInput={tagInput}
                  setTagInput={setTagInput}
                />
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
                  category={formData.category || 'General'}
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

      <style jsx>{`
        .slug-input-wrapper { display: flex; align-items: center; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; overflow: hidden; }
        .slug-prefix { padding-left: 16px; font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono); }
        .slug-input { 
          flex: 1; border: none !important; background: transparent !important; padding: 12px 16px !important; 
          font-family: var(--font-mono); font-size: 0.85rem !important; color: var(--accent-soft) !important; 
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
