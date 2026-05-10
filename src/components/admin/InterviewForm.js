'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Type, 
  FileEdit,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RichTextEditor from '@/components/admin/RichTextEditor'

// Shared Components
import FormHeader from '@/components/admin/form/FormHeader'
import FormActions from '@/components/admin/form/FormActions'
import AdminFormStyles from '@/components/admin/form/AdminFormStyles'
import InterviewCategorization from '@/components/admin/form/InterviewCategorization'

// Frontend Components for Preview
import InterviewDetailView from '@/components/interview/InterviewDetailView'

export default function InterviewForm({ initialData = null, isEdit = false }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    question: '',
    slug: '',
    answer: '',
    hiring_insight: '',
    difficulty: 'Beginner',
    stack: 'React',
    company: '',
    published: true,
    is_frequent: false
  })
  const [techStacks, setTechStacks] = useState(['React', 'JavaScript', 'Node.js', 'Next.js', 'TypeScript', 'System Design', 'CSS'])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('edit') // 'edit' | 'preview'

  useEffect(() => {
    async function fetchTechStacks() {
      const { data, error } = await supabase
        .from('tech_stacks')
        .select('name')
        .order('name')
      
      if (!error && data) {
        setTechStacks(data.map(s => s.name))
      }
    }
    fetchTechStacks()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        hiring_insight: initialData.hiring_insight || '',
        published: initialData.published ?? true
      })
    }
  }, [initialData])

  // Auto-slug generation
  useEffect(() => {
    if (!isEdit && formData.question) {
      const generated = formData.question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug: generated }))
    }
  }, [formData.question, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const fn = isEdit 
      ? supabase.from('interview_questions').update(formData).eq('id', initialData.id)
      : supabase.from('interview_questions').insert([formData])
    
    const { error } = await fn
    if (!error) {
      router.push('/admin/interviews')
      router.refresh()
    } else {
      console.error('Supabase Error:', error)
      alert('Error saving question: ' + error.message)
      setSaving(false)
    }
  }

  return (
    <div className="form-container">
      <AdminFormStyles />

      <FormHeader 
        backLink="/admin/interviews" 
        backText="All Questions" 
        title={isEdit ? 'Edit Interview Question' : 'Create Interview Content'} 
      />

      <div className="editor-layout-wrapper">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.form 
              key="edit"
              id="interview-form"
              onSubmit={handleSubmit} 
              className="editor-grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="editor-main glass-card">
                <div className="field-group">
                  <label><Type size={16} /> The Question</label>
                  <input 
                    required
                    value={formData.question}
                    onChange={e => setFormData({...formData, question: e.target.value})}
                    placeholder="e.g. How does the Virtual DOM work in React?"
                    className="title-input"
                  />
                </div>

                <div className="field-group">
                  <label><Zap size={16} /> URL Slug</label>
                  <div className="slug-input-wrapper">
                    <span className="slug-prefix">stackwithsid.com/interview/</span>
                    <input 
                      required
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      placeholder="how-does-virtual-dom-work"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label><FileEdit size={16} /> Expert Explanation</label>
                  <RichTextEditor
                    value={formData.answer}
                    onChange={(html) => setFormData({ ...formData, answer: html })}
                    placeholder="Craft a detailed, high-fidelity explanation for this question..."
                    label="EXPLANATION EDITOR"
                  />
                </div>

                <div className="field-group mt-8">
                  <label><Zap size={16} /> Hiring Insight</label>
                  <p className="field-hint">A short, punchy insight about what interviewers are looking for.</p>
                  <textarea 
                    value={formData.hiring_insight}
                    onChange={e => setFormData({...formData, hiring_insight: e.target.value})}
                    placeholder="e.g. Mentioning reconciliation and diffing algorithms shows senior-level maturity..."
                    rows={4}
                    className="insight-textarea"
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
                  saveText={isEdit ? 'Update Question' : 'Publish Mastery'}
                  formId="interview-form"
                />

                <div className="sidebar-card glass-card">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-bold text-primary">Top Frequent?</span>
                    <input 
                      type="checkbox" 
                      checked={formData.is_frequent}
                      onChange={e => setFormData({...formData, is_frequent: e.target.checked})}
                      className="w-5 h-5 accent-purple-600"
                    />
                  </label>
                  <p className="text-xs text-muted mt-2">Questions marked as frequent will appear in the "Frequent" tab on the frontend.</p>
                </div>

                <InterviewCategorization 
                  formData={formData}
                  setFormData={setFormData}
                  techStacks={techStacks}
                  onStackAdded={(newStack) => setTechStacks(prev => [...prev, newStack].sort())}
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
                </div>
                <button onClick={() => setActiveTab('edit')} className="btn-secondary-sm">
                  <FileEdit size={14} /> Back to Editor
                </button>
              </div>
              <div className="preview-content-wrapper">
                <InterviewDetailView q={formData} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .insight-textarea {
          width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px;
          padding: 16px; color: var(--text-primary); font-size: 0.95rem; line-height: 1.6; resize: vertical;
        }
        .insight-textarea:focus { border-color: var(--accent); background: var(--bg-primary); }

        .slug-input-wrapper {
          display: flex; align-items: center; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; overflow: hidden;
        }
        .slug-prefix { padding: 0 12px; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-right: 1px solid var(--border-subtle); background: rgba(255,255,255,0.02); height: 44px; display: flex; align-items: center; }
        .slug-input-wrapper input { flex: 1; border: none; background: transparent; height: 44px; padding: 0 12px; color: var(--accent-soft); font-family: monospace; font-size: 0.9rem; outline: none; }
      `}</style>
    </div>
  )
}
