'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Save, 
  Loader2, 
  Share2, 
  Mail
} from 'lucide-react'
import { SiGithub, SiX } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'

export default function GeneralSettings() {
  const [config, setConfig] = useState({
    site_name: 'StackWithSid',
    site_description: 'Master the stack with Sid',
    contact_email: 'hello@stackwithsid.com',
    github_url: '',
    linkedin_url: '',
    twitter_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', 'general')
      .single()
    
    if (!error && data) {
      setConfig(prev => ({ ...prev, ...data.value }))
    }
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('site_config')
      .upsert({ 
        key: 'general', 
        value: config,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })

    if (!error) {
      setFeedback({ msg: 'Settings saved successfully!', type: 'success' })
    } else {
      setFeedback({ msg: 'Error: ' + error.message, type: 'error' })
    }
    
    setTimeout(() => setFeedback(null), 3000)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spin" size={32} />
        <p>Loading site configuration...</p>
      </div>
    )
  }

  return (
    <form className="settings-form glass-card" onSubmit={handleSave}>
      <header className="section-header">
        <div className="icon-badge"><Globe size={20} /></div>
        <h3>General Site Info</h3>
      </header>

      <div className="form-grid">
        <div className="field-group">
          <label>Site Name</label>
          <input 
            value={config.site_name}
            onChange={e => setConfig({...config, site_name: e.target.value})}
            placeholder="e.g. StackWithSid"
          />
        </div>

        <div className="field-group">
          <label>Contact Email</label>
          <div className="input-with-icon">
            <Mail size={16} />
            <input 
              value={config.contact_email}
              onChange={e => setConfig({...config, contact_email: e.target.value})}
              placeholder="hello@example.com"
            />
          </div>
        </div>

        <div className="field-group full-width">
          <label>Site Description (SEO)</label>
          <textarea 
            value={config.site_description}
            onChange={e => setConfig({...config, site_description: e.target.value})}
            placeholder="Tell the world what your site is about..."
            rows={3}
          />
        </div>

        <div className="divider full-width"><Share2 size={16} /> Social Presence</div>

        <div className="field-group">
          <label><SiGithub size={14} /> GitHub Profile</label>
          <input 
            value={config.github_url}
            onChange={e => setConfig({...config, github_url: e.target.value})}
            placeholder="https://github.com/your-username"
          />
        </div>

        <div className="field-group">
          <label><FaLinkedin size={14} /> LinkedIn Profile</label>
          <input 
            value={config.linkedin_url}
            onChange={e => setConfig({...config, linkedin_url: e.target.value})}
            placeholder="https://linkedin.com/in/your-profile"
          />
        </div>

        <div className="field-group">
          <label><SiX size={14} /> Twitter Handle</label>
          <input 
            value={config.twitter_url}
            onChange={e => setConfig({...config, twitter_url: e.target.value})}
            placeholder="https://twitter.com/your-handle"
          />
        </div>
      </div>

      <footer className="form-footer">
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`feedback ${feedback.type}`}>
            {feedback.msg}
          </motion.div>
        )}
        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
          <span>Save Changes</span>
        </button>
      </footer>

      <style jsx>{`
        .settings-form { padding: 32px; }
        .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .icon-badge {
          width: 44px; height: 44px; border-radius: 12px; background: var(--gradient-purple);
          display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .section-header h3 { font-size: 1.25rem; color: var(--text-primary); margin: 0; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .full-width { grid-column: span 2; }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
        }

        .field-group label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
        .input-with-icon { position: relative; }
        .input-with-icon :global(svg) { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .input-with-icon input { padding-left: 42px !important; }

        .divider { display: flex; align-items: center; gap: 12px; color: var(--text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 12px 0; }
        .divider::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }

        .form-footer { display: flex; justify-content: flex-end; align-items: center; gap: 24px; margin-top: 40px; border-top: 1px solid var(--border-subtle); padding-top: 24px; }
        .feedback { font-size: 0.9rem; font-weight: 600; }
        .feedback.success { color: #22c55e; }
        .feedback.error { color: #ef4444; }

        .save-btn {
          height: 48px; padding: 0 32px; border-radius: 12px;
          background: var(--accent); color: #fff; border: none;
          display: flex; align-items: center; gap: 10px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }
        .save-btn:disabled { opacity: 0.5; }

        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px; color: var(--text-muted); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </form>
  )
}
