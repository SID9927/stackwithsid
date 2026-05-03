'use client'

import { motion } from 'framer-motion'
import { 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Users,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Articles', value: '24', icon: <FileText size={20} />, color: '#7c3aed' },
    { name: 'Interview Questions', value: '156', icon: <MessageSquare size={20} />, color: '#3b82f6' },
    { name: 'Daily Readers', value: '1.2k', icon: <Users size={20} />, color: '#10b981' },
    { name: 'Mastery Rate', value: '84%', icon: <TrendingUp size={20} />, color: '#f59e0b' },
  ]

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <h1>Welcome Back, Sid</h1>
        <p>Here is what's happening on your platform today.</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="stat-top">
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-badge">
                <ArrowUpRight size={14} /> 12%
              </div>
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dash-content">
        <div className="content-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="actions-grid">
            <Link href="/admin/articles/new" className="action-item">
              <div className="action-icon"><FileText size={24} /></div>
              <span>Create New Article</span>
            </Link>
            <Link href="/admin/interviews/new" className="action-item">
              <div className="action-icon"><MessageSquare size={24} /></div>
              <span>Add Interview Question</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          width: 100%;
          padding-top: 40px;
        }

        .dash-header { margin-bottom: 32px; }
        .dash-header h1 { 
          font-family: Syne, sans-serif; 
          font-size: clamp(1.8rem, 4vw, 2.4rem); 
          font-weight: 800; 
          margin-bottom: 8px; 
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }
        .dash-header p { color: var(--text-muted); font-size: 1rem; font-weight: 500; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        @media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1200px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

        .stat-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 32px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: var(--accent-soft);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          background: var(--bg-card-hover);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(124, 58, 237, 0.03), transparent 70%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }

        .stat-card:hover::before { opacity: 1; }

        .stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .stat-card:hover .stat-icon {
          transform: rotate(-5deg) scale(1.1);
          background: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
        }

        .stat-info h3 { 
          font-family: Syne, sans-serif;
          font-size: 1.6rem; 
          font-weight: 800; 
          margin: 0; 
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .stat-info p { 
          font-size: 0.8rem; 
          color: var(--text-muted); 
          margin: 2px 0 0; 
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-badge {
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.08);
          color: #10b981;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 3px;
          border: 1px solid rgba(16, 185, 129, 0.1);
        }

        .dash-content {
          margin-top: 32px;
        }

        .content-card { 
          padding: 32px;
          border-radius: 24px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
        }

        .card-header { margin-bottom: 24px; }
        .card-header h2 { 
          font-family: Syne, sans-serif; 
          font-size: 1.2rem; 
          font-weight: 800; 
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .action-item {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          padding: 20px;
          border-radius: 16px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .action-item:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent);
          transform: translateX(4px);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bg-secondary);
          color: var(--accent-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-item span { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
        .action-item::after {
          content: '→';
          margin-left: auto;
          font-size: 1.2rem;
          opacity: 0.3;
          transition: all 0.2s ease;
        }
        .action-item:hover::after {
          opacity: 1;
          transform: translateX(4px);
          color: var(--accent);
        }
      `}</style>
    </div>
  )
}
