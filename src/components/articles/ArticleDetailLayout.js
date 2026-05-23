'use client'

import { useState, useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import markdown from 'highlight.js/lib/languages/markdown'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import plaintext from 'highlight.js/lib/languages/plaintext'

// Register all languages
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('cs', csharp)
hljs.registerLanguage('java', java)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('rb', ruby)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('plaintext', plaintext)
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import ArticleSidebar from './ArticleSidebar'
import UnifiedMobileBar from '@/components/common/UnifiedMobileBar'
import ArticleHeader from './ArticleHeader' 
import ShareModal from '@/components/common/ShareModal'
import SidebarDiscussion from './sidebar/SidebarDiscussion'
import CommentSection from './CommentSection'

export default function ArticleDetailLayout({ 
  id,
  children, 
  title, 
  tags, 
  category,
  publishDate,
  readTime
}) {
  const [stats, setStats] = useState({ likes: 0, comments: 0, isLiked: false, isBookmarked: false, recentComments: [] })
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  useEffect(() => {
    const container = document.querySelector('.article-content-render')
    if (!container) return

    const pres = container.querySelectorAll('pre')
    pres.forEach((pre) => {
      if (pre.parentElement.classList.contains('code-block-wrapper')) return

      const code = pre.querySelector('code')
      let lang = 'Plain Text'
      if (code) {
        const classes = Array.from(code.classList)
        const langClass = classes.find(c => c.startsWith('language-'))
        if (langClass) {
          const l = langClass.replace('language-', '')
          const langMap = {
            plaintext: 'Plain Text',
            html: 'HTML / XML',
            xml: 'XML',
            yaml: 'YAML',
            yml: 'YAML',
            javascript: 'JavaScript',
            js: 'JavaScript',
            typescript: 'TypeScript',
            ts: 'TypeScript',
            css: 'CSS',
            json: 'JSON',
            python: 'Python',
            py: 'Python',
            sql: 'SQL',
            bash: 'Bash / Shell',
            sh: 'Bash',
            markdown: 'Markdown',
            md: 'Markdown',
            cpp: 'C++',
            csharp: 'C#',
            cs: 'C#',
            java: 'Java',
            go: 'Go',
            rust: 'Rust',
            rs: 'Rust',
            php: 'PHP',
            ruby: 'Ruby',
            rb: 'Ruby',
            dockerfile: 'Dockerfile',
          }
          lang = langMap[l.toLowerCase()] || l.toUpperCase()
        }
      }

      const wrapper = document.createElement('div')
      wrapper.className = 'code-block-wrapper'

      const header = document.createElement('div')
      header.className = 'code-block-header'

      const left = document.createElement('div')
      left.className = 'code-block-header-left'
      left.innerHTML = `
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="code-block-lang-label">${lang}</span>
      `

      const copyBtn = document.createElement('button')
      copyBtn.type = 'button'
      copyBtn.className = 'code-block-copy-btn'
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        <span>Copy Code</span>
      `

      copyBtn.addEventListener('click', () => {
        const textToCopy = code ? code.textContent : pre.textContent
        navigator.clipboard.writeText(textToCopy || '').then(() => {
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-green"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="text-green">Copied!</span>
          `
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy Code</span>
            `
          }, 2000)
        })
      })

      header.appendChild(left)
      header.appendChild(copyBtn)
      wrapper.appendChild(header)

      pre.parentNode.insertBefore(wrapper, pre)
      wrapper.appendChild(pre)
    })
      // Highlight each code element
      pres.forEach((pre) => {
        const codeEl = pre.querySelector('code')
        if (codeEl) {
          try { hljs.highlightElement(codeEl) } catch (e) { /* ignore unknown lang */ }
        }
      })
  }, [children])

  useEffect(() => {
    if (!id) return

    async function fetchStats() {
      const { data: session } = await supabase.auth.getSession()
      const userId = session?.session?.user?.id

      // Fetch like count
      const { count: likes } = await supabase
        .from('article_likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', id)

      // Check if user liked
      let isLiked = false
      if (userId) {
        const { data: userLike } = await supabase
          .from('article_likes')
          .select('id')
          .eq('article_id', id)
          .eq('user_id', userId)
          .single()
        isLiked = !!userLike
      }

      // Check if user bookmarked
      let isBookmarked = false
      if (userId) {
        const { data: userBookmark, error: bookmarkError } = await supabase
          .from('article_bookmarks')
          .select('id')
          .eq('article_id', id)
          .eq('user_id', userId)
          .maybeSingle()
        
        if (bookmarkError) {
          console.error('Error checking bookmark status:', bookmarkError)
        }
        isBookmarked = !!userBookmark
      }

      // Fetch comment count
      const { count: comments } = await supabase
        .from('article_comments')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', id)

      // Fetch top 2 recent comments
      const { data: recentComments } = await supabase
        .from('article_comments')
        .select(`
          id,
          content,
          user_id,
          profiles (full_name, avatar_url)
        `)
        .eq('article_id', id)
        .order('created_at', { ascending: false })
        .limit(2)

      setStats({ 
        likes: likes || 0, 
        comments: comments || 0, 
        isLiked,
        isBookmarked,
        recentComments: recentComments || []
      })
    }

    fetchStats()
  }, [id])

  const handleLikeToggle = async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) {
      alert('Please sign in to like articles.')
      return
    }

    const userId = session.session.user.id

    if (stats.isLiked) {
      // Optimistic Update
      setStats(prev => ({ ...prev, likes: prev.likes - 1, isLiked: false }))
      await supabase.from('article_likes').delete().eq('article_id', id).eq('user_id', userId)
    } else {
      // Optimistic Update
      setStats(prev => ({ ...prev, likes: prev.likes + 1, isLiked: true }))
      await supabase.from('article_likes').insert({ article_id: id, user_id: userId })
    }
  }

  const handleBookmarkToggle = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      alert('Please sign in to save articles.')
      return
    }

    const userId = session.user.id
    const wasBookmarked = stats.isBookmarked

    // Sanity check
    if (!id) {
      console.error('Bookmark Error: Article ID is missing')
      alert('Could not save bookmark: Article ID is missing.')
      return
    }

    // Optimistic Update
    setStats(prev => ({ ...prev, isBookmarked: !wasBookmarked }))

    if (wasBookmarked) {
      const { error } = await supabase
        .from('article_bookmarks')
        .delete()
        .eq('article_id', id)
        .eq('user_id', userId)

      if (error) {
        setStats(prev => ({ ...prev, isBookmarked: true }))
        console.error('Error removing bookmark:', error)
        alert(`Could not remove bookmark: ${error.message || 'Please try again.'}`)
      }
    } else {
      const { error } = await supabase
        .from('article_bookmarks')
        .insert({ article_id: id, user_id: userId })

      if (error) {
        // If it's a unique constraint violation, it's already bookmarked, so we can just stay true
        if (error.code === '23505') {
          console.warn('Article already bookmarked')
          return
        }

        setStats(prev => ({ ...prev, isBookmarked: false }))
        console.error('Error adding bookmark:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          article_id: id,
          user_id: userId
        })
        alert(`Could not save bookmark: ${error.message || 'Permission denied or database error.'}`)
      }
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Read this Article: ${title}\n\nExplore more on SidStack:\n`,
      url: currentUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      setShareModalOpen(true)
    }
  }

  return (
    <main className="article-detail-page">
      {/* Share Modal */}
      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        title={title} 
        url={currentUrl} 
        type="Article" 
      />
      {/* Background Decorations */}
      <div className="bg-decorations">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="main-container">
        <ArticleHeader title={title} tags={tags} category={category} publishDate={publishDate} readTime={readTime} />

        <div className="article-layout lg:grid lg:grid-cols-[1fr_320px] lg:gap-[60px] items-start">
          {/* Main Content Column */}
          <div className="content-col">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.3, duration: 0.8 }}
              className="article-body-wrapper article-body"
            >
              {children}
            </motion.div>

            {/* Comments Section */}
            <div id="comments" style={{ marginTop: 64 }}>
              <CommentSection articleId={id} totalCount={stats.comments} />
            </div>

            {/* Mobile-only Discussion CTA (Hidden on Desktop) */}
            <div className="mt-10 lg:hidden px-[4%] mb-[120px]">
              <SidebarDiscussion />
            </div>
          </div>

          {/* Sidebar Column (Hidden on Mobile) */}
          <div className="hidden lg:block sticky top-[100px] h-fit">
            <ArticleSidebar 
              readTime={readTime} 
              likes={stats.likes} 
              isLiked={stats.isLiked}
              onLikeToggle={handleLikeToggle}
              isBookmarked={stats.isBookmarked}
              onBookmarkToggle={handleBookmarkToggle}
              onShare={handleShare}
              commentsCount={stats.comments} 
              recentComments={stats.recentComments}
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-100">
        <UnifiedMobileBar 
          likes={stats.likes} 
          isLiked={stats.isLiked}
          onLikeToggle={handleLikeToggle}
          onShare={handleShare}
          commentsCount={stats.comments} 
          onCommentClick={() => {
            const el = document.getElementById('comments')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          isBookmarked={stats.isBookmarked}
          onBookmarkToggle={handleBookmarkToggle}
        />
      </div>

      <style jsx global>{`
        .article-detail-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding-top: 30px;
          padding-bottom: 50px;
          position: relative;
          overflow-x: clip; /* Modern fix for horizontal scroll that doesn't break sticky */
        }

        .bg-decorations {
          position: absolute; 
          inset: 0; 
          pointer-events: none; 
          z-index: 0; 
          overflow: hidden;
          width: 100%;
          max-width: 100vw;
        }

        .orb {
          position: absolute; filter: blur(120px);
        }
        .orb-1 {
          top: 10%; right: -5%; width: 500px; height: 500px; 
          background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%); 
          opacity: 0.1;
        }
        .orb-2 {
          bottom: 20%; left: -5%; width: 600px; height: 600px; 
          background: radial-gradient(circle, var(--accent) 0%, transparent 70%); 
          opacity: 0.08;
        }

        .main-container {
          max-width: 1320px; margin: 0 auto; padding: 0 5%; position: relative; z-index: 1; width: 100%;
        }

        .article-layout {
          display: block;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .article-layout {
            display: grid; 
            grid-template-columns: minmax(0, 1fr) 320px; 
            gap: 60px; 
            align-items: start;
            justify-content: center;
          }
        }

        .content-col {
          max-width: 900px; width: 100%; min-width: 0;
        }

        .article-body-wrapper {
          background: var(--bg-card); 
          border: 1px solid var(--border-subtle); 
          border-radius: 32px;
          padding: clamp(24px, 5%, 56px); 
          box-shadow: var(--shadow-card); 
          color: var(--text-secondary);
          line-height: 1.65; 
          font-size: 1.15rem; 
          backdrop-filter: blur(10px);
          max-width: 100%;
          overflow: hidden; /* Ensure content doesn't bleed */
        }

        .article-body {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.15rem;
        }
        .article-body h2 { 
          font-family: Syne, sans-serif; 
          font-size: 2rem; 
          margin: 36px 0 18px; 
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .article-body h3 { font-family: Syne, sans-serif; font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 28px 0 14px; }
        .article-body p { margin-bottom: 24px; }
        .article-body strong { color: var(--text-primary); }
        .article-body em { font-style: italic; }
        .article-body a { color: var(--accent); text-decoration: underline; }
        .article-body blockquote {
          border-left: 4px solid var(--accent); padding: 16px 32px;
          margin: 40px 0; font-style: italic; color: var(--text-muted);
          font-size: 1.2rem; line-height: 1.6;
          background: rgba(124, 58, 237, 0.04); border-radius: 0 12px 12px 0;
        }
        .article-body code { font-family: var(--font-mono); background: var(--bg-elevated); padding: 3px 8px; border-radius: 6px; font-size: 0.88em; color: var(--accent-soft); }
        /* Code Block Wrapper */
        .code-block-wrapper {
          position: relative;
          background: #0d0d12 !important;
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          margin: 32px 0;
          overflow: hidden;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.5), 0 8px 30px rgba(0,0,0,0.3);
        }

        .code-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          user-select: none;
        }

        .code-block-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .code-block-header-left .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .code-block-header-left .dot.red { background: #ff5f56; }
        .code-block-header-left .dot.yellow { background: #ffbd2e; }
        .code-block-header-left .dot.green { background: #27c93f; }

        .code-block-lang-label {
          color: #a0aec0;
          font-size: 0.75rem;
          font-weight: 700;
          font-family: var(--font-mono);
          margin-left: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .code-block-copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          color: #a0aec0;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .code-block-copy-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.2);
        }
        .code-block-copy-btn .text-green {
          color: #4ade80 !important;
        }

        .code-block-wrapper pre {
          margin: 0 !important;
          padding: 20px 24px !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          overflow-x: auto;
          position: relative;
          -webkit-overflow-scrolling: touch;
        }
        .code-block-wrapper pre::-webkit-scrollbar {
          height: 10px;
        }
        .code-block-wrapper pre::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .code-block-wrapper pre::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.55);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .code-block-wrapper pre::-webkit-scrollbar-thumb:hover {
          background: var(--accent);
          border: 1px solid transparent;
          background-clip: padding-box;
        }
        .code-block-wrapper pre::before {
          display: none !important;
        }
        .code-block-wrapper pre code {
          background: none !important;
          color: #e2e8f0 !important;
          padding: 0 !important;
          font-size: 0.92rem !important;
          line-height: 1.7 !important;
          font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
        }
        .article-body ul, .article-body ol { padding-left: 28px; margin-bottom: 20px; }

        /* ── Syntax Highlight Tokens ───────────────────────────── */
        .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-section, .hljs-link { color: #c792ea !important; }
        .hljs-function .hljs-keyword { color: #82aaff !important; }
        .hljs-type, .hljs-class .hljs-title, .hljs-title.class_ { color: #ffcb6b !important; }
        .hljs-title, .hljs-title.function_ { color: #82aaff !important; }
        .hljs-string, .hljs-meta .hljs-string, .hljs-attribute, .hljs-symbol, .hljs-bullet, .hljs-addition { color: #c3e88d !important; }
        .hljs-number, .hljs-variable.constant_, .hljs-template-variable { color: #f78c6c !important; }
        .hljs-comment, .hljs-quote { color: #546e7a !important; font-style: italic !important; }
        .hljs-deletion, .hljs-meta, .hljs-regexp { color: #ff5370 !important; }
        .hljs-built_in, .hljs-builtin-name { color: #89ddff !important; }
        .hljs-tag, .hljs-name { color: #f07178 !important; }
        .hljs-attr { color: #ffcb6b !important; }
        .hljs-params, .hljs-operator, .hljs-punctuation { color: #89ddff !important; }
        .hljs-property { color: #80cbc4 !important; }
        .hljs-variable { color: #eeffff !important; }
        .hljs-selector-class { color: #ffcb6b !important; }
        .hljs-selector-id { color: #82aaff !important; }
        .hljs-selector-attr { color: #c3e88d !important; }
        .hljs-subst { color: #eeffff !important; }
        .hljs-emphasis { font-style: italic !important; }
        .hljs-strong { font-weight: bold !important; }
        .article-body li { margin-bottom: 6px; line-height: 1.6; }
        .article-body ul li { list-style-type: disc; }
        .article-body ol li { list-style-type: decimal; }
        .article-body hr { border: none; border-top: 1px solid var(--border-subtle); margin: 48px 0; }

        /* ── Article Images (user view) ───────────────────────────── */
        .article-image {
          display: block;
          margin: 32px auto;
          border-radius: 12px;
          overflow: hidden;
          max-width: 100%;
        }
        .article-image.align-left {
          float: left;
          margin: 8px 28px 20px 0;
        }
        .article-image.align-right {
          float: right;
          margin: 8px 0 20px 28px;
        }
        .article-image.align-center {
          margin-left: auto;
          margin-right: auto;
        }
        .article-image.align-full {
          width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          border-radius: 16px;
        }
        .article-image img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 10px;
          object-fit: cover;
        }
        .article-image figcaption {
          font-size: 0.82rem;
          font-style: italic;
          color: var(--text-muted);
          text-align: center;
          padding: 8px 12px 4px;
          line-height: 1.5;
          background: rgba(0,0,0,0.25);
          border-radius: 0 0 10px 10px;
        }
        /* Clear floats after images */
        .article-body p + .article-image,
        .article-image + p { clear: both; }
        /* Mobile: all images go full width */
        @media (max-width: 768px) {
          .article-image,
          .article-image.align-left,
          .article-image.align-right,
          .article-image.align-center {
            float: none !important;
            width: 100% !important;
            margin: 24px 0 !important;
            border-radius: 12px !important;
          }
        }

        /* Tables */
        .article-body table {
          border-collapse: collapse;
          table-layout: auto !important; /* Allow natural width calculation */
          width: 100% !important;
          margin: 32px 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
        }
        .article-body th {
          background: rgba(124, 58, 237, 0.15);
          color: var(--accent);
          font-weight: 800;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 20px;
          border: 1px solid rgba(124, 58, 237, 0.3);
          text-align: left;
          white-space: normal !important; 
          word-break: normal;
        }
        .article-body td {
          padding: 14px 20px;
          border: 1px solid rgba(124, 58, 237, 0.15);
          color: var(--text-secondary);
          vertical-align: top;
          transition: background 0.2s;
          word-break: normal;
        }
        .article-body tr:nth-child(even) td {
          background: rgba(255, 255, 255, 0.01);
        }
        .article-body tr:hover td {
          background: rgba(124, 58, 237, 0.04);
        }

        /* Table Alignment Support */
        .article-body table[style*="text-align: center"] { margin-left: auto !important; margin-right: auto !important; }
        .article-body table[style*="text-align: right"] { margin-left: auto !important; margin-right: 0 !important; }
        .article-body table[style*="text-align: left"] { margin-left: 0 !important; margin-right: auto !important; }

        /* Support for Tiptap's tableWrapper */
        .tableWrapper {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: auto !important;
          margin: 32px 0;
          -webkit-overflow-scrolling: touch;
          display: block !important;
        }

        .tableWrapper::-webkit-scrollbar {
          height: 8px !important;
        }
        .tableWrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05) !important;
          border-radius: 10px;
        }
        .tableWrapper::-webkit-scrollbar-thumb {
          background: var(--accent) !important;
          border-radius: 10px;
          border: 2px solid var(--bg-card);
        }
        .tableWrapper::-webkit-scrollbar-thumb:hover {
          background: var(--accent-glow) !important;
        }

        @media (max-width: 1024px) {
          .article-content-render table {
            display: block !important;
            width: 100% !important;
            overflow-x: auto !important;
          }
        }

        /* Callout Cards */
        .article-body .callout {
          margin: 40px 0;
          padding: 24px 28px;
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
          background: rgba(255, 255, 255, 0.02);
        }
        .article-body .callout-success {
          border-color: rgba(0, 255, 170, 0.25);
          background: rgba(0, 255, 170, 0.04);
        }
        .article-body .callout-success strong { color: #00ffaa; }
        .article-body .callout-info {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(59, 130, 246, 0.05);
        }
        .article-body .callout-info strong { color: #60a5fa; }
        .article-body .callout-tip {
          border-color: rgba(245, 158, 11, 0.3);
          background: rgba(245, 158, 11, 0.05);
        }
        .article-body .callout-tip strong { color: #fbbf24; }
        .article-body .callout-warning {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }
        .article-body .callout-warning strong { color: #f87171; }
        .article-body .callout p { margin-bottom: 8px; }
        .article-body .callout p:last-child { margin-bottom: 0; }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: transparent; border-radius: 10px; transition: background 0.4s ease;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: var(--border-subtle); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--accent) !important; }

        .custom-scrollbar.hinting::-webkit-scrollbar-thumb {
          animation: thumbHint 2s ease-in-out;
        }

        @keyframes thumbHint {
          0%, 100% { background: transparent; }
          30%, 70% { background: var(--accent-soft); }
        }

        .mobile-cta-section {
          display: none;
          margin-top: 40px;
        }

        @media (max-width: 1024px) {
          .article-layout { display: block !important; }
          .content-col { margin-bottom: 40px; }
          .article-body-wrapper { 
            padding: 32px 20px !important; 
            border-radius: 20px !important; 
            margin-bottom: 100px !important; 
            font-size: 1.05rem !important;
          }
          .mobile-cta-section { 
            display: block !important; 
            margin-bottom: 120px !important; 
          }
        }
        .orb-2 { top: 60%; right: -10%; width: 400px; height: 400px; background: rgba(124, 58, 237, 0.08); animation-delay: -3s; }
      `}</style>
    </main>
  )
}
