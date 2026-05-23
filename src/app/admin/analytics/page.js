'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Layers, 
  Globe, 
  Laptop, 
  Compass, 
  FileText, 
  MessageSquare, 
  Settings as SettingsIcon,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  ChevronRight,
  TrendingDown,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import FormHeader from '@/components/admin/form/FormHeader'
import AdminFormStyles from '@/components/admin/form/AdminFormStyles'

export default function AnalyticsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [activeDays, setActiveDays] = useState(14) // 14 or 30 days view
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLogs(data)
      setLastRefresh(new Date())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter logs by the selected time window (days)
  const filteredLogs = useMemo(() => {
    const cutOffDate = new Date()
    cutOffDate.setDate(cutOffDate.getDate() - activeDays)
    return logs.filter(log => new Date(log.created_at) >= cutOffDate)
  }, [logs, activeDays])

  // ─── HIGH LEVEL METRICS COMPUTATION ──────────────────────────────────────────
  const metrics = useMemo(() => {
    if (filteredLogs.length === 0) return { views: 0, uniques: 0, bounce: 0, growth: 0 }

    // Unique visitors (by hash)
    const uniqueHashes = new Set(filteredLogs.map(l => l.visitor_hash).filter(Boolean))
    const uniques = uniqueHashes.size

    // Growth calculation (compare current activeDays window views vs previous activeDays window views)
    const now = new Date()
    const currentWindowStart = new Date(now.getTime() - activeDays * 24 * 60 * 60 * 1000)
    const previousWindowStart = new Date(now.getTime() - activeDays * 2 * 24 * 60 * 60 * 1000)

    const currentViews = logs.filter(l => {
      const d = new Date(l.created_at)
      return d >= currentWindowStart && d <= now
    }).length

    const prevViews = logs.filter(l => {
      const d = new Date(l.created_at)
      return d >= previousWindowStart && d < currentWindowStart
    }).length

    const growth = prevViews > 0 ? ((currentViews - prevViews) / prevViews) * 100 : 0

    // Average page views per session (approximated as views/uniques)
    const viewsPerSession = uniques > 0 ? (filteredLogs.length / uniques).toFixed(1) : 0

    return {
      views: filteredLogs.length,
      uniques,
      viewsPerSession,
      growth: growth.toFixed(1)
    }
  }, [logs, filteredLogs, activeDays])

  // ─── DAILY TRAFFIC TRENDS CHART DATA ──────────────────────────────────────────
  const chartData = useMemo(() => {
    const dailyCounts = {}
    
    // Initialize days
    for (let i = activeDays - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dailyCounts[dateStr] = 0
    }

    filteredLogs.forEach(log => {
      const dateStr = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++
      }
    })

    return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }))
  }, [filteredLogs, activeDays])

  // ─── GEOGRAPHIC DISTRIBUTION ────────────────────────────────────────────────
  const locationBreakdown = useMemo(() => {
    const countries = {}
    filteredLogs.forEach(l => {
      const c = l.country || 'Unknown'
      countries[c] = (countries[c] || 0) + 1
    })
    return Object.entries(countries)
      .map(([name, count]) => ({ name, count, percent: ((count / filteredLogs.length) * 100).toFixed(0) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredLogs])

  // ─── DEVICE BREAKDOWN ────────────────────────────────────────────────────────
  const deviceBreakdown = useMemo(() => {
    const devices = { Desktop: 0, Mobile: 0, Tablet: 0 }
    filteredLogs.forEach(l => {
      const d = l.device_type || 'Desktop'
      if (devices[d] !== undefined) devices[d]++
    })
    const total = filteredLogs.length || 1
    return Object.entries(devices).map(([name, count]) => ({
      name,
      count,
      percent: ((count / total) * 100).toFixed(0)
    })).sort((a, b) => b.count - a.count)
  }, [filteredLogs])

  // ─── BROWSER BREAKDOWN ───────────────────────────────────────────────────────
  const browserBreakdown = useMemo(() => {
    const browsers = {}
    filteredLogs.forEach(l => {
      const b = l.browser || 'Other'
      browsers[b] = (browsers[b] || 0) + 1
    })
    const total = filteredLogs.length || 1
    return Object.entries(browsers).map(([name, count]) => ({
      name,
      count,
      percent: ((count / total) * 100).toFixed(0)
    })).sort((a, b) => b.count - a.count).slice(0, 4)
  }, [filteredLogs])

  // ─── TOP PAGES BREAKDOWN ─────────────────────────────────────────────────────
  const topPages = useMemo(() => {
    const pages = {}
    filteredLogs.forEach(l => {
      const url = l.page_url || '/'
      if (!pages[url]) {
        pages[url] = { views: 0, uniques: new Set() }
      }
      pages[url].views++
      if (l.visitor_hash) pages[url].uniques.add(l.visitor_hash)
    })

    return Object.entries(pages).map(([url, data]) => {
      let type = 'Pages'
      if (url === '/' || url === '') type = 'Home'
      else if (url.startsWith('/articles/')) type = 'Article'
      else if (url.startsWith('/interview')) type = 'Interview'
      else if (url.startsWith('/tools')) type = 'Tool'
      else if (url.startsWith('/videos')) type = 'Video'

      return {
        url,
        type,
        views: data.views,
        uniques: data.uniques.size
      }
    }).sort((a, b) => b.views - a.views)
  }, [filteredLogs])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Reset pagination on data filter or window change
  useEffect(() => {
    setCurrentPage(1)
  }, [logs, activeDays])

  const paginatedTopPages = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    return topPages.slice(startIdx, startIdx + itemsPerPage)
  }, [topPages, currentPage])

  const totalPages = Math.ceil(topPages.length / itemsPerPage)

  // ─── AI RECOMMENDATIONS ENGINE ───────────────────────────────────────────────
  const aiRecommendations = useMemo(() => {
    const recs = []
    if (filteredLogs.length === 0) return []

    // 1. Identify Top Content Type Interest
    const articleViews = topPages.filter(p => p.type === 'Article').reduce((sum, p) => sum + p.views, 0)
    const interviewViews = topPages.filter(p => p.type === 'Interview').reduce((sum, p) => sum + p.views, 0)
    const toolViews = topPages.filter(p => p.type === 'Tool').reduce((sum, p) => sum + p.views, 0)

    if (articleViews > interviewViews && articleViews > toolViews) {
      recs.push({
        title: 'Tech Deep-Dives Are Hot',
        suggestion: 'Expand your article section. Visitors are highly engaged with deep-dive technical guides. Write a follow-up article for your top visited page.',
        impact: 'High',
        action: 'Draft Article'
      })
    } else if (interviewViews > articleViews && interviewViews > toolViews) {
      recs.push({
        title: 'Interview Q&A Focus',
        suggestion: ' curate more interview questions. ASP.NET or React preparation sheets are drawing the most attention. Add 5 new intermediate difficulty questions.',
        impact: 'High',
        action: 'Add Question'
      })
    }

    // 2. Device Optimizations
    const mobileData = deviceBreakdown.find(d => d.name === 'Mobile')
    const mobilePct = mobileData ? parseInt(mobileData.percent) : 0
    if (mobilePct > 50) {
      recs.push({
        title: 'Optimize for Mobile Speed',
        suggestion: `Mobile traffic is at ${mobilePct}%. Review article image dimensions and utilize WebP compression. Ensure code blocks scrolling works seamlessly on touch.`,
        impact: 'Medium',
        action: 'Check Layout'
      })
    }

    // 3. Page engagement ratio suggestions
    if (metrics.viewsPerSession < 1.5) {
      recs.push({
        title: 'Increase Page Circulation',
        suggestion: 'Average page views per session is low. Add prominent "Related Articles" links at the end of posts or insert cross-linking within explanations.',
        impact: 'Medium',
        action: 'Add Links'
      })
    }

    // 4. Tech stack categorization interest (derived from top pages url)
    const isNetJSInterested = topPages.some(p => p.url.includes('nextjs') || p.url.includes('react'))
    const isDotNetInterested = topPages.some(p => p.url.includes('routing') || p.url.includes('csharp') || p.url.includes('net'))

    if (isNetJSInterested) {
      recs.push({
        title: 'Focus: Next.js Ecosystem',
        suggestion: 'Next.js content is drawing high unique counts. Focus on App Router features, Hydration optimizations, or React Server Components.',
        impact: 'High',
        action: 'Write Next.js Guide'
      })
    }
    if (isDotNetInterested) {
      recs.push({
        title: 'Focus: ASP.NET Web API',
        suggestion: 'Your C# and routing articles are pulling consistent traffic. Create a cheatsheet covering ASP.NET Core Middleware or dependency injection patterns.',
        impact: 'High',
        action: 'Add C# Qs'
      })
    }

    return recs.slice(0, 3) // Return top 3 actionable items
  }, [filteredLogs, deviceBreakdown, topPages, metrics])

  // ─── SVG CHART COMPUTATION ───────────────────────────────────────────────────
  const chartSvgPath = useMemo(() => {
    if (chartData.length === 0) return ''
    const width = 600
    const height = 180
    const padding = 20

    const maxCount = Math.max(...chartData.map(d => d.count)) || 10
    const xStep = (width - padding * 2) / (chartData.length - 1 || 1)
    
    return chartData.map((d, index) => {
      const x = padding + index * xStep
      const y = height - padding - (d.count / maxCount) * (height - padding * 2)
      return { x, y, date: d.date, count: d.count }
    })
  }, [chartData])

  const linePathD = useMemo(() => {
    if (chartSvgPath.length === 0) return ''
    return chartSvgPath.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`
    }, '')
  }, [chartSvgPath])

  const areaPathD = useMemo(() => {
    if (chartSvgPath.length === 0) return ''
    const first = chartSvgPath[0]
    const last = chartSvgPath[chartSvgPath.length - 1]
    const height = 180
    const padding = 20
    return `${linePathD} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`
  }, [chartSvgPath, linePathD])

  return (
    <div className="analytics-container">
      <AdminFormStyles />
      
      <FormHeader 
        backLink="/admin" 
        backText="Dashboard" 
        title="Site Analytics" 
      />

      {/* Toolbar */}
      <div className="analytics-toolbar">
        <div className="time-selector">
          <button 
            className={activeDays === 14 ? 'active' : ''} 
            onClick={() => setActiveDays(14)}
          >
            Last 14 Days
          </button>
          <button 
            className={activeDays === 30 ? 'active' : ''} 
            onClick={() => setActiveDays(30)}
          >
            Last 30 Days
          </button>
        </div>

        <button 
          className="refresh-btn" 
          onClick={fetchData} 
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading && logs.length === 0 ? (
        <div className="loading-state glass-card">
          <Loader2 className="spin" size={48} />
          <p>Analyzing database logs...</p>
        </div>
      ) : (
        <>
          {/* Metrics summary cards */}
          <div className="metrics-grid">
            <div className="metric-card glass-card">
              <div className="metric-icon purple"><TrendingUp size={20} /></div>
              <div className="metric-value">{metrics.views}</div>
              <div className="metric-label">Total Page Views</div>
              <div className={`metric-change ${parseFloat(metrics.growth) >= 0 ? 'up' : 'down'}`}>
                {parseFloat(metrics.growth) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{metrics.growth}% vs prev period</span>
              </div>
            </div>

            <div className="metric-card glass-card">
              <div className="metric-icon blue"><Users size={20} /></div>
              <div className="metric-value">{metrics.uniques}</div>
              <div className="metric-label">Unique Visitors</div>
              <div className="metric-hint">Anonymously fingerprinted</div>
            </div>

            <div className="metric-card glass-card">
              <div className="metric-icon green"><Layers size={20} /></div>
              <div className="metric-value">{metrics.viewsPerSession}</div>
              <div className="metric-label">Pages / Session</div>
              <div className="metric-hint">Reader circulation index</div>
            </div>

            <div className="metric-card glass-card">
              <div className="metric-icon orange"><Globe size={20} /></div>
              <div className="metric-value">{locationBreakdown[0]?.name || '—'}</div>
              <div className="metric-label">Top Location</div>
              <div className="metric-hint">Highest volume traffic origin</div>
            </div>
          </div>

          {/* Chart & AI Recommendations Row */}
          <div className="analytics-main-grid">
            
            {/* SVG Interactive Chart */}
            <div className="chart-panel glass-card">
              <div className="panel-header">
                <h3><TrendingUp size={18} /> Traffic Overview</h3>
                <span className="chart-meta">Daily page hits</span>
              </div>
              
              <div className="chart-wrapper">
                {chartSvgPath.length > 0 ? (
                  <svg viewBox="0 0 600 180" width="100%" height="100%" className="traffic-svg">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="20" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                    <line x1="20" y1="90" x2="580" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                    <line x1="20" y1="160" x2="580" y2="160" stroke="rgba(255,255,255,0.08)" />

                    {/* Gradient Area */}
                    <path d={areaPathD} fill="url(#chartGrad)" />

                    {/* Spline Line */}
                    <path d={linePathD} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />

                    {/* Hover dots & Hotspots */}
                    {chartSvgPath.map((p, i) => (
                      <g key={i}>
                        {hoveredPoint === i && (
                          <>
                            <line x1={p.x} y1="20" x2={p.x} y2="160" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="1" />
                            <circle cx={p.x} cy={p.y} r="6" fill="var(--accent)" />
                            <circle cx={p.x} cy={p.y} r="10" stroke="var(--accent)" strokeWidth="2" fill="none" opacity="0.4" />
                          </>
                        )}
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="4" 
                          fill="var(--bg-elevated)" 
                          stroke="var(--accent)" 
                          strokeWidth="2.5" 
                        />
                        {/* Transparent mouse hit target */}
                        <rect
                          x={p.x - 15}
                          y={10}
                          width={30}
                          height={150}
                          fill="transparent"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredPoint(i)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    ))}
                  </svg>
                ) : (
                  <div className="empty-chart">Insufficient logs to render trends.</div>
                )}

                {/* Tooltip Overlay */}
                <AnimatePresence>
                  {hoveredPoint !== null && chartSvgPath[hoveredPoint] && (
                    <motion.div 
                      className="chart-tooltip"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        left: `${(chartSvgPath[hoveredPoint].x / 600) * 100}%`,
                        top: `${(chartSvgPath[hoveredPoint].y / 180) * 100 - 32}%`
                      }}
                    >
                      <div className="tip-date">{chartSvgPath[hoveredPoint].date}</div>
                      <div className="tip-count">{chartSvgPath[hoveredPoint].count} views</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chart X Labels */}
              <div className="chart-x-labels">
                <span>{chartData[0]?.date}</span>
                <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
                <span>{chartData[chartData.length - 1]?.date}</span>
              </div>
            </div>

            {/* AI Recommendations Panel */}
            <div className="recs-panel glass-card">
              <div className="panel-header">
                <h3><Sparkles size={18} className="text-accent" /> AI Content Strategy</h3>
              </div>

              <div className="recs-list">
                {aiRecommendations.length > 0 ? (
                  aiRecommendations.map((rec, i) => (
                    <div key={i} className="rec-card">
                      <div className="rec-badge-row">
                        <span className={`impact-badge ${rec.impact.toLowerCase()}`}>
                          {rec.impact} Impact
                        </span>
                        <span className="rec-action-hint">{rec.action}</span>
                      </div>
                      <h4>{rec.title}</h4>
                      <p>{rec.suggestion}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>Accumulating data. Recommendations will generate as traffic logs build up.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Breakdowns & Top Content Row */}
          <div className="analytics-details-grid">
            
            {/* Left Column: Audience Breakdown */}
            <div className="breakdowns-col">
              {/* Devices */}
              <div className="breakdown-card glass-card">
                <h3><Laptop size={18} /> Devices</h3>
                <div className="bars-list">
                  {deviceBreakdown.map(dev => (
                    <div key={dev.name} className="bar-row">
                      <div className="bar-label-row">
                        <span>{dev.name}</span>
                        <span>{dev.percent}%</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill purple" 
                          style={{ width: `${dev.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browsers */}
              <div className="breakdown-card glass-card">
                <h3><Compass size={18} /> Browsers</h3>
                <div className="bars-list">
                  {browserBreakdown.map(brow => (
                    <div key={brow.name} className="bar-row">
                      <div className="bar-label-row">
                        <span>{brow.name}</span>
                        <span>{brow.percent}%</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill blue" 
                          style={{ width: `${brow.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="breakdown-card glass-card">
                <h3><Globe size={18} /> Locations</h3>
                <div className="location-list">
                  {locationBreakdown.length > 0 ? (
                    locationBreakdown.map(loc => (
                      <div key={loc.name} className="location-row">
                        <span className="loc-name">{loc.name}</span>
                        <div className="loc-stats">
                          <span className="loc-count">{loc.count} hits</span>
                          <span className="loc-pct">{loc.percent}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">No location data captured yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Top Pages */}
            <div className="top-pages-panel glass-card">
              <div className="panel-header">
                <h3><FileText size={18} /> Content Consumption</h3>
                <span className="panel-hint">Top visited paths</span>
              </div>

              <div className="top-pages-table-wrapper scrollbar-hide">
                <table className="top-pages-table">
                  <thead>
                    <tr>
                      <th>URL Path</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Unique Users</th>
                      <th style={{ textAlign: 'right' }}>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTopPages.map((page, i) => (
                      <tr key={i}>
                        <td className="path-cell" title={page.url}>{page.url}</td>
                        <td>
                          <span className={`type-tag ${page.type.toLowerCase()}`}>
                            {page.type}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{page.uniques}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-soft)' }}>
                          {page.views}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    className="pagi-btn"
                  >
                    Previous
                  </button>
                  <span className="pagi-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    className="pagi-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      <style jsx global>{`
        .analytics-container {
          padding-top: 32px;
          color: var(--text-primary);
        }

        .analytics-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .time-selector {
          display: flex;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 4px;
        }
        .time-selector button {
          background: transparent;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .time-selector button.active {
          background: var(--bg-card);
          color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          padding: 24px;
          position: relative;
          min-height: 140px;
        }
        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .metric-icon.purple { background: rgba(124,58,237,0.12); color: #7c3aed; }
        .metric-icon.blue { background: rgba(59,130,246,0.12); color: #3b82f6; }
        .metric-icon.green { background: rgba(16,185,129,0.12); color: #10b981; }
        .metric-icon.orange { background: rgba(245,158,11,0.12); color: #f59e0b; }

        .metric-value {
          font-family: Syne, sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1;
          color: var(--text-primary);
        }
        .metric-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-top: 6px;
        }
        .metric-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          margin-top: 8px;
        }
        .metric-change.up { color: #10b981; }
        .metric-change.down { color: #ef4444; }
        .metric-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .analytics-main-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
          margin-bottom: 32px;
          align-items: stretch;
        }
        @media (max-width: 1280px) {
          .analytics-main-grid { grid-template-columns: 1fr; }
        }

        .chart-panel {
          padding: 28px;
          display: flex;
          flex-direction: column;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .panel-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.05rem;
          color: var(--text-primary);
          margin: 0;
        }
        .chart-meta {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .chart-wrapper {
          position: relative;
          width: 100%;
          height: 180px;
        }
        .chart-x-labels {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px 0;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .chart-tooltip {
          background: rgba(13, 13, 18, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 6px 12px;
          color: #fff;
          font-size: 0.75rem;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          backdrop-filter: blur(8px);
          transform: translateX(-50%);
          white-space: nowrap;
          z-index: 10;
        }
        .tip-date { font-weight: 600; opacity: 0.6; }
        .tip-count { font-weight: 800; color: var(--accent-soft); margin-top: 2px; }

        .recs-panel {
          padding: 28px;
        }
        .recs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rec-card {
          padding: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
        }
        .rec-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .impact-badge {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .impact-badge.high { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        .impact-badge.medium { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
        .rec-action-hint {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-soft);
        }
        .rec-card h4 {
          font-size: 0.92rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 6px 0;
        }
        .rec-card p {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .analytics-details-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .analytics-details-grid { grid-template-columns: 1fr; }
        }

        .breakdowns-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .breakdown-card {
          padding: 24px;
        }
        .breakdown-card h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          color: var(--text-primary);
          margin: 0 0 20px 0;
        }

        .bars-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bar-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bar-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .bar-track {
          height: 6px;
          background: var(--bg-elevated);
          border-radius: 3px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 3px;
        }
        .bar-fill.purple { background: var(--gradient-purple); }
        .bar-fill.blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }

        .location-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .location-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.02);
        }
        .location-row:last-child { border: none; }
        .loc-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .loc-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .loc-count {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .loc-pct {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-soft);
        }

        .top-pages-panel {
          padding: 28px;
        }
        .panel-hint {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .top-pages-table-wrapper {
          overflow-x: auto;
        }
        .top-pages-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }
        .top-pages-table th {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .top-pages-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-secondary);
        }
        .top-pages-table tr:last-child td { border: none; }
        .top-pages-table tr:hover td { background: rgba(124,58,237,0.02); }

        .path-cell {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          max-width: 240px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 16px 0;
          margin-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }
        .pagi-btn {
          padding: 6px 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pagi-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(124, 58, 237, 0.05);
          transform: translateY(-1px);
        }
        .pagi-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .pagi-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pagi-info {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .type-tag {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid transparent;
        }
        .type-tag.home { background: rgba(16,185,129,0.1); color: #10b981; border-color: rgba(16,185,129,0.15); }
        .type-tag.article { background: rgba(124,58,237,0.1); color: #7c3aed; border-color: rgba(124,58,237,0.15); }
        .type-tag.interview { background: rgba(59,130,246,0.1); color: #3b82f6; border-color: rgba(59,130,246,0.15); }
        .type-tag.tool { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.15); }
        .type-tag.pages { background: rgba(107,114,128,0.1); color: #9ca3af; border-color: rgba(107,114,128,0.15); }

        .loading-state {
          padding: 100px 40px;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-state {
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
        }

        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
