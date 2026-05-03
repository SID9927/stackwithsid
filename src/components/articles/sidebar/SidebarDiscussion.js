'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function SidebarDiscussion() {
  return (
    <div style={{ background: 'var(--gradient-purple)', borderRadius: '24px', padding: '28px', color: '#fff', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', fontFamily: 'Syne, sans-serif', color: '#fff' }}>Join the Discussion</h4>
        <p style={{ fontSize: '0.85rem', color: '#fff', opacity: 0.9, marginBottom: '20px', lineHeight: 1.5 }}>
          Have questions or tips? Join our growing community of developers.
        </p>
        <Link href="/discuss" style={{ textDecoration: 'none' }}>
          <div className="cta-button">
            Open Community <ArrowUpRight size={16} />
          </div>
        </Link>
      </div>
      <div className="cta-decoration" />

      <style jsx>{`
        .cta-button {
          height: 44px; background: #fff; color: var(--accent); border-radius: 12px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-weight: 700; font-size: 0.9rem; transition: all 0.2s ease;
        }
        .cta-button:hover { transform: scale(1.02); }

        .cta-decoration {
          position: absolute; top: -20%; right: -20%; width: 120px; height: 120px;
          background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(20px);
        }
      `}</style>
    </div>
  )
}
