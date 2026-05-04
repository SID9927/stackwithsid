'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { X, Copy, Check } from 'lucide-react'
import { FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa'
import ArticleSidebar from './ArticleSidebar'
import ArticleMobileBar from './ArticleMobileBar'
import ArticleHeader from './ArticleHeader'
import SidebarDiscussion from './sidebar/SidebarDiscussion'
import CommentSection from './CommentSection'

export default function ArticleDetailLayout({ 
  id,
  children, 
  title, 
  tags, 
  publishDate, 
  readTime
}) {
  const [stats, setStats] = useState({ likes: 0, comments: 0, isLiked: false, recentComments: [] })
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

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

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Check out this article: ${title}`,
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

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const socialLinks = [
    { name: 'WhatsApp', icon: <FaWhatsapp size={20} />, color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + currentUrl)}` },
    { name: 'X', icon: <FaTwitter size={20} />, color: '#000000', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}` },
    { name: 'LinkedIn', icon: <FaLinkedin size={20} />, color: '#0077b5', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}` }
  ]

  return (
    <main className="article-detail-page">
      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="share-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="share-modal"
            >
              <div className="modal-header">
                <h3>Share Article</h3>
                <button onClick={() => setShareModalOpen(false)}><X size={20} /></button>
              </div>
              
              <div className="social-grid">
                {socialLinks.map(link => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="social-item">
                    <div className="icon-wrapper" style={{ background: link.color }}>{link.icon}</div>
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>

              <div className="copy-section">
                <p>Article Link</p>
                <div className="copy-box">
                  <input type="text" readOnly value={currentUrl} />
                  <button onClick={copyToClipboard} className={copied ? 'copied' : ''}>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
              onShare={handleShare}
              commentsCount={stats.comments} 
              recentComments={stats.recentComments}
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-100">
        <ArticleMobileBar 
          likes={stats.likes} 
          isLiked={stats.isLiked}
          onLikeToggle={handleLikeToggle}
          onShare={handleShare}
          commentsCount={stats.comments} 
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

        /* Tables */
        .article-content-render table {
          border-collapse: collapse;
          width: auto;
          min-width: min(100%, 600px);
          margin: 32px 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
        }
        .article-content-render th {
          background: rgba(124, 58, 237, 0.15);
          color: var(--accent-soft);
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 16px;
          border: 1px solid var(--border-subtle);
          text-align: left;
          white-space: nowrap;
        }
        .article-content-render td {
          padding: 12px 16px;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          vertical-align: top;
          transition: background 0.2s;
          min-width: 120px;
        }
        .article-content-render tr:hover td {
          background: rgba(124, 58, 237, 0.04);
        }

        /* Support for Tiptap's tableWrapper */
        .tableWrapper {
          width: 100%;
          overflow-x: auto !important;
          margin: 32px 0;
          -webkit-overflow-scrolling: touch;
          display: block !important;
        }

        .tableWrapper::-webkit-scrollbar, 
        .article-content-render table::-webkit-scrollbar {
          height: 6px;
        }
        .tableWrapper::-webkit-scrollbar-thumb,
        .article-content-render table::-webkit-scrollbar-thumb {
          background: var(--accent-soft);
          border-radius: 10px;
        }

        @media (max-width: 1024px) {
          .article-content-render table {
            display: block !important;
            width: 100% !important;
            overflow-x: auto !important;
          }
        }

        /* Callout Cards */
        .article-content-render .callout {
          margin: 40px 0;
          padding: 24px 28px;
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
          background: rgba(255, 255, 255, 0.02);
        }
        .article-content-render .callout-success {
          border-color: rgba(0, 255, 170, 0.25);
          background: rgba(0, 255, 170, 0.04);
        }
        .article-content-render .callout-success strong { color: #00ffaa; }
        .article-content-render .callout-info {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(59, 130, 246, 0.05);
        }
        .article-content-render .callout-info strong { color: #60a5fa; }
        .article-content-render .callout-tip {
          border-color: rgba(245, 158, 11, 0.3);
          background: rgba(245, 158, 11, 0.05);
        }
        .article-content-render .callout-tip strong { color: #fbbf24; }
        .article-content-render .callout-warning {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }
        .article-content-render .callout-warning strong { color: #f87171; }
        .article-content-render .callout p { margin-bottom: 8px; }
        .article-content-render .callout p:last-child { margin-bottom: 0; }

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

        /* Share Modal Styles */
        .share-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); 
          backdrop-filter: blur(8px); z-index: 1000; 
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .share-modal {
          background: var(--bg-card); border: 1px solid var(--border-subtle); 
          border-radius: 32px; width: 100%; max-width: 400px; padding: 32px;
          box-shadow: 0 20px 80px rgba(0,0,0,0.3);
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .modal-header h3 { font-family: Syne, sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin: 0; }
        .modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: color 0.2s; }
        .modal-header button:hover { color: var(--text-primary); }
        
        .social-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
        .social-item { display: flex; flex-direction: column; align-items: center; gap: 10px; text-decoration: none; }
        .icon-wrapper { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: white; transition: transform 0.2s; }
        .social-item:hover .icon-wrapper { transform: translateY(-5px); }
        .social-item span { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
        
        .copy-section p { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .copy-box { display: flex; gap: 10px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 6px 6px 6px 16px; align-items: center; }
        .copy-box input { flex: 1; background: none; border: none; color: var(--text-secondary); font-size: 0.9rem; outline: none; }
        .copy-box button { width: 40px; height: 40px; border-radius: 10px; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--accent); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .copy-box button.copied { background: #00ffaa; border-color: #00ffaa; color: #000; }
        .copy-box button:hover:not(.copied) { border-color: var(--accent); background: var(--border-subtle); }
      `}</style>
    </main>
  )
}
