'use client'

import { motion } from 'framer-motion'

export default function SidebarActivity({ recentComments = [] }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '24px' }}
    >
      <h4 style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Recent Activity</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recentComments.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>No recent activity yet.</p>
        ) : (
          recentComments.map((comment, idx) => {
            const name = comment.profiles?.full_name || 'Anonymous'
            const initial = name.charAt(0).toUpperCase()
            const colors = ['var(--gradient-purple)', 'hsl(300, 70%, 50%)', 'hsl(200, 70%, 50%)']
            return (
              <ActivityItem 
                key={comment.id}
                initial={initial} 
                name={name} 
                text={comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content} 
                color={colors[idx % colors.length]} 
              />
            )
          })
        )}
      </div>
    </motion.div>
  )
}

function ActivityItem({ initial, name, text, color }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '50%', background: color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: '0.7rem', color: 'white', flexShrink: 0 
      }}>{initial}</div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.4 }}>{text}</p>
      </div>
    </div>
  )
}
