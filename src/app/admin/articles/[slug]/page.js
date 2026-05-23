'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ArticleForm from '@/components/admin/ArticleForm'
import { supabase } from '@/lib/supabase'

export default function EditArticlePage() {
  const params = useParams()
  const slug = params?.slug

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    async function loadArticle() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setNotFound(true)
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

  if (notFound || !article) {
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
