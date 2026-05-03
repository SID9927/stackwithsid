'use client'

import { motion } from 'framer-motion'

export default function SidebarActivity() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '24px' }}
    >
      <h4 style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Recent Activity</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ActivityItem initial="JS" name="John Smith" text="Great guide! Cloudflare Workers really changed how I deploy..." color="var(--gradient-purple)" />
        <ActivityItem initial="AR" name="Alice Reed" text="Does the free tier cover DDoS protection for high traffic?" color="hsl(300, 70%, 50%)" />
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
