'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Layers, 
  Tag, 
  Globe, 
  Share2,
  Database
} from 'lucide-react'
import FormHeader from '@/components/admin/form/FormHeader'
import AdminFormStyles from '@/components/admin/form/AdminFormStyles'
import TechStackManager from '@/components/admin/settings/TechStackManager'
import CategoryManager from '@/components/admin/settings/CategoryManager'
import GeneralSettings from '@/components/admin/settings/GeneralSettings'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('stacks') // 'stacks' | 'categories' | 'general'

  const tabs = [
    { id: 'stacks', label: 'Tech Stacks', icon: <Database size={18} /> },
    { id: 'categories', label: 'Categories', icon: <Layers size={18} /> },
    { id: 'general', label: 'General Info', icon: <Globe size={18} /> },
  ]

  return (
    <div className="settings-container">
      <AdminFormStyles />
      
      <FormHeader 
        backLink="/admin" 
        backText="Dashboard" 
        title="Site Configuration" 
      />

      <div className="settings-layout">
        {/* Navigation Sidebar */}
        <aside className="settings-nav glass-card">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="icon">{tab.icon}</span>
              <span className="label">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="active-indicator"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="settings-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'stacks' && <TechStackManager />}
              {activeTab === 'general' && <GeneralSettings />}
              {activeTab === 'categories' && <CategoryManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style jsx>{`
        .settings-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          margin-top: 24px;
        }

        @media (max-width: 1024px) {
          .settings-layout { grid-template-columns: 1fr; }
        }

        .settings-nav {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: fit-content;
          position: sticky;
          top: 32px;
        }

        .nav-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }

        .nav-btn.active {
          color: var(--accent);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: 12px;
          z-index: -1;
        }

        .placeholder-card {
          padding: 60px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .placeholder-card h3 { display: flex; align-items: center; gap: 10px; color: var(--text-primary); margin: 0; }
        .placeholder-card p { color: var(--text-muted); max-width: 400px; line-height: 1.6; margin: 0; }
      `}</style>
    </div>
  )
}
