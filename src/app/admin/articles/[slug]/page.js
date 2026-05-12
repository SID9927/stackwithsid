'use client'

import { useState, useEffect } from 'react'
import ArticleForm from '@/components/admin/ArticleForm'
import { supabase } from '@/lib/supabase'

export default function EditArticlePage({ params }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState(null)

  // 1. Unwrap the Promise-based params (Next.js 15+)
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params
      setSlug(resolved.slug)
    }
    resolveParams()
  }, [params])

  // 2. Fetch data as the authenticated user
  useEffect(() => {
    if (!slug) return
    
    async function loadArticle() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single()
        
      if (error) {
        console.error('Error fetching article:', error)
      } else {
        setArticle(data)
      }
      setLoading(false)
    }
    
    loadArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="admin-content" style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--text-muted)' }}>
        Loading article data...
      </div>
    )
  }

  if (!article) {
    return (
      <div className="admin-content" style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: '#ef4444' }}>
        <h2>Article not found or access denied.</h2>
      </div>
    )
  }

  return (
    <div className="admin-content">
      <ArticleForm initialData={article} isEdit={true} />
    </div>
  )
}
