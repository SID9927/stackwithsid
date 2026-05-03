'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  ChevronLeft, 
  Sparkles, 
  Layout, 
  Type, 
  Eye,
  CheckCircle2,
  Circle,
  FileEdit,
  Zap,
  Building2,
  Award,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RichTextEditor from '@/components/admin/RichTextEditor'

// Frontend Components for Preview
import InterviewDetailView from '@/components/interview/InterviewDetailView'

// ── CUSTOM DROPDOWN COMPONENT ──
function CustomDropdown({ value, options, onChange, label, icon: Icon, upward = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`custom-dropdown-container ${upward ? 'upward' : ''}`} ref={containerRef}>
      <label className="dropdown-label">{Icon && <Icon size={14} />} {label}</label>
      <button 
        type="button" 
        className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`arrow ${isOpen ? 'rotate' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.ul 
            className="dropdown-menu glass-card"
            initial={{ opacity: 0, y: upward ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: upward ? -10 : 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {options.map(opt => (
              <li 
                key={opt} 
                className={`dropdown-item ${value === opt ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
              >
                {opt}
                {value === opt && <CheckCircle2 size={14} className="check" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function InterviewForm({ initialData = null, isEdit = false }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    hiring_insight: '',
    difficulty: 'Beginner',
    stack: 'React',
    company: '',
    published: true
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('edit') // 'edit' | 'preview'

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
      <header className="form-header">
        <div className="header-main">
          <Link href="/admin/interviews" className="back-link">
            <ChevronLeft size={18} /> All Questions
          </Link>
          <h1>{isEdit ? 'Edit Interview Question' : 'Create Mastery Content'}</h1>
          <div className="header-placeholder" style={{ width: 100 }}></div>
        </div>
      </header>

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
                  <label><FileEdit size={16} /> Expert Explanation</label>
                  <RichTextEditor
                    value={formData.answer}
                    onChange={(html) => setFormData({ ...formData, answer: html })}
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
                <div className="glass-card actions-card">
                  <div className="actions-row">
                    <div className="tab-switcher-mini">
                      <button 
                        type="button"
                        className={activeTab === 'edit' ? 'active' : ''} 
                        onClick={() => setActiveTab('edit')}
                      >
                        <FileEdit size={16} />
                      </button>
                      <button 
                        type="button"
                        className={activeTab === 'preview' ? 'active' : ''} 
                        onClick={() => setActiveTab('preview')}
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
                    form="interview-form"
                    disabled={saving} 
                    className="admin-btn btn-primary publish-btn"
                  >
                    <Save size={18} /> 
                    <span>{saving ? 'Saving...' : (isEdit ? 'Update Question' : 'Publish Mastery')}</span>
                  </button>
                </div>

                <div className="sidebar-card glass-card">
                  <h3><Layout size={16} /> Categorization</h3>
                  
                  <CustomDropdown 
                    label="Difficulty"
                    value={formData.difficulty}
                    options={['Beginner', 'Intermediate', 'Advanced']}
                    icon={Award}
                    onChange={(val) => setFormData({...formData, difficulty: val})}
                  />

                  <CustomDropdown 
                    label="Tech Stack"
                    value={formData.stack}
                    options={['React', 'JavaScript', 'Node.js', 'Next.js', 'TypeScript', 'System Design', 'CSS']}
                    icon={Zap}
                    onChange={(val) => setFormData({...formData, stack: val})}
                    upward={true}
                  />

                  <div className="field-group">
                    <label><Building2 size={14} /> Target Company</label>
                    <input 
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      placeholder="e.g. Meta, Google, Amazon"
                    />
                  </div>
                </div>

                <div className="sidebar-tip glass-card">
                  <h4><Sparkles size={14} /> Pedagogy Tip</h4>
                  <p>Structure your answer with <strong>H2/H3 headings</strong> and <strong>bullet points</strong>.</p>
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

      <style jsx global>{`
        .form-container { max-width: 1400px; margin: 0 auto; }
        .form-header { margin-bottom: 32px; }
        .header-main { display: flex; justify-content: space-between; align-items: center; }
        .back-link { display: flex; align-items: center; gap: 8px; color: var(--text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 600; }
        .back-link:hover { color: var(--accent); }
        .form-header h1 { font-family: Syne, sans-serif; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; }

        .editor-layout-wrapper { min-height: 800px; }
        .editor-grid { display: flex; gap: 24px; align-items: flex-start; position: relative; width: 100%; }
        .editor-main { flex: 1; min-width: 0; padding: 40px; }

        .title-input { 
          font-family: Syne, sans-serif; font-size: 1.8rem !important; font-weight: 700; width: 100%;
          background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px;
          padding: 20px 24px !important; color: var(--text-primary); transition: all 0.3s;
          letter-spacing: -0.01em; margin-bottom: 24px;
        }
        .title-input:focus { border-color: var(--accent); background: var(--bg-primary); box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }

        input, select, textarea {
          width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 12px 16px; color: var(--text-primary); outline: none; font-size: 0.95rem; transition: all 0.2s;
        }
        input:focus, textarea:focus { border-color: var(--accent); background: var(--bg-primary); box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); }

        .custom-dropdown-container { margin-bottom: 24px; position: relative; }
        .dropdown-label { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; margin-bottom: 10px; }
        .dropdown-trigger {
          width: 100%; height: 48px; background: var(--bg-secondary); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 0 16px; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: all 0.2s; font-size: 0.95rem;
        }
        .dropdown-trigger:hover, .dropdown-trigger.active { border-color: var(--accent); background: var(--bg-primary); }
        .dropdown-trigger .arrow { color: var(--text-muted); transition: transform 0.3s; }
        .dropdown-trigger .arrow.rotate { transform: rotate(180deg); color: var(--accent); }

        .dropdown-menu {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 100;
          background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 16px;
          padding: 8px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
          max-height: 260px; overflow-y: auto; overflow-x: hidden;
        }

        /* Custom Scrollbar for Dropdown */
        .dropdown-menu::-webkit-scrollbar { width: 6px; }
        .dropdown-menu::-webkit-scrollbar-track { background: transparent; }
        .dropdown-menu::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.2); border-radius: 10px; }
        .dropdown-menu::-webkit-scrollbar-thumb:hover { background: rgba(124, 58, 237, 0.4); }
        .custom-dropdown-container.upward .dropdown-menu {
          top: auto; bottom: calc(100% + 8px);
          box-shadow: 0 -20px 40px rgba(0,0,0,0.4);
        }
        .dropdown-item {
          padding: 12px 16px; border-radius: 10px; color: var(--text-secondary); font-size: 0.9rem;
          display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s;
        }
        .dropdown-item:hover { background: rgba(124, 58, 237, 0.08); color: var(--text-primary); }
        .dropdown-item.selected { background: rgba(124, 58, 237, 0.15); color: var(--accent-soft); font-weight: 700; }
        .dropdown-item .check { color: var(--accent); }

        .insight-textarea {
          width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px;
          padding: 16px; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; resize: vertical;
        }
        .insight-textarea:focus { border-color: var(--accent); background: var(--bg-primary); }

        .editor-sidebar { width: 340px; flex-shrink: 0; position: sticky; top: 32px; display: flex; flex-direction: column; gap: 24px; height: fit-content; }
        .actions-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; border-color: var(--accent-soft); }
        .actions-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .tab-switcher-mini { display: flex; background: var(--bg-secondary); padding: 4px; border-radius: 12px; border: 1px solid var(--border-subtle); flex: 1; }
        .tab-switcher-mini button { display: flex; align-items: center; justify-content: center; flex: 1; height: 32px; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .tab-switcher-mini button.active { background: var(--bg-elevated); color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        
        .status-toggle {
          display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 40px; border-radius: 12px;
          border: 1px solid var(--border-subtle); background: var(--bg-secondary); color: var(--text-muted);
          font-size: 0.8rem; font-weight: 700; cursor: pointer;
        }
        .status-toggle.published { border-color: var(--accent-soft); color: var(--accent); background: rgba(124, 58, 237, 0.05); }
        .publish-btn { width: 100%; justify-content: center; height: 48px; font-size: 0.95rem; }

        .sidebar-card { padding: 24px; }
        .sidebar-card h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; margin-bottom: 20px; color: var(--text-primary); }
        .field-group { margin-bottom: 24px; }
        .field-group label { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; margin-bottom: 10px; }
        .field-hint { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; }

        .sidebar-tip { padding: 20px; background: rgba(124, 58, 237, 0.05); border-color: rgba(124, 58, 237, 0.2); }
        .sidebar-tip h4 { font-size: 0.75rem; text-transform: uppercase; color: var(--accent-soft); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .sidebar-tip p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }

        .full-preview-container { background: var(--bg-primary); border-radius: 32px; border: 1px solid var(--border-subtle); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
        .preview-header-bar { background: var(--bg-secondary); padding: 16px 32px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
        .preview-badge { background: var(--accent); color: white; padding: 4px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .btn-secondary-sm { display: flex; align-items: center; gap: 6px; background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--border-subtle); padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .preview-content-wrapper { padding: 40px; max-height: 80vh; overflow-y: auto; background: var(--bg-primary); }

        @media (max-width: 1024px) {
          .editor-grid { flex-direction: column; }
          .editor-sidebar { width: 100%; position: relative; top: 0; }
          .editor-main { padding: 20px; }
        }
      `}</style>
    </div>
  )
}
