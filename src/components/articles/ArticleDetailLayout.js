'use client'

import { motion } from 'framer-motion'
import ArticleSidebar from './ArticleSidebar'
import ArticleMobileBar from './ArticleMobileBar'
import ArticleHeader from './ArticleHeader'
import SidebarDiscussion from './sidebar/SidebarDiscussion'

export default function ArticleDetailLayout({ 
  children, 
  title, 
  tags, 
  publishDate, 
  readTime,
  stats = { likes: 42, dislikes: 2, comments: 12 }
}) {
  return (
    <main className="article-detail-page">
      {/* Background Decorations */}
      <div className="bg-decorations">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="main-container">
        <ArticleHeader title={title} tags={tags} publishDate={publishDate} readTime={readTime} />

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

            {/* Mobile-only Discussion CTA (Hidden on Desktop) */}
            <div className="mt-10 lg:hidden px-[4%] mb-[120px]">
              <SidebarDiscussion />
            </div>
          </div>

          {/* Sidebar Column (Hidden on Mobile) */}
          <div className="hidden lg:block sticky top-[100px] h-fit">
            <ArticleSidebar readTime={readTime} likes={stats.likes} dislikes={stats.dislikes} commentsCount={stats.comments} />
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-100">
        <ArticleMobileBar likes={stats.likes} commentsCount={stats.comments} />
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
          max-width: 1300px; margin: 0 auto; padding: 0 4%; position: relative; z-index: 1;
        }

        .article-grid {
          display: grid; grid-template-columns: 1fr 320px; gap: 60px; align-items: start;
        }

        .article-body-wrapper {
          background: var(--bg-card); 
          border: 1px solid var(--border-subtle); 
          border-radius: 32px;
          padding: clamp(24px, 5%, 56px); 
          box-shadow: var(--shadow-card); 
          color: var(--text-secondary);
          line-height: 1.8; 
          font-size: 1.15rem; 
          backdrop-filter: blur(10px);
        }

        .article-content-render {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.15rem;
        }
        .article-content-render h2 { 
          font-family: Syne, sans-serif; 
          font-size: 2rem; 
          margin: 56px 0 24px; 
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .article-content-render h3 { font-family: Syne, sans-serif; font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 36px 0 16px; }
        .article-content-render p { margin-bottom: 28px; }
        .article-content-render strong { color: var(--text-primary); }
        .article-content-render em { font-style: italic; }
        .article-content-render a { color: var(--accent); text-decoration: underline; }
        .article-content-render blockquote {
          border-left: 4px solid var(--accent); padding: 16px 32px;
          margin: 48px 0; font-style: italic; color: var(--text-muted);
          font-size: 1.2rem; line-height: 1.6;
          background: rgba(124, 58, 237, 0.04); border-radius: 0 12px 12px 0;
        }
        .article-content-render code { font-family: var(--font-mono); background: var(--bg-elevated); padding: 3px 8px; border-radius: 6px; font-size: 0.88em; color: var(--accent-soft); }
        .article-content-render pre { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 28px 32px; overflow-x: auto; margin: 32px 0; }
        .article-content-render pre code { background: none; color: var(--text-primary); padding: 0; font-size: inherit; line-height: 1.7; }
        .article-content-render ul, .article-content-render ol { padding-left: 28px; margin-bottom: 24px; }
        .article-content-render li { margin-bottom: 8px; line-height: 1.7; }
        .article-content-render ul li { list-style-type: disc; }
        .article-content-render ol li { list-style-type: decimal; }
        .article-content-render hr { border: none; border-top: 1px solid var(--border-subtle); margin: 48px 0; }

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
          .article-grid { display: block !important; }
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
      `}</style>
    </main>
  )
}
