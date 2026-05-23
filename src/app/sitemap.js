import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // Revalidate the sitemap every hour

export default async function sitemap() {
  // Use the production URL for sitemap generation
  const baseUrl = 'https://stack.dsiddharth.in'

  // Define static routes
  const staticRoutes = [
    '',
    '/articles',
    '/interview',
    '/tools',
    '/discuss',
    '/videos',
    '/contact'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))

  // Fetch dynamic articles
  const { data: articles } = supabase 
    ? await supabase
        .from('articles')
        .select('slug, updated_at')
        .eq('published', true)
    : { data: [] }

  const articleRoutes = (articles || []).map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Fetch the latest interview question to reflect updates on the /interview page
  const { data: latestInterview } = supabase
    ? await supabase
        .from('interview_questions')
        .select('updated_at')
        .eq('published', true)
        .order('updated_at', { ascending: false })
        .limit(1)
    : { data: [] }

  if (latestInterview && latestInterview.length > 0) {
    const interviewRouteIndex = staticRoutes.findIndex(r => r.url === `${baseUrl}/interview`)
    if (interviewRouteIndex !== -1) {
      staticRoutes[interviewRouteIndex].lastModified = new Date(latestInterview[0].updated_at)
      staticRoutes[interviewRouteIndex].changeFrequency = 'daily'
    }
  }

  // Fetch the latest article to update the /articles listing page
  if (articles && articles.length > 0) {
    // Sort to get latest
    const latestArticle = [...articles].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]
    const articlesRouteIndex = staticRoutes.findIndex(r => r.url === `${baseUrl}/articles`)
    if (articlesRouteIndex !== -1 && latestArticle.updated_at) {
      staticRoutes[articlesRouteIndex].lastModified = new Date(latestArticle.updated_at)
      staticRoutes[articlesRouteIndex].changeFrequency = 'daily'
    }
  }

  // Fetch dynamic interview questions
  const { data: interviewQuestions } = supabase
    ? await supabase
        .from('interview_questions')
        .select('slug, updated_at')
        .eq('published', true)
    : { data: [] }

  const interviewRoutes = (interviewQuestions || []).map((question) => ({
    url: `${baseUrl}/interview?q=${question.slug}`,
    lastModified: question.updated_at ? new Date(question.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...articleRoutes, ...interviewRoutes]
}
