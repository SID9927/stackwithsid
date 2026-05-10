'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
  User, Mail, Phone, Calendar as CalendarIcon, Briefcase, 
  UserCircle, Save, ArrowLeft, Loader2,
  CheckCircle2, AlertCircle, Sparkles,
  ChevronRight, Camera, Bookmark, ExternalLink,
  BookOpen, ChevronLeft, ChevronRight as ChevronRightIcon,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    dob: '',
    mobile: '',
    gender: '',
    profession: '',
    bio: '',
    avatar_url: ''
  })

  // Calendar State
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [currentViewDate, setCurrentViewDate] = useState(new Date())
  const calendarRef = useRef(null)

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        setUser(session.user)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            email: data.email || session.user.email || '',
            dob: data.dob || '',
            mobile: data.mobile || '',
            gender: data.gender || '',
            profession: data.profession || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || ''
          })

          if (data.dob) {
            setCurrentViewDate(new Date(data.dob))
          }
        } else {
          setFormData(prev => ({
            ...prev,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || ''
          }))
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router])

  useEffect(() => {
    if (activeTab === 'bookmarks' && user) {
      fetchBookmarks()
    }
  }, [activeTab, user])

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowDatePicker(false)
        setShowYearPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchBookmarks = async () => {
    if (!user) return
    setLoadingBookmarks(true)
    try {
      // 1. Fetch Article Bookmarks
      const { data: articleData, error: articleError } = await supabase
        .from('article_bookmarks')
        .select(`
          article_id,
          articles:article_id (
            id,
            title,
            slug,
            excerpt,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (articleError) {
        console.error('Error fetching article bookmarks:', articleError)
      }
      
      // 2. Fetch Interview Bookmarks
      const { data: interviewData, error: interviewError } = await supabase
        .from('interview_bookmarks')
        .select(`
          question_id,
          interview_questions:question_id (
            id,
            question,
            answer,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (interviewError) {
        console.error('Error fetching interview bookmarks:', interviewError)
      }
      
      // 3. Combine and Format
      const combined = [
        ...(articleData?.map(b => b.articles ? { ...b.articles, type: 'article' } : null) || []),
        ...(interviewData?.map(b => b.interview_questions ? { ...b.interview_questions, type: 'interview' } : null) || [])
      ].filter(Boolean)

      // Sort by creation date
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        
      setBookmarks(combined)
    } catch (error) {
      console.error('Error in fetchBookmarks:', error)
      setMessage({ type: 'error', text: 'Could not load your saved content.' })
    } finally {
      setLoadingBookmarks(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to save changes.' })
    } finally {
      setSaving(false)
    }
  }

  // Calendar Helper Logic
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const handleDateClick = (day) => {
    const selected = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day)
    const formatted = selected.toISOString().split('T')[0]
    setFormData({ ...formData, dob: formatted })
    setShowDatePicker(false)
  }

  const changeMonth = (offset) => {
    const nextDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + offset, 1)
    setCurrentViewDate(nextDate)
  }

  const selectYear = (year) => {
    const nextDate = new Date(year, currentViewDate.getMonth(), 1)
    setCurrentViewDate(nextDate)
    setShowYearPicker(false)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <Loader2 className="spinner" />
          <p>Initializing workspace...</p>
        </div>
        <style jsx>{`
          .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); }
          .loader-container { display: flex; flex-direction: column; align-items: center; gap: 16px; }
          .spinner { width: 48px; height: 48px; animation: spin 1s linear infinite; color: var(--accent); }
          p { color: var(--text-muted); font-weight: 500; letter-spacing: 0.05em; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <main className="profile-page">
      <div className="bg-decor">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="content-container">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={14} className="sep" />
          <span className="active">Account Settings</span>
        </div>

        <div className="layout-grid">
          <aside className="sidebar">
            <div className="profile-card-mini">
              <div className="avatar-wrapper">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {formData.full_name[0] || user.email[0]}
                  </div>
                )}
                <div className="avatar-overlay"><Camera size={20} /></div>
              </div>
              <h3 className="profile-name">{formData.full_name || 'Anonymous User'}</h3>
              <p className="profile-email">{user.email}</p>
            </div>

            <nav className="side-nav">
              <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <UserCircle size={18} /> <span>Personal Profile</span>
              </div>
              <div className={`nav-item ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>
                <Bookmark size={18} /> <span>My Bookmarks</span>
              </div>
              <div className="nav-item disabled"><Sparkles size={18} /> <span>Security</span></div>
              <div className="nav-item disabled"><CalendarIcon size={18} /> <span>Activity Log</span></div>
            </nav>
          </aside>

          <div className="main-content">
            {activeTab === 'profile' ? (
              <form onSubmit={handleSubmit}>
                <div className="settings-card">
                  <div className="card-header">
                    <div className="header-icon"><User size={24} /></div>
                    <div className="header-text">
                      <h2>Identity & Details</h2>
                      <p>Fill in your professional persona.</p>
                    </div>
                  </div>


                  <div className="form-sections">
                    <div className="input-grid">
                      <ModernInput label="Full Legal Name" value={formData.full_name} onChange={(val) => setFormData({...formData, full_name: val})} placeholder="e.g. Siddharth Singh" />
                      <ModernInput label="Profession / Role" value={formData.profession} onChange={(val) => setFormData({...formData, profession: val})} placeholder="e.g. Full Stack Developer" />
                      
                      <div className="input-group" style={{ position: 'relative' }} ref={calendarRef}>
                        <label className="input-label">Date of Birth</label>
                        <div 
                          className={`custom-picker-trigger ${showDatePicker ? 'focused' : ''}`}
                          onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                          <span className={formData.dob ? 'text-primary' : 'text-muted'}>
                            {formData.dob ? new Date(formData.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Select your birth date'}
                          </span>
                          <CalendarIcon size={18} className="trigger-icon" />
                        </div>

                        <AnimatePresence>
                          {showDatePicker && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="bespoke-calendar"
                            >
                              {!showYearPicker ? (
                                <>
                                  <div className="calendar-header">
                                    <button type="button" onClick={() => changeMonth(-1)} className="nav-btn"><ChevronLeft size={16} /></button>
                                    <div className="header-title" onClick={() => setShowYearPicker(true)}>
                                      <span>{months[currentViewDate.getMonth()]} {currentViewDate.getFullYear()}</span>
                                      <ChevronDown size={14} className="ml-1" />
                                    </div>
                                    <button type="button" onClick={() => changeMonth(1)} className="nav-btn"><ChevronRightIcon size={16} /></button>
                                  </div>
                                  <div className="calendar-grid">
                                    {days.map(d => <div key={d} className="day-name">{d}</div>)}
                                    {Array.from({length: getFirstDayOfMonth(currentViewDate.getFullYear(), currentViewDate.getMonth())}).map((_, i) => (
                                      <div key={`empty-${i}`} className="day empty" />
                                    ))}
                                    {Array.from({length: getDaysInMonth(currentViewDate.getFullYear(), currentViewDate.getMonth())}).map((_, i) => {
                                      const day = i + 1
                                      const isSelected = formData.dob && 
                                        new Date(formData.dob).getDate() === day && 
                                        new Date(formData.dob).getMonth() === currentViewDate.getMonth() && 
                                        new Date(formData.dob).getFullYear() === currentViewDate.getFullYear()
                                      return (
                                        <div key={day} onClick={() => handleDateClick(day)} className={`day-cell ${isSelected ? 'selected' : ''}`}>
                                          {day}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div className="year-picker-view">
                                  <div className="calendar-header">
                                    <button type="button" onClick={() => setShowYearPicker(false)} className="nav-btn"><ArrowLeft size={16} /></button>
                                    <div className="header-title">Select Year</div>
                                    <div style={{ width: '28px' }} />
                                  </div>
                                  <div className="year-grid">
                                    {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(y => (
                                      <div 
                                        key={y} 
                                        onClick={() => selectYear(y)}
                                        className={`year-cell ${currentViewDate.getFullYear() === y ? 'active' : ''}`}
                                      >
                                        {y}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Gender Identity</label>
                        <div className="gender-toggle">
                          {['Male', 'Female', 'Other'].map(g => (
                            <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})} className={formData.gender === g ? 'active' : ''}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <ModernInput label="Contact Number" value={formData.mobile} onChange={(val) => setFormData({...formData, mobile: val})} placeholder="+91 00000 00000" />
                      <ModernInput label="Account Email" value={formData.email} disabled placeholder="mail@example.com" note="System Locked" />
                    </div>
                    <div className="bio-section">
                      <label className="input-label">Professional Bio</label>
                      <textarea rows={4} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Short summary about yourself..." />
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="footer-note">Your profile is visible to other members in the community.</div>
                    <div className="footer-actions-container">
                      <div className="footer-actions">
                        <button type="button" onClick={() => router.push('/')} className="btn-secondary">Discard</button>
                        <button type="submit" disabled={saving} className="btn-primary">
                          {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                          {saving ? 'Syncing...' : 'Update Profile'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {message.text && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.95 }} 
                            className={`alert-banner ${message.type}`}
                          >
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            <span>{message.text}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="settings-card">
                <div className="card-header"><div className="header-icon"><Bookmark size={24} /></div><div className="header-text"><h2>Saved Content</h2><p>Items you've bookmarked for later.</p></div></div>
                {loadingBookmarks ? (
                  <div className="loading-state"><Loader2 className="spinner spin" /><p>Retrieving your library...</p></div>
                ) : bookmarks.length > 0 ? (
                  <div className="bookmarks-grid">
                    {bookmarks.map(item => (
                      <Link 
                        key={item.id} 
                        href={item.type === 'article' ? `/articles/${item.slug}` : `/interview?q=${item.id}`} 
                        className="bookmark-item"
                      >
                        <div className="bookmark-content">
                          <div className={`type-badge ${item.type}`}>
                            {item.type === 'article' ? 'Article' : 'Interview'}
                          </div>
                          <h3>{item.type === 'article' ? item.title : item.question}</h3>
                          <p>{(item.type === 'article' ? item.excerpt : item.answer)?.substring(0, 100).replace(/<[^>]*>/g, '')}...</p>
                          <div className="bookmark-meta">
                            <BookOpen size={12} />
                            <span>{item.type === 'article' ? 'Read Article' : 'View Question'}</span>
                            <ExternalLink size={12} className="meta-icon" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-bookmarks">
                    <div className="empty-icon"><Bookmark size={40} /></div>
                    <h3>No Bookmarks Yet</h3>
                    <p>Content you save will appear here for quick access.</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <Link href="/articles" className="btn-secondary" style={{ border: '1px solid var(--border-subtle)', borderRadius: '18px' }}>Articles</Link>
                      <Link href="/interview" className="btn-primary">Interviews</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page { min-height: 100vh; background: var(--bg-primary); padding-top: 30px; padding-bottom: 80px; position: relative; color: var(--text-primary); transition: background 0.3s ease; }
        .bg-decor { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb { position: absolute; border-radius: 50%; filter: blur(140px); opacity: 0.15; }
        .orb-1 { top: 15%; right: -5%; width: 500px; height: 500px; background: var(--accent); }
        .orb-2 { bottom: 20%; left: -5%; width: 600px; height: 600px; background: #fbbf24; }
        .content-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 10; }
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 32px; color: var(--text-muted); }
        .breadcrumb a { text-decoration: none; color: inherit; transition: color 0.2s; }
        .breadcrumb a:hover { color: var(--text-primary); }
        .breadcrumb .sep { opacity: 0.3; }
        .breadcrumb .active { color: var(--accent); }
        .layout-grid { display: flex; gap: 40px; align-items: flex-start; }
        .sidebar { width: 300px; flex-shrink: 0; }
        .profile-card-mini { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 24px; padding: 24px; margin-bottom: 24px; backdrop-filter: blur(20px); box-shadow: var(--shadow-card); }
        .avatar-wrapper { position: relative; width: 80px; height: 80px; border-radius: 20px; background: var(--bg-secondary); overflow: hidden; margin-bottom: 16px; border: 1px solid var(--border-subtle); cursor: pointer; }
        .avatar-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: var(--accent); }
        .avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: #fff; }
        .avatar-wrapper:hover .avatar-overlay { opacity: 1; }
        .profile-name { font-size: 18px; font-weight: 700; margin: 0; color: var(--text-primary); }
        .profile-email { color: var(--text-secondary); font-size: 12px; margin: 4px 0 0; word-break: break-all; opacity: 0.7; }
        .side-nav { display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-radius: 16px; font-size: 14px; font-weight: 700; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
        .nav-item:hover:not(.disabled) { background: var(--bg-secondary); color: var(--text-primary); }
        .nav-item.active { background: var(--accent); color: #fff; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }
        .nav-item.active :global(svg) { color: #fff !important; }
        .nav-item.disabled { opacity: 0.3; cursor: not-allowed; }
        .main-content { flex: 1; min-width: 0; }
        .settings-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 40px; padding: 40px; backdrop-filter: blur(40px); box-shadow: var(--shadow-card); }
        .card-header { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
        .header-icon { width: 48px; height: 48px; border-radius: 16px; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }
        .header-text h2 { font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.02em; color: var(--text-primary); }
        .header-text p { color: var(--text-primary); font-size: 14px; margin: 4px 0 0; opacity: 0.6; }
        .form-sections { display: flex; flex-direction: column; gap: 32px; }
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .input-group { display: flex; flex-direction: column; gap: 10px; }
        .input-label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); margin-left: 4px; }
        
        .custom-picker-trigger { width: 100%; height: 52px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s; }
        .custom-picker-trigger:hover { border-color: var(--accent); }
        .custom-picker-trigger.focused { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
        .text-primary { color: var(--text-primary); font-size: 14px; font-weight: 600; }
        .text-muted { color: var(--text-muted); font-size: 14px; }
        .trigger-icon { color: var(--text-muted); }
        
        .bespoke-calendar { position: absolute; top: 100%; left: 0; width: 300px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.4); backdrop-filter: blur(50px); z-index: 999; margin-top: 8px; }
        .calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .nav-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer; transition: all 0.2s; }
        .nav-btn:hover { border-color: var(--accent); color: var(--accent); }
        .header-title { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 800; color: var(--text-primary); cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
        .header-title:hover { background: var(--bg-secondary); color: var(--accent); }
        
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .day-name { font-size: 9px; font-weight: 900; color: var(--text-muted); text-align: center; height: 24px; display: flex; align-items: center; justify-content: center; text-transform: uppercase; }
        .day-cell { height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--text-primary); cursor: pointer; transition: all 0.2s; }
        .day-cell:hover:not(.selected) { background: var(--bg-secondary); color: var(--accent); }
        .day-cell.selected { background: var(--accent); color: #fff; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3); }
        .day.empty { cursor: default; }

        .year-picker-view { width: 100%; }
        .year-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 200px; overflow-y: auto; padding-right: 4px; margin-top: 10px; }
        .year-grid::-webkit-scrollbar { width: 4px; }
        .year-grid::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 10px; }
        .year-cell { height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 13px; font-weight: 700; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .year-cell:hover { background: var(--bg-secondary); color: var(--accent); }
        .year-cell.active { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent); }

        .gender-toggle { display: flex; gap: 10px; }
        .gender-toggle button { flex: 1; height: 52px; border-radius: 14px; border: 1px solid var(--border-subtle); background: var(--bg-secondary); color: var(--text-muted); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; outline: none; }
        .gender-toggle button.active { background: var(--accent); border-color: var(--accent); color: #fff; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3); }
        .bio-section textarea { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 20px; color: var(--text-primary); font-size: 14px; line-height: 1.6; outline: none; transition: border 0.2s; resize: none; margin-top: 10px; }
        .card-footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: flex-start; }
        .footer-note { font-size: 12px; color: var(--text-muted); font-style: italic; max-width: 250px; line-height: 1.6; }
        .footer-actions-container { display: flex; flex-direction: column; gap: 16px; align-items: flex-end; }
        .footer-actions { display: flex; gap: 20px; align-items: center; }
        
        .alert-banner { display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: flex-end !important; gap: 10px !important; width: 100%; padding: 4px 0; transition: all 0.3s ease; }
        .alert-banner.success { color: #a855f7 !important; }
        .alert-banner.error { color: #f87171 !important; }
        .alert-banner span { font-size: 14px; font-weight: 700; color: inherit !important; line-height: 1; }
        .alert-banner :global(svg) { color: inherit !important; flex-shrink: 0; }
        .bookmarks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .bookmark-item { text-decoration: none; display: block; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 28px; padding: 32px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
        .bookmark-item::before { content: ''; position: absolute; inset: 0; background: var(--gradient-purple); opacity: 0; transition: opacity 0.3s; z-index: 0; }
        .bookmark-item:hover { transform: translateY(-8px); border-color: var(--accent); background: var(--bg-card); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        
        .bookmark-content { position: relative; z-index: 1; }
        .bookmark-content h3 { font-family: Syne, sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 12px; line-height: 1.4; transition: color 0.3s; }
        .bookmark-content p { color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 24px; opacity: 0.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .bookmark-meta { display: flex; align-items: center; gap: 10px; color: var(--accent); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
        .bookmark-meta span { margin-top: 1px; }
        .meta-icon { opacity: 0.5; transition: transform 0.3s; }
        .bookmark-item:hover .meta-icon { transform: translateX(4px); opacity: 1; }

        .type-badge {
          display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 9px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;
        }
        .type-badge.article { background: rgba(124, 58, 237, 0.1); color: var(--accent); }
        .type-badge.interview { background: rgba(0, 255, 170, 0.1); color: #00ffaa; }

        .empty-bookmarks { text-align: center; padding: 60px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .empty-icon { width: 80px; height: 80px; border-radius: 24px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 24px; opacity: 0.5; }
        .empty-bookmarks h3 { font-family: Syne, sans-serif; font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
        .empty-bookmarks p { color: var(--text-muted); font-size: 14px; max-width: 280px; line-height: 1.6; margin-bottom: 0; }

        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; gap: 16px; color: var(--text-muted); font-weight: 600; font-size: 14px; }
        .btn-primary { background: var(--accent); color: #fff; border: none; height: 56px; padding: 0 36px; border-radius: 18px; font-size: 15px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3); text-decoration: none; }
        .btn-secondary { background: transparent; color: var(--text-muted); border: none; padding: 0 28px; height: 56px; font-weight: 700; cursor: pointer; transition: color 0.2s; font-size: 15px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .bookmarks-grid { grid-template-columns: 1fr; }
          .bookmark-item { padding: 24px; border-radius: 20px; }
        }
      `}</style>
    </main>
  )
}

function ModernInput({ label, value, onChange, placeholder, type = "text", disabled = false, note }) {
  return (
    <div className="input-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="input-label">{label}</label>
        {note && <span style={{ fontSize: '9px', fontWeight: '800', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-muted)' }}>{note}</span>}
      </div>
      <input 
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', height: '52px', background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0 16px',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '14px', fontWeight: '500',
          outline: 'none', transition: 'all 0.2s',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
        onFocus={(e) => !disabled && (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => !disabled && (e.target.style.borderColor = 'var(--border-subtle)')}
      />
    </div>
  )
}
