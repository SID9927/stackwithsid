'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Eye,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminInterviews() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setQuestions(data)
    setLoading(false)
  }

  const filtered = questions.filter(q => 
    q.question?.toLowerCase().includes(query.toLowerCase()) ||
    q.stack?.toLowerCase().includes(query.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    const { error } = await supabase.from('interview_questions').delete().eq('id', id)
    if (!error) setQuestions(prev => prev.filter(q => q.id !== id))
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Interview Management</h1>
          <p>Manage your bank of expert questions and pedagogical answers.</p>
        </div>
        <Link href="/admin/interviews/new" className="admin-btn btn-primary">
          <Plus size={18} /> New Question
        </Link>
      </header>

      <div className="table-actions glass-card">
        <div className="search-box">
          <Search size={18} />
          <input 
            placeholder="Search by question or tech stack..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button className="admin-btn btn-secondary">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="table-wrapper glass-card">
        {loading ? (
          <div className="loading-state">Loading questions...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Stack</th>
                <th>Difficulty</th>
                <th>Company</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id}>
                  <td className="q-cell">
                    <span className="q-text">{q.question}</span>
                  </td>
                  <td>
                    <span className="stack-badge">{q.stack}</span>
                  </td>
                  <td>
                    <span className={`diff-badge ${q.difficulty?.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td><span className="company-text">{q.company || '—'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-cell">
                      <Link href={`/interview?q=${q.slug}`} target="_blank" className="icon-action view">
                        <Eye size={18} />
                      </Link>
                      <Link href={`/admin/interviews/${q.slug}`} className="icon-action edit">
                        <Pencil size={18} />
                      </Link>
                      <button onClick={() => handleDelete(q.id)} className="icon-action delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">No questions found matching your search.</div>
        )}
      </div>

      <style jsx>{`
        .admin-page { max-width: 1200px; margin: 0 auto; }
        @media (max-width: 768px) {
          .admin-page { padding: 0 16px; }
        }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; gap: 20px; }
        @media (max-width: 768px) {
          .page-header { flex-direction: column; align-items: flex-start; }
          .page-header h1 { font-size: 1.5rem; }
          .admin-btn.btn-primary { width: 100%; justify-content: center; }
        }
        .page-header h1 { font-family: Syne, sans-serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
        .page-header p { color: var(--text-muted); font-size: 0.95rem; }
        
        .table-actions {
          padding: 16px; margin-bottom: 24px; display: flex; gap: 16px;
        }
        @media (max-width: 768px) {
          .table-actions { flex-direction: column; padding: 12px; }
          .admin-btn.btn-secondary { width: 100%; justify-content: center; }
        }
        .search-box {
          flex: 1; position: relative;
        }
        .search-box input {
          width: 100%; height: 44px; background: var(--bg-secondary); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 0 16px 0 44px; color: var(--text-primary); outline: none; font-size: 0.9rem;
        }
        .search-box input:focus { border-color: var(--accent); }
        .search-box :global(svg) { position: absolute; left: 14px; top: 13px; color: var(--text-muted); }

        .table-wrapper { overflow: hidden; }
        @media (max-width: 768px) {
          .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .admin-table { min-width: 900px; }
        }
        
        .q-cell { max-width: 400px; }
        .q-text { 
          display: block; font-weight: 600; color: var(--text-primary); 
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
        }

        .stack-badge {
          background: var(--bg-elevated); color: var(--accent-soft);
          padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: 1px solid var(--border-subtle);
        }

        .diff-badge {
          padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
        }
        .diff-badge.beginner { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .diff-badge.intermediate { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); }
        .diff-badge.advanced { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

        .company-text { color: var(--text-muted); font-weight: 500; }

        .actions-cell { display: flex; gap: 8px; justify-content: flex-end; align-items: center; flex-wrap: nowrap; }
        .icon-action {
          width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; color: var(--text-muted);
          cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0; text-decoration: none;
        }
        .icon-action:hover { 
          transform: translateY(-2px); 
          color: var(--accent); 
          background: rgba(124, 58, 237, 0.1); 
        }
        .icon-action.view:hover, .icon-action.edit:hover {
          color: var(--accent);
          background: rgba(124, 58, 237, 0.12);
        }
        .icon-action.delete:hover { 
          color: #ef4444; 
          background: rgba(239, 68, 68, 0.12); 
        }

        .loading-state, .empty-state { padding: 80px; text-align: center; color: var(--text-muted); font-size: 0.9rem; }
      `}</style>
    </div>
  )
}
