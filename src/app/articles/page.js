import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { formatDate, truncate } from '@/lib/utils'
import ArticleListClient from '@/components/articles/ArticleListClient'

export const metadata = {
  title: 'Articles',
  description: 'Technical deep-dives on modern web development — React, Node.js, System Design and more.',
}

// Force Next.js to dynamically render this page on every request
export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  // Query failed because 'read_time' column does not exist in the DB.
  // We remove it from the select.
  const { data: articles } = supabase
    ? await supabase.from('articles').select('id, title, slug, excerpt, tags, category, created_at').eq('published', true).order('created_at', { ascending: false })
    : { data: [] }

  const allArticles = articles || []

  return <ArticleListClient initialArticles={allArticles} />
}
