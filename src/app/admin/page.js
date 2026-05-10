'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Database,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  Circle,
  Settings,
  Eye,
  Pencil,
  RefreshCw,
  Zap,
  BookOpen,
  Layers
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

// Animated counter
function AnimatedCount({ value, loading }) {
  const [display, setDisplay] = useState(0)
  
  useEffect(() => {
    if (loading || value === 0) { setDisplay(value); return }
    let start = 0
    const duration = 800
    const step = Math.ceil(value / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 16)
    return () => clearInterval(timer)
  }, [value, loading])

  return <span>{loading ? '—' : display}</span>
}

const difficultyColor = (d) => {
  if (!d) return '#6b7280'
  const lvl = d.toLowerCase()
  if (lvl === 'easy') return '#10b981'
  if (lvl === 'medium') return '#f59e0b'
  if (lvl === 'hard') return '#ef4444'
  return '#6b7280'
}

const S = {
  page: { width: '100%', paddingTop: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' },
  h1: { fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px', color: 'var(--text-primary)' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500 },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px', alignItems: 'stretch' },
  
  statCard: { display: 'flex', alignItems: 'center', gap: '18px', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', textDecoration: 'none', color: 'var(--text-primary)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', overflow: 'hidden', height: '100%', minHeight: '120px' },
  statBody: { flex: 1 },
  statLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' },

  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '24px' },

  panel: { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '28px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '10px' },
  panelTitleText: { fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 },
  panelLink: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'none' },

  panelList: { display: 'flex', flexDirection: 'column', gap: '2px' },
  listRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'transparent' },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTitle: { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowMeta: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '0.73rem', color: 'var(--text-muted)' },
  rowActions: { display: 'flex', gap: '4px', flexShrink: 0 },
  rowBtn: { width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'none' },

  actionsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  actionCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '16px', textDecoration: 'none', transition: 'all 0.3s' },
  actionInfo: { flex: 1 },
  actionLabel: { display: 'block', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' },
  actionDesc: { display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' },

  healthRows: { display: 'flex', flexDirection: 'column', gap: '20px' },
  healthRow: { display: 'grid', gridTemplateColumns: '140px 1fr 40px', alignItems: 'center', gap: '14px' },
  healthLabel: { fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 },
  healthBarWrap: { height: '8px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' },
  healthVal: { fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'right' },

  skeleton: { height: '52px', borderRadius: '12px', marginBottom: '4px', background: 'var(--bg-elevated)', animation: 'pulse 1.5s ease-in-out infinite' },
  emptyPanel: { padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' },

  statusLive: { padding: '2px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(16,185,129,0.1)', color: '#10b981' },
  statusDraft: { padding: '2px 7px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: 'var(--bg-elevated)', color: 'var(--text-muted)' },
  techTag: { padding: '2px 7px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(124,58,237,0.1)', color: 'hsl(270, 60%, 70%)' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ articles: 0, interviews: 0, published: 0, drafts: 0, techStacks: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [hoveredStat, setHoveredStat] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [articlesRes, interviewsRes, techRes] = await Promise.all([
        supabase.from('articles').select('id, title, slug, published, created_at').order('created_at', { ascending: false }),
        supabase.from('interview_questions').select('id, question, difficulty, stack, created_at').order('created_at', { ascending: false }),
        supabase.from('tech_stacks').select('id'),
      ])

      const articles = articlesRes.data || []
      const interviews = interviewsRes.data || []
      const techStacks = techRes.data || []

      setStats({
        articles: articles.length,
        interviews: interviews.length,
        published: articles.filter(a => a.published).length,
        drafts: articles.filter(a => !a.published).length,
        techStacks: techStacks.length,
      })

      const combined = [
        ...articles.map(a => ({ ...a, type: 'article' })),
        ...interviews.map(i => ({ ...i, type: 'interview' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setRecentActivity(combined.slice(0, 10))
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDashboardData()

    const articleSub = supabase
      .channel('admin-articles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, fetchDashboardData)
      .subscribe()

    const interviewSub = supabase
      .channel('admin-interviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interview_questions' }, fetchDashboardData)
      .subscribe()

    return () => {
      supabase.removeChannel(articleSub)
      supabase.removeChannel(interviewSub)
    }
  }, [fetchDashboardData])

  const statCards = [
    { id: 'articles', label: 'Total Articles', value: stats.articles, icon: <FileText size={22} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', link: '/admin/articles' },
    { id: 'interviews', label: 'Interview Questions', value: stats.interviews, icon: <MessageSquare size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', link: '/admin/interviews' },
    { id: 'published', label: 'Live Articles', value: stats.published, icon: <Eye size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)', link: '/admin/articles' },
    { id: 'techStacks', label: 'Tech Stacks', value: stats.techStacks, icon: <Database size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', link: '/admin/settings' },
  ]

  const quickActions = [
    { href: '/admin/articles/new', label: 'Write New Article', icon: <FileText size={20} />, color: '#7c3aed', desc: 'Start a deep-tech guide' },
    { href: '/admin/interviews/new', label: 'Add Interview Question', icon: <MessageSquare size={20} />, color: '#3b82f6', desc: 'Grow the question bank' },
    { href: '/admin/settings', label: 'Site Settings', icon: <Settings size={20} />, color: '#10b981', desc: 'Configure tech stacks & meta' },
  ]

  return (
    <div style={S.page}>
      {/* Header */}
      <motion.header style={S.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 style={S.h1}>
            Welcome back, <span className="gradient-text">Sid</span> 👋
          </h1>
          <p style={S.subtitle}>
            {loading ? 'Syncing live data…' : `Real-time dashboard · Updated ${lastRefresh?.toLocaleTimeString()}`}
          </p>
        </div>
        <button 
          style={S.refreshBtn} 
          onClick={fetchDashboardData} 
          disabled={loading}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          <span>Refresh</span>
        </button>
      </motion.header>

      {/* Stat Cards */}
      <div style={S.statsGrid}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={s.link}
              style={{
                ...S.statCard,
                boxShadow: hoveredStat === s.id ? '0 20px 40px rgba(0,0,0,0.1)' : 'none',
                transform: hoveredStat === s.id ? 'translateY(-6px)' : 'none',
                borderColor: hoveredStat === s.id ? 'var(--border-mid)' : 'var(--border-subtle)',
              }}
              onMouseEnter={() => setHoveredStat(s.id)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div style={{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: s.bg, color: s.color, transition: 'all 0.3s', transform: hoveredStat === s.id ? 'rotate(-6deg) scale(1.1)' : 'none' }}>
                {s.icon}
              </div>
              <div style={S.statBody}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, color: s.color }}>
                  <AnimatedCount value={s.value} loading={loading} />
                </div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
              <ArrowRight size={16} style={{ color: s.color, opacity: hoveredStat === s.id ? 1 : 0, transition: 'all 0.2s', transform: hoveredStat === s.id ? 'translateX(4px)' : 'none' }} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content — responsive grid via media query handled by wrapping div trick */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px', alignItems: 'start' }}
        className="dash-content-grid">
        {/* Recent Activity */}
        <motion.div style={S.panel} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={S.panelHeader}>
            <div style={S.panelTitle}>
              <Zap size={18} style={{ color: 'var(--accent)' }} />
              <h2 style={S.panelTitleText}>Recent Activity</h2>
            </div>
            <div style={S.panelLink}>Showing last 10 items</div>
          </div>

          <div style={S.panelList}>
            {loading ? (
              [0,1,2,3,4,5].map(i => <div key={i} style={{ ...S.skeleton, marginBottom: 6 }} />)
            ) : recentActivity.length === 0 ? (
              <div style={S.emptyPanel}>No activity yet.</div>
            ) : recentActivity.map((item, i) => (
              <motion.div key={`${item.type}-${item.id}`} style={S.listRow} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.03 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: item.type === 'article' ? 'rgba(124,58,237,0.1)' : 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.type === 'article' ? '#7c3aed' : '#3b82f6' }}>
                  {item.type === 'article' ? <FileText size={16} /> : <MessageSquare size={16} />}
                </div>
                <div style={S.rowInfo}>
                  <span style={S.rowTitle}>{item.type === 'article' ? (item.title || 'Untitled Article') : (item.question || 'Untitled Question')}</span>
                  <div style={S.rowMeta}>
                    <Clock size={11} /> {formatDate(item.created_at)}
                    &nbsp;·&nbsp;
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', color: item.type === 'article' ? '#7c3aed' : '#3b82f6' }}>{item.type}</span>
                    {item.type === 'interview' && item.stack && (
                      <>&nbsp;·&nbsp;<span style={S.techTag}>{item.stack}</span></>
                    )}
                  </div>
                </div>
                <div style={S.rowActions}>
                  <Link href={`/admin/${item.type === 'article' ? 'articles' : 'interviews'}/${item.id}`} style={S.rowBtn}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                  ><Pencil size={14} /></Link>
                  {item.type === 'article' && item.published && item.slug && (
                    <Link href={`/articles/${item.slug}`} target="_blank" style={S.rowBtn}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                    ><Eye size={14} /></Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column */}
        <div style={S.rightCol} className="dash-right-col">

          {/* Quick Actions */}
          <motion.div style={S.panel} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div style={S.panelHeader}>
              <div style={S.panelTitle}>
                <Zap size={18} style={{ color: '#f59e0b' }} />
                <h2 style={S.panelTitleText}>Quick Actions</h2>
              </div>
            </div>
            <div style={S.actionsList}>
              {quickActions.map((a, i) => (
                <Link key={i} href={a.href} style={S.actionCard}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateX(4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${a.color}18`, color: a.color }}>
                    {a.icon}
                  </div>
                  <div style={S.actionInfo}>
                    <span style={S.actionLabel}>{a.label}</span>
                    <span style={S.actionDesc}>{a.desc}</span>
                  </div>
                  <Plus size={16} style={{ color: 'var(--text-muted)' }} />
                </Link>
              ))}
            </div>
          </motion.div>


          {/* Content Health */}
          <motion.div style={S.panel} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div style={S.panelHeader}>
              <div style={S.panelTitle}>
                <TrendingUp size={18} style={{ color: '#10b981' }} />
                <h2 style={S.panelTitleText}>Content Health</h2>
              </div>
            </div>
            <div style={S.healthRows}>
              {[
                { label: 'Published', value: stats.published, total: stats.articles, color: '#10b981' },
                { label: 'Drafts', value: stats.drafts, total: stats.articles, color: '#f59e0b' },
                { label: 'Tech Stacks', value: stats.techStacks, total: 20, color: '#7c3aed' },
              ].map(row => (
                <div key={row.label} style={S.healthRow}>
                  <span style={S.healthLabel}>{row.label}</span>
                  <div style={S.healthBarWrap}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: row.total ? `${Math.min((row.value / row.total) * 100, 100)}%` : '0%' }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
                      style={{ height: '100%', borderRadius: '999px', background: row.color }}
                    />
                  </div>
                  <span style={S.healthVal}>{row.value}/{row.total}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      <style jsx global>{`
        .dash-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 400px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1280px) {
          .dash-content-grid { grid-template-columns: 1fr; }
          .dash-right-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; }
        }
        @media (max-width: 768px) {
          .dash-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .dash-header h1 { font-size: 1.8rem; }
          .dash-right-col { grid-template-columns: 1fr; }
          .health-row { grid-template-columns: 1fr auto !important; gap: 8px !important; }
          .health-bar-wrap { grid-column: span 2; order: 3; margin-top: 4px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .panel { padding: 20px !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
