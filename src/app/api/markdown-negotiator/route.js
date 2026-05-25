import { supabase } from '@/lib/supabase'
import { localTools } from '@/components/tools/ToolsClient'

function htmlToMarkdown(html) {
  if (!html) return ''
  let markdown = html

  // Code blocks: <pre><code>...</code></pre>
  markdown = markdown.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
    const cleanCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
    return `\n\`\`\`javascript\n${cleanCode.trim()}\n\`\`\`\n`
  })

  // Inline code <code>...</code>
  markdown = markdown.replace(/<code>(.*?)<\/code>/gi, '`$1`')

  // Headers <h1> through <h3>
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')

  // Paragraphs
  markdown = markdown.replace(/<p>(.*?)<\/p>/gi, '$1\n\n')

  // List items
  markdown = markdown.replace(/<li>(.*?)<\/li>/gi, '- $1\n')
  markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/gi, '$1\n')
  markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/gi, '$1\n')

  // Bold and italics
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b>(.*?)<\/b>/gi, '**$1**')
  markdown = markdown.replace(/<em>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i>(.*?)<\/i>/gi, '*$1*')

  // Links
  markdown = markdown.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

  // Clean up excessive line breaks
  markdown = markdown.replace(/\n{3,}/g, '\n\n')

  return markdown.trim()
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || '/'
  const baseUrl = 'https://stack.dsiddharth.in'

  let markdown = ''

  if (path === '/' || path === '') {
    // 1. Homepage
    markdown = `# StackWithSid — Premium Dev Content Platform

Welcome to StackWithSid, a modern dev content platform and toolbox designed by Sid.

## Available Resources
* [Articles](${baseUrl}/articles) — Deep-dive technical articles on modern web development.
* [Interview Prep](${baseUrl}/interview) — Curated Q&As for React, Node.js, DSA, and System Design.
* [Dev Tools](${baseUrl}/tools) — Interactive client-side developer sandboxes.

## Current Stats
* Articles: Active dynamic count from our database.
* Dev Tools: ${localTools.length} interactive sandboxes.
* Q&As: Active Q&As covering system design & frameworks.
`
  } else if (path.startsWith('/articles/')) {
    // 2. Specific Article
    const slug = path.replace('/articles/', '')
    const { data: article } = supabase
      ? await supabase.from('articles').select('*').eq('slug', slug).eq('published', true).maybeSingle()
      : { data: null }

    if (article) {
      markdown = `# ${article.title}

*Published on: ${new Date(article.created_at).toLocaleDateString()}*
*Category: ${article.category || 'Development'}*

${article.excerpt ? `> ${article.excerpt}\n\n` : ''}
${htmlToMarkdown(article.content)}
`
    } else {
      markdown = `# Article Not Found

The requested article could not be found or is not published yet. Return to [Articles](${baseUrl}/articles).`
    }
  } else if (path === '/articles') {
    // 3. Articles Directory
    const { data: articles } = supabase
      ? await supabase.from('articles').select('title, slug, excerpt').eq('published', true).order('created_at', { ascending: false })
      : { data: [] }

    markdown = `# Technical Articles

Explore our latest deep-dive articles on software engineering:

${(articles || []).map(a => `* **[${a.title}](${baseUrl}/articles/${a.slug})**\n  ${a.excerpt || ''}`).join('\n\n')}
`
  } else if (path === '/interview') {
    // 4. Interview Prep
    const { data: questions } = supabase
      ? await supabase.from('interview_questions').select('question, answer, stack, difficulty, slug').eq('published', true).order('created_at', { ascending: false })
      : { data: [] }

    markdown = `# Interview Prep Q&As

Master your next technical interview with our curated list of questions:

${(questions || []).map(q => `## ${q.question}\n*Stack: ${q.stack} | Difficulty: ${q.difficulty}*\n\n${htmlToMarkdown(q.answer)}`).join('\n\n---\n\n')}
`
  } else if (path === '/tools') {
    // 5. Developer Tools
    markdown = `# Developer Tools & Sandboxes

Exposing our interactive tools. These run completely client-side in the browser:

${localTools.map(t => `* **[${t.name}](${baseUrl}${t.url})**\n  ${t.description}`).join('\n\n')}
`
  } else {
    // 6. Generic Fallback
    markdown = `# StackWithSid

Requested path: \`${path}\`

Return to [Homepage](${baseUrl}/) to view all articles, developer tools, and interview preparation resources.`
  }

  const tokenCount = Math.ceil(markdown.length / 4)

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(tokenCount),
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
