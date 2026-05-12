'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setArticles(data)
    setLoading(false)
  }

  const filtered = articles.filter(a => 
    a.title?.toLowerCase().includes(query.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Delete this article forever?')) return
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (!error) setArticles(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Article Management</h1>
          <p>Create and refine deep-tech guides for the community.</p>
        </div>
        <Link href="/admin/articles/new" className="admin-btn btn-primary">
          <Plus size={18} /> Create Article
        </Link>
      </header>

      <div className="table-actions glass-card">
        <div className="search-box">
          <Search size={18} />
          <input 
            placeholder="Search guides by title..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper glass-card">
        {loading ? (
          <div className="loading-state">Loading guides...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Status</th>
                <th>Created</th>
                <th>Read Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="title-cell">
                    <div className="title-info">
                      <span className="a-title">{a.title}</span>
                      <span className="a-slug">/{a.slug}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${a.published ? 'live' : 'draft'}`}>
                      {a.published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <span className="date-text">{formatDate(a.created_at)}</span>
                  </td>
                  <td>
                    <span className="read-text"><Clock size={12} /> 8 min</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-cell">
                      <Link href={`/articles/${a.slug}`} target="_blank" className="icon-action view">
                        <Eye size={18} />
                      </Link>
                      <Link href={`/admin/articles/${a.slug}`} className="icon-action edit">
                        <Pencil size={18} />
                      </Link>
                      <button onClick={() => handleDelete(a.id)} className="icon-action delete">
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
          <div className="empty-state">Start your first technical guide!</div>
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
 
        .table-actions { padding: 16px; margin-bottom: 24px; }
        @media (max-width: 768px) {
          .table-actions { padding: 12px; }
        }
        .search-box { position: relative; }
        .search-box input {
          width: 100%; height: 44px; background: var(--bg-secondary); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 0 16px 0 44px; color: var(--text-primary); outline: none; font-size: 0.9rem;
        }
        .search-box input:focus { border-color: var(--accent); }
        .search-box :global(svg) { position: absolute; left: 14px; top: 13px; color: var(--text-muted); }
        
        .table-wrapper { overflow: hidden; }
        @media (max-width: 768px) {
          .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .admin-table { min-width: 850px; }
        }

        .title-cell { max-width: 380px; }
        .title-info { display: flex; flex-direction: column; }
        .a-title { font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.95rem; }
        .a-slug { font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px; }

        .status-badge {
          padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
        }
        .status-badge.live { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .status-badge.draft { background: var(--bg-elevated); color: var(--text-muted); border: 1px solid var(--border-subtle); }

        .date-text, .read-text { font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }

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

        .loading-state, .empty-state { padding: 80px; text-align: center; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
