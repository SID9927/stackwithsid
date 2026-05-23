'use client'

import { useEffect, useRef, useMemo } from 'react'
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
import { Sparkles, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import CommentSection from '@/components/articles/CommentSection'

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

function wrapCodeBlocks(html) {
  if (!html) return ''
  return html.replace(/<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi, (match, preAttrs, codeAttrs, codeContent) => {
    let lang = 'Plain Text'
    const classMatch = codeAttrs.match(/class="([^"]*)"/i)
    if (classMatch) {
      const classes = classMatch[1].split(' ')
      const lClass = classes.find(c => c.startsWith('language-'))
      if (lClass) {
        const lName = lClass.replace('language-', '')
        lang = langMap[lName.toLowerCase()] || lName.toUpperCase()
      }
    }

    return `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <div class="code-block-header-left">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="code-block-lang-label">${lang}</span>
          </div>
          <button type="button" class="code-block-copy-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span>Copy Code</span>
          </button>
        </div>
        <pre${preAttrs}><code${codeAttrs}>${codeContent}</code></pre>
      </div>
    `.trim()
  })
}

export default function InterviewDetailView({ q, stats }) {
  const explanationRef = useRef(null)

  const formattedHtml = useMemo(() => {
    if (!q || !q.answer) return ''

    const formatRichText = (text) => {
      if (!text) return ''
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/(\/\/\s.*)/g, '<span class="code-comment">$1</span>')
    }

    let html = ''
    if (q.answer.includes('<p>') || q.answer.includes('<pre>')) {
      html = formatRichText(q.answer)
    } else {
      html = q.answer
        .split('\n\n')
        .map(para => `<p>${formatRichText(para)}</p>`)
        .join('')
    }

    return wrapCodeBlocks(html)
  }, [q?.id, q?.answer])

  useEffect(() => {
    if (!q || !q.answer) return

    const container = explanationRef.current
    if (!container) return

    // 1. Highlight all code elements that are not yet highlighted
    const codes = container.querySelectorAll('pre code')
    codes.forEach((codeEl) => {
      if (!codeEl.classList.contains('hljs')) {
        try { hljs.highlightElement(codeEl) } catch (e) { /* ignore unknown lang */ }
      }
    })

    // 2. Setup event delegation for copy buttons
    const handleCopy = (e) => {
      const btn = e.target.closest('.code-block-copy-btn')
      if (!btn) return

      const wrapper = btn.closest('.code-block-wrapper')
      if (!wrapper) return

      const codeEl = wrapper.querySelector('pre code')
      const textToCopy = codeEl ? codeEl.textContent : ''

      navigator.clipboard.writeText(textToCopy).then(() => {
        const span = btn.querySelector('span')
        const svg = btn.querySelector('svg')
        const originalSvg = svg ? svg.outerHTML : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
        const originalText = span ? span.textContent : 'Copy Code'

        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-green"><polyline points="20 6 9 17 4 12"/></svg>
          <span class="text-green">Copied!</span>
        `
        setTimeout(() => {
          if (btn.isConnected) {
            btn.innerHTML = `
              ${originalSvg}
              <span>${originalText}</span>
            `
          }
        }, 2000)
      })
    }

    container.addEventListener('click', handleCopy)
    return () => {
      container.removeEventListener('click', handleCopy)
    }
  }, [q?.id, q?.answer])

  if (!q) return (
    <div className="empty-detail">
      <div className="empty-icon"><Info size={40} /></div>
      <h3>Select a question to start learning</h3>
      <p>Choose from the list on the left to view simplified explanations and hiring insights.</p>
    </div>
  )

  return (
    <div className="detail-wrapper">
      {/* Article Content Area */}
      <div className="article-body-wrapper">
        <header className="detail-header">
          <div className="meta-row">
            <span className={`badge-difficulty ${q.difficulty?.toLowerCase()}`}>
              {q.difficulty}
            </span>
            <span className="badge-stack">{q.stack}</span>
            <span className="company-tag">• {q.company || 'Common'}</span>
          </div>
          <h1>{q.question}</h1>
        </header>

        <div className="content-divider" />

        {/* Expert Explanation */}
        <div className="explanation-section">
          <div className="section-label">
            <Sparkles size={16} className="text-accent" /> Simplified Explanation
          </div>
          <div 
            className="explanation-text" 
            ref={explanationRef}
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />
        </div>

        {/* Hiring Insight (Blockquote Style) */}
        <blockquote className="hiring-insight">
          <strong>The Hiring Insight:</strong> 
          {q.hiring_insight ? (
            q.hiring_insight
          ) : (
            <>Interviewers are looking for how you handle conceptual stability. Mentioning how {q.stack} optimizes this {q.difficulty} level concept shows senior-level maturity.</>
          )}
        </blockquote>

        {/* Discussion Section */}
        <div id="discussion" style={{ marginTop: 64 }}>
          <CommentSection 
            targetId={q.id} 
            targetType="interview" 
            totalCount={stats?.comments || 0} 
          />
        </div>
      </div>

      <style jsx global>{`
        .detail-wrapper {
          min-height: 600px;
        }

        .article-body-wrapper {
          background: var(--bg-card); 
          border: 1px solid var(--border-subtle); 
          border-radius: 32px;
          padding: clamp(24px, 5%, 56px); 
          box-shadow: var(--shadow-card); 
          backdrop-filter: blur(10px);
          position: relative;
        }

        .detail-header .meta-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
        }
        .badge-difficulty {
          padding: 6px 14px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .badge-difficulty.beginner { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .badge-difficulty.intermediate { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); }
        .badge-difficulty.advanced { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .badge-stack {
          background: rgba(124, 58, 237, 0.1); color: var(--accent-soft); padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(124, 58, 237, 0.2);
        }
        .company-tag { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }

        .detail-header h1 {
          font-family: Syne, sans-serif; 
          font-size: clamp(1.8rem, 4vw, 2.8rem); 
          font-weight: 600; 
          color: var(--accent-soft); /* Vibrant Purple from reference */
          line-height: 1.1; 
          margin: 0;
          letter-spacing: -0.02em;
        }

        .content-divider {
          height: 1px; background: linear-gradient(90deg, var(--border-subtle), transparent); margin: 40px 0;
        }

        .section-label {
          display: flex; align-items: center; gap: 8px; color: var(--accent-soft); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;
        }

        .explanation-text { color: var(--text-secondary); line-height: 1.8; font-size: 1.15rem; }
        .explanation-text p { margin-bottom: 24px; }
        .explanation-text h2 { font-family: Syne, sans-serif; font-size: 2rem; font-weight: 700; margin: 36px 0 18px; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.15; }
        .explanation-text h3 { font-family: Syne, sans-serif; font-size: 1.4rem; font-weight: 700; margin: 28px 0 14px; color: var(--text-primary); }
        .explanation-text strong { color: var(--text-primary); font-weight: 700; }
        .explanation-text em { font-style: italic; }
        .explanation-text ul, .explanation-text ol { padding-left: 28px; margin-bottom: 20px; }
        .explanation-text li { margin-bottom: 6px; line-height: 1.6; }
        .explanation-text ul li { list-style-type: disc; }
        .explanation-text ol li { list-style-type: decimal; }
        .explanation-text blockquote {
          border-left: 4px solid var(--accent); padding: 16px 32px;
          margin: 40px 0; font-style: italic; color: var(--text-muted);
          font-size: 1.2rem; line-height: 1.6;
          background: rgba(124, 58, 237, 0.04); border-radius: 0 12px 12px 0;
        }

        /* Tables */
        .explanation-text table {
          border-collapse: collapse; width: 100%; margin: 32px 0;
          border-radius: 12px; overflow-x: auto !important; display: block !important;
          border: 1px solid var(--border-subtle); -webkit-overflow-scrolling: touch;
        }
        .explanation-text th {
          background: rgba(124, 58, 237, 0.15); color: var(--accent-soft);
          font-weight: 700; font-size: 0.85rem; text-transform: uppercase;
          letter-spacing: 0.05em; padding: 12px 16px; border: 1px solid var(--border-subtle); text-align: left;
          white-space: nowrap;
        }
        .explanation-text td {
          padding: 12px 16px; border: 1px solid var(--border-subtle);
          color: var(--text-secondary); vertical-align: top; transition: background 0.2s;
          min-width: 120px;
        }
        .explanation-text tr:hover td { background: rgba(124, 58, 237, 0.04); }
        
        .tableWrapper {
          width: 100%;
          overflow-x: auto !important;
          margin: 32px 0;
          -webkit-overflow-scrolling: touch;
          display: block !important;
        }

        .tableWrapper::-webkit-scrollbar,
        .explanation-text table::-webkit-scrollbar {
          height: 6px;
        }
        .tableWrapper::-webkit-scrollbar-thumb,
        .explanation-text table::-webkit-scrollbar-thumb {
          background: var(--accent-soft);
          border-radius: 10px;
        }

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
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.95rem;
          line-height: 1.7;
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
          font-size: inherit !important;
          line-height: inherit !important;
          font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
        }

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

        .explanation-text code {
          font-family: var(--font-mono);
          background: var(--bg-elevated);
          color: var(--accent-soft);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.88em;
        }

        .explanation-text .code-comment {
          color: #4ade80;
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .explanation-text table {
            display: block !important;
            width: 100% !important;
            overflow-x: auto !important;
          }
        }

        /* Callout Cards */
        .explanation-text .callout {
          margin: 40px 0; padding: 24px 28px; border-radius: 16px;
          border: 1px solid var(--border-subtle); background: rgba(255, 255, 255, 0.02);
        }
        .explanation-text .callout-success { border-color: rgba(0, 255, 170, 0.25); background: rgba(0, 255, 170, 0.04); }
        .explanation-text .callout-success strong { color: #00ffaa !important; }
        .explanation-text .callout-info { border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.05); }
        .explanation-text .callout-info strong { color: #60a5fa !important; }
        .explanation-text .callout-tip { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
        .explanation-text .callout-tip strong { color: #fbbf24 !important; }
        .explanation-text .callout-warning { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
        .explanation-text .callout-warning strong { color: #f87171 !important; }
        .explanation-text .callout p { margin-bottom: 8px; }
        .explanation-text .callout p:last-child { margin-bottom: 0; }

        /* ── Article Images ───────────────────────────── */
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
        .explanation-text p + .article-image,
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

        .hiring-insight {
          background: rgba(124, 58, 237, 0.03); border-left: 4px solid var(--accent); padding: 24px 32px; border-radius: 0 16px 16px 0; margin: 48px 0; color: var(--text-secondary); font-style: italic; line-height: 1.6;
        }
        .hiring-insight strong { color: var(--accent-soft); font-style: normal; display: block; margin-bottom: 8px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }

        .detail-footer {
          margin-top: 56px; padding-top: 40px; border-top: 1px solid var(--border-subtle); 
          display: flex; justify-content: space-between; align-items: center;
        }

        .actions-left, .actions-right { display: flex; gap: 12px; align-items: center; }
        
        .action-btn {
          height: 44px; background: none; border: 1px solid var(--border-subtle); border-radius: 12px;
          padding: 0 20px; color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center; gap: 10px; font-weight: 600; transition: all 0.2s;
        }
        .action-btn:hover { border-color: var(--accent-soft); color: var(--text-primary); background: rgba(255,255,255,0.02); }
        .action-btn.active { background: rgba(124, 58, 237, 0.08); color: var(--accent); border-color: var(--accent); }

        .icon-btn {
          width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border-subtle);
          background: none; color: var(--text-muted);
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
        }
        .icon-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(124, 58, 237, 0.05); transform: translateY(-2px); }
        .icon-btn.active-bookmark { color: var(--accent); border-color: var(--accent); background: rgba(124, 58, 237, 0.08); }

        .empty-detail {
          height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px;
          background: rgba(255,255,255,0.01); border: 2px dashed var(--border-subtle); border-radius: 32px; color: var(--text-muted);
        }
        .empty-icon { width: 80px; height: 80px; background: rgba(255,255,255,0.03); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .empty-detail h3 { color: var(--text-primary); font-family: Syne, sans-serif; margin-bottom: 12px; }
        .empty-detail p { max-width: 320px; line-height: 1.6; }

        @media (max-width: 1024px) {
          .article-body-wrapper { 
            padding: 24px 16px !important; 
            border-radius: 24px !important; 
            border: none !important;
            background: none !important;
            box-shadow: none !important;
          }
          .detail-header h1 { font-size: 1.6rem !important; line-height: 1.2 !important; }
          .explanation-text { font-size: 1.05rem !important; }
          .hiring-insight { padding: 20px !important; margin: 32px 0 !important; }
          .detail-footer { flex-direction: column; gap: 24px; align-items: flex-start !important; }
          .actions-right { width: 100%; justify-content: flex-start; }
          .content-divider { margin: 24px 0 !important; }
        }
      `}</style>
    </div>
  )
}
