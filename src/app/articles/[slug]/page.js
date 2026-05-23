import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { readingTime } from '@/lib/utils'
import ArticleDetailLayout from '@/components/articles/ArticleDetailLayout'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', resolvedParams.slug)
    .single()
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [`/api/og?title=${encodeURIComponent(article.title)}`],
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('published', true)
    .single()

  if (!article) notFound()

  const publishDate = article.created_at
    ? new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''
  const calcReadTime = article.read_time || readingTime(article.content || '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': article.title,
    'description': article.excerpt || article.title,
    'datePublished': article.created_at,
    'dateModified': article.updated_at || article.created_at,
    'author': {
      '@type': 'Person',
      'name': 'Sid',
      'url': 'https://stack.dsiddharth.in',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'SidStack',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://stack.dsiddharth.in/icon.svg',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://stack.dsiddharth.in/articles/${article.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailLayout
        id={article.id}
        title={article.title}
        tags={article.tags || []}
        category={article.category}
        publishDate={publishDate}
        readTime={calcReadTime}
      >
        <div
          className="article-content-render"
          dangerouslySetInnerHTML={{ __html: article.content || '<p>Content coming soon.</p>' }}
        />
      </ArticleDetailLayout>
    </>
  )
}
