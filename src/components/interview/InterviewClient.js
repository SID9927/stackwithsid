'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ArrowLeft, 
  Cpu, 
  Building2, 
  Search as SearchIcon,
  Sparkles,
  BookOpen,
  Target,
  Trophy,
  ChevronRight,
  Filter
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import InterviewQuestionCard from './InterviewQuestionCard'
import InterviewDetailView from './InterviewDetailView'

import { supabase } from '@/lib/supabase'
import { X, Copy, Check, ThumbsUp, MessageSquare, Bookmark, Share2 } from 'lucide-react'
import UnifiedMobileBar from '@/components/common/UnifiedMobileBar'

export default function InterviewClient({ initialQuestions }) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const qId = searchParams.get('q')

  const [view, setView] = useState('hub')
  const [activeFilter, setActiveFilter] = useState({ type: null, value: null })
  const [subTab, setSubTab] = useState('path') // 'path', 'frequent', 'random'
  const [selectedId, setSelectedId] = useState(qId || null)
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobileListOpen, setIsMobileListOpen] = useState(false)
  const itemsPerPage = 8

  // Interaction State
  const [stats, setStats] = useState({ likes: 0, comments: 0, isLiked: false, isBookmarked: false })
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  // Sync with URL if it changes
  useEffect(() => {
    if (qId) {
      // Find question by slug or ID
      const question = questions.find(q => q.slug === qId || q.id === qId)
      if (question) {
        setSelectedId(question.id)
        setView('list')
        // Automatically filter by the tech stack of this question
        if (question.stack) {
          setActiveFilter({ type: 'tech', value: question.stack })
        }
      }
    } else if (!selectedId && questions.length > 0) {
      // Default to first if none in URL
      setSelectedId(questions[0].id)
    }
  }, [qId, questions])

  // Update currentUrl for sharing whenever selectedId changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin + '/interview')
      if (selectedId) {
        const question = questions.find(q => q.id === selectedId)
        url.searchParams.set('q', question?.slug || selectedId)
      }
      setCurrentUrl(url.toString())
    }
  }, [selectedId, questions])

  // Fetch stats for the selected question
  useEffect(() => {
    if (!selectedId) return

    async function fetchStats() {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      // Fetch like count
      const { count: likes } = await supabase
        .from('interview_likes')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', selectedId)

      // Check if user liked
      let isLiked = false
      if (userId) {
        const { data: userLike } = await supabase
          .from('interview_likes')
          .select('id')
          .eq('question_id', selectedId)
          .eq('user_id', userId)
          .maybeSingle()
        isLiked = !!userLike
      }

      // Check if user bookmarked
      let isBookmarked = false
      if (userId) {
        const { data: userBookmark } = await supabase
          .from('interview_bookmarks')
          .select('id')
          .eq('question_id', selectedId)
          .eq('user_id', userId)
          .maybeSingle()
        isBookmarked = !!userBookmark
      }

      // Fetch comment count
      const { count: commentsCount } = await supabase
        .from('interview_comments')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', selectedId)

      setStats({ 
        likes: likes || 0, 
        comments: commentsCount || 0,
        isLiked,
        isBookmarked
      })
    }

    fetchStats()
  }, [selectedId])

  const handleLikeToggle = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      alert('Please sign in to like questions.')
      return
    }

    const userId = session.user.id
    const wasLiked = stats.isLiked

    setStats(prev => ({ 
      ...prev, 
      likes: wasLiked ? prev.likes - 1 : prev.likes + 1, 
      isLiked: !wasLiked 
    }))

    if (wasLiked) {
      await supabase.from('interview_likes').delete().eq('question_id', selectedId).eq('user_id', userId)
    } else {
      await supabase.from('interview_likes').insert({ question_id: selectedId, user_id: userId })
    }
  }

  const handleBookmarkToggle = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      alert('Please sign in to save questions.')
      return
    }

    const userId = session.user.id
    const wasBookmarked = stats.isBookmarked

    setStats(prev => ({ ...prev, isBookmarked: !wasBookmarked }))

    if (wasBookmarked) {
      await supabase.from('interview_bookmarks').delete().eq('question_id', selectedId).eq('user_id', userId)
    } else {
      await supabase.from('interview_bookmarks').insert({ question_id: selectedId, user_id: userId })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: selectedQuestion?.question,
      text: `Check out this interview question: ${selectedQuestion?.question}`,
      url: currentUrl,
    }

    if (navigator.share) {
      try { await navigator.share(shareData) } catch (err) { console.error('Error sharing:', err) }
    } else {
      setShareModalOpen(true)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }


  // Real-time data sync
  useEffect(() => {
    const channel = supabase
      .channel('public-interview-questions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interview_questions' }, async (payload) => {
        // Refresh all data to ensure sorting and filtering stay correct
        const { data } = await supabase
          .from('interview_questions')
          .select('id, slug, question, answer, stack, difficulty, created_at, company, is_frequent')
          .order('created_at', { ascending: false })
        
        if (data) {
          // Merge with mocks if needed, but usually we prefer DB data
          setQuestions(data)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filtered = useMemo(() => {
    let list = questions.filter(q => {
      const matchesFilter = !activeFilter.value || 
                          (activeFilter.type === 'tech' ? q.stack === activeFilter.value : q.company === activeFilter.value)
      const matchesQuery = !query || q.question?.toLowerCase().includes(query.toLowerCase())
      return matchesFilter && matchesQuery
    })

    if (subTab === 'path') {
      const diffMap = { Beginner: 1, Intermediate: 2, Advanced: 3 }
      list.sort((a, b) => (diffMap[a.difficulty] || 2) - (diffMap[b.difficulty] || 2))
    } else if (subTab === 'random') {
      list = [...list].sort(() => Math.random() - 0.5)
    } else if (subTab === 'frequent') {
      list = list.filter(q => q.is_frequent) 
    }

    return list
  }, [questions, activeFilter, query, subTab])

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const selectedQuestion = useMemo(() => {
    return filtered.find(q => q.id === selectedId) || filtered[0]
  }, [filtered, selectedId])

  const socialLinks = useMemo(() => [
    { name: 'WhatsApp', icon: <FaWhatsapp size={20} />, color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent((selectedQuestion?.question || '') + ' ' + currentUrl)}` },
    { name: 'X', icon: <FaTwitter size={20} />, color: '#000000', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedQuestion?.question || '')}&url=${encodeURIComponent(currentUrl)}` },
    { name: 'LinkedIn', icon: <FaLinkedin size={20} />, color: '#0077b5', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}` }
  ], [selectedQuestion, currentUrl])

  useEffect(() => {
    if (filtered.length > 0) {
      setSelectedId(filtered[0].id)
      setCurrentPage(1)
    }
  }, [activeFilter, subTab])

  const handleSelectFilter = (type, value) => {
    setActiveFilter({ type, value })
    setView('list')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const techCategories = useMemo(() => {
    const stacks = [...new Set(questions.map(q => q.stack).filter(Boolean))]
    return stacks.map(stack => ({
      name: stack,
      icon: <Cpu />,
      count: questions.filter(q => q.stack === stack).length,
      desc: `Deep dive into ${stack} interview patterns.`
    }))
  }, [questions])

  const companies = useMemo(() => {
    return [...new Set(questions.map(q => q.company).filter(Boolean))]
  }, [questions])

  return (
    <div className="interview-page-wrapper">
      <div className="bg-decorations">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="main-container">
        <AnimatePresence mode="wait">
          {view === 'hub' ? (
            <motion.div 
              key="hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hub-view"
            >
              <div className="hub-section">
                <h2 className="hub-title"><BookOpen size={24} className="text-accent" /> Mastery Tracks</h2>
                <div className="tech-grid">
                  {techCategories.map(tech => (
                    <div key={tech.name} className="tech-card" onClick={() => handleSelectFilter('tech', tech.name)}>
                      <div className="tech-icon">{tech.icon}</div>
                      <div className="tech-info">
                        <h3>{tech.name}</h3>
                        <p>{tech.desc}</p>
                      </div>
                      <ChevronRight className="ml-auto opacity-30" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="hub-section">
                <h2 className="hub-title"><Target size={24} className="text-accent" /> Dream Companies</h2>
                <div className="company-grid">
                  {companies.length > 0 ? (
                    companies.map(company => (
                      <div key={company} className="company-card" onClick={() => handleSelectFilter('company', company)}>
                        {company}
                      </div>
                    ))
                  ) : (
                    <div className="coming-soon-placeholder glass-card">
                      <Sparkles size={18} className="text-accent" />
                      <span>Company-specific tracks coming soon...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="list-view"
            >
              <div className="list-top-nav">
                <button onClick={() => setView('hub')} className="back-btn">
                  <ArrowLeft size={18} /> Back to Hub
                </button>
                <div className="active-breadcrumb">
                  {activeFilter.type === 'tech' ? <Cpu size={16} /> : <Building2 size={16} />}
                  <span>{activeFilter.value} Mastery</span>
                </div>
              </div>

              <div className="split-layout">
                <button 
                  className="mobile-list-trigger lg:hidden"
                  onClick={() => setIsMobileListOpen(true)}
                >
                  <SearchIcon size={18} /> Browse Questions
                </button>

                <div className={`master-pane ${isMobileListOpen ? 'mobile-open' : ''}`}>
                  <div className="pane-header">
                    <div className="mobile-pane-top lg:hidden">
                      <h3>Questions</h3>
                      <button onClick={() => setIsMobileListOpen(false)}>Close</button>
                    </div>
                    <div className="search-box">
                      <Search size={16} />
                      <input 
                        placeholder="Search questions..." 
                        value={query}
                        onChange={e => {
                          setQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <div className="sub-tab-switcher">
                      <button className={subTab === 'path' ? 'active' : ''} onClick={() => setSubTab('path')}>Path</button>
                      <button className={subTab === 'frequent' ? 'active' : ''} onClick={() => setSubTab('frequent')}>Frequent</button>
                      <button className={subTab === 'random' ? 'active' : ''} onClick={() => setSubTab('random')}>Random</button>
                    </div>
                  </div>
                  <div className="question-list scrollbar-hide">
                    {paginatedList.map((q, i) => (
                      <InterviewQuestionCard 
                        key={q.id || i} 
                        q={q} 
                        index={i} 
                        isActive={selectedId === q.id}
                        onClick={() => {
                          setSelectedId(q.id);
                          router.push(`/interview?q=${q.slug || q.id}`, { scroll: false });
                          setIsMobileListOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    ))}
                    {filtered.length === 0 && (
                      <div className="no-questions">No questions found</div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="pane-footer">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-btn"
                      >
                        Prev
                      </button>
                      <span className="p-info">{currentPage} / {totalPages}</span>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                <div className="detail-pane">
                  <InterviewDetailView 
                    q={selectedQuestion} 
                    stats={stats}
                  />
                </div>

                <aside className="detail-sidebar hidden xl:block">
                  <div className="sidebar-sticky-wrapper">
                    <div className="sidebar-card">
                      <h4>💡 Quick Tip</h4>
                      <p>Focus on understanding the <strong>why</strong> behind the answer. Companies value clear communication as much as technical skills.</p>
                    </div>
                    <div className="sidebar-card highlight">
                      <div className="mastery-header">
                        <Sparkles size={18} className="text-accent" />
                        <h4>Mastery Check</h4>
                      </div>
                      
                      <div className="interaction-stack">
                        <button 
                          className={`sidebar-action-btn ${stats.isLiked ? 'active' : ''}`}
                          onClick={handleLikeToggle}
                        >
                          <div className="btn-icon"><ThumbsUp size={18} fill={stats.isLiked ? "currentColor" : "none"} /></div>
                          <div className="btn-text">
                            <span>{stats.isLiked ? 'Helpful!' : 'Helpful?'}</span>
                            <small>{stats.likes} developers found this useful</small>
                          </div>
                        </button>

                        <button 
                          className="sidebar-action-btn"
                          onClick={() => {
                            const el = document.getElementById('discussion')
                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          <div className="btn-icon"><MessageSquare size={18} /></div>
                          <div className="btn-text">
                            <span>Discuss</span>
                            <small>{stats.comments} community insights</small>
                          </div>
                        </button>

                        <div className="sidebar-dual-actions">
                          <button 
                            className={`mini-action-btn ${stats.isBookmarked ? 'active' : ''}`}
                            onClick={handleBookmarkToggle}
                          >
                            <Bookmark size={20} fill={stats.isBookmarked ? "currentColor" : "none"} />
                            <span>{stats.isBookmarked ? 'Saved' : 'Save'}</span>
                          </button>
                          <button className="mini-action-btn" onClick={handleShare}>
                            <Share2 size={20} />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

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
                        <h3>Share Question</h3>
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
                        <p>Question Link</p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1001]">
        {view === 'list' && selectedId && (
          <UnifiedMobileBar 
            likes={stats.likes} 
            isLiked={stats.isLiked}
            onLikeToggle={handleLikeToggle}
            onShare={handleShare}
            commentsCount={stats.comments} 
            onCommentClick={() => {
              const el = document.getElementById('discussion')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            isBookmarked={stats.isBookmarked}
            onBookmarkToggle={handleBookmarkToggle}
          />
        )}
      </div>

      <style jsx global>{`
        .interview-page-wrapper {
          min-height: 100vh; background: var(--bg-primary); padding-top: 40px; padding-bottom: 80px; position: relative; overflow-x: clip;
        }
        .bg-decorations { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .orb { position: absolute; filter: blur(120px); opacity: 0.1; }
        .orb-1 { top: 5%; right: -5%; width: 500px; height: 500px; background: var(--accent-soft); }
        .orb-2 { bottom: 15%; left: -5%; width: 600px; height: 600px; background: var(--accent); opacity: 0.08; }

        .main-container { max-width: 1400px; margin: 0 auto; padding: 0 4%; position: relative; z-index: 1; }

        .hub-section { margin-top: 64px; }
        .hub-title { font-family: Syne, sans-serif; font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }

        .tech-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .tech-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 24px;
          display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.3s ease; text-align: left;
        }
        .tech-card:hover { transform: translateY(-5px); border-color: var(--accent-soft); background: var(--bg-elevated); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .tech-icon { width: 52px; height: 52px; border-radius: 12px; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; }
        .tech-info h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .tech-info p { font-size: 0.85rem; color: var(--text-muted); margin: 4px 0 0; }

        .company-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        .company-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 16px; height: 64px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease;
          font-weight: 700; color: var(--text-secondary); fontSize: 0.95rem;
        }
        .company-card:hover { border-color: var(--accent); color: var(--text-primary); background: var(--bg-elevated); }

        .list-top-nav { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .back-btn {
          background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 8px 16px;
          color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem;
        }
        .active-breadcrumb { display: flex; align-items: center; gap: 8px; color: var(--accent-soft); font-weight: 700; font-size: 1rem; margin-left: 8px; }

        .split-layout { 
          display: grid; 
          grid-template-columns: 320px 1fr 280px; 
          gap: 24px; 
          align-items: start;
        }
        
        .master-pane { 
          position: sticky;
          top: 100px;
          height: calc(100vh - 140px);
          display: flex; flex-direction: column; background: var(--bg-card); border: 1px solid var(--border-subtle); 
          border-radius: 24px; overflow: hidden;
        }

        .mobile-list-trigger {
          position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
          z-index: 50; background: var(--accent); color: white; border: none;
          padding: 14px 28px; border-radius: 30px; font-weight: 800; font-size: 0.95rem;
          display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.4);
          cursor: pointer; transition: all 0.3s;
          white-space: nowrap;
        }
        @media (min-width: 1025px) {
          .mobile-list-trigger { display: none !important; }
        }

        .detail-pane { min-height: 500px; }

        .detail-sidebar {
          position: sticky;
          top: 100px;
        }

        .sidebar-card { 
          background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 24px; margin-bottom: 24px;
        }
        .sidebar-card.highlight { border-color: var(--accent-soft); background: rgba(124, 58, 237, 0.05); }
        .sidebar-card h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-soft); margin-bottom: 12px; }
        .sidebar-card p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
        .related-list { list-style: none; padding: 0; margin: 0; display: flex; flexDirection: column; gap: 10px; }
        .related-list li { font-size: 0.9rem; color: var(--text-primary); font-weight: 600; cursor: pointer; }
        .related-list li:hover { color: var(--accent); }

        .pane-header { padding: 20px; border-bottom: 1px solid var(--border-subtle); background: rgba(255,255,255,0.02); }
        .mobile-pane-top { display: none; }
        @media (max-width: 1024px) {
          .mobile-pane-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
          .mobile-pane-top h3 { font-family: Syne, sans-serif; font-size: 1.2rem; font-weight: 800; margin: 0; }
          .mobile-pane-top button { background: none; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 4px 12px; color: var(--text-muted); font-size: 0.8rem; font-weight: 600; }
        }

        .search-box { position: relative; }
        .search-box input {
          width: 100%; padding: 10px 14px 10px 38px; border-radius: 12px; background: var(--bg-primary);
          border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.85rem; outline: none;
        }
        .search-box :global(svg) { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        .sub-tab-switcher {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; 
          background: var(--bg-primary); padding: 4px; border-radius: 12px; margin-top: 16px;
        }
        .sub-tab-switcher button {
          background: none; border: none; padding: 8px; border-radius: 8px; 
          font-size: 0.75rem; font-weight: 700; color: var(--text-muted); cursor: pointer;
          transition: all 0.2s ease;
        }
        .sub-tab-switcher button.active {
          background: var(--bg-card); color: var(--accent-soft); 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .sub-tab-switcher button:hover:not(.active) { color: var(--text-primary); }

        .question-list { flex: 1; overflow-y: auto; padding: 12px; }
        
        .pane-footer {
          padding: 16px; border-top: 1px solid var(--border-subtle); background: rgba(0,0,0,0.1);
          display: flex; align-items: center; justify-content: space-between;
        }
        .p-btn {
          height: 40px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 8px;
          padding: 0 16px; font-size: 0.75rem; font-weight: 700; color: var(--text-primary);
          cursor: pointer; transition: all 0.2s;
        }
        .p-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
        .p-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .p-info { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }

        .no-questions { padding: 40px; text-align: center; color: var(--text-muted); font-size: 0.9rem; }

        /* Custom Scrollbar */
        .question-list::-webkit-scrollbar { width: 5px; }
        .question-list::-webkit-scrollbar-track { background: transparent; }
        .question-list::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 10px; }

        @media (max-width: 1200px) {
          .split-layout { grid-template-columns: 300px 1fr; }
          .detail-sidebar { display: none; }
        }

        @media (max-width: 1024px) {
          .split-layout { grid-template-columns: 1fr; gap: 0; }
          .master-pane { 
            position: fixed; inset: 0; z-index: 100; background: var(--bg-primary);
            height: 100vh; width: 100vw; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 0;
            padding-top: 80px; /* Safe area for site header */
          }
          .master-pane.mobile-open { transform: translateY(0); }
          .detail-pane { padding-bottom: 120px; }
        }

        /* Sidebar Action Buttons */
        .mastery-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .mastery-header h4 { margin: 0 !important; color: var(--text-primary) !important; font-size: 1rem !important; }

        .interaction-stack { display: flex; flex-direction: column; gap: 12px; }
        
        .sidebar-action-btn {
          width: 100%; display: flex; align-items: center; gap: 16px; padding: 14px;
          background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px;
          cursor: pointer; transition: all 0.2s; text-align: left;
        }
        .sidebar-action-btn:hover { border-color: var(--accent); background: var(--bg-elevated); transform: translateX(4px); }
        .sidebar-action-btn.active { border-color: var(--accent); background: rgba(124, 58, 237, 0.08); }
        .sidebar-action-btn.active .btn-icon { color: var(--accent); }
        
        .btn-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-shrink: 0; }
        .btn-text { display: flex; flex-direction: column; }
        .btn-text span { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
        .btn-text small { font-size: 0.7rem; color: var(--text-muted); }

        .sidebar-dual-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
        .mini-action-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px; height: 48px;
          background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 14px;
          color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .mini-action-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--bg-elevated); }
        .mini-action-btn.active { color: var(--accent); border-color: var(--accent); background: rgba(124, 58, 237, 0.08); }

        /* Share Modal Styles (Moved from DetailView) */
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

        .coming-soon-placeholder {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 32px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed var(--border-subtle);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 1rem;
        }
      `}</style>
    </div>
  )
}
