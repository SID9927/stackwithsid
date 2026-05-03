'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import RevealOnScroll from '@/components/animations/RevealOnScroll'

export default function StackChips({ stacks }) {
  if (!stacks) return null

  return (
    <section style={{ padding: '80px 5% 120px', position: 'relative' }}>
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '60%', height: '40%',
        background: 'radial-gradient(circle, hsl(270,75%,55%,0.08) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <RevealOnScroll>
          <div style={{ marginBottom: 48 }}>
            <span className="badge badge-purple" style={{ marginBottom: 16 }}>Master Your Craft</span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>
              Interview prep by stack
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Pick your stack, ace your next interview</p>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 16, 
            justifyContent: 'center',
            padding: '0 20px'
          }}>
            {stacks.map(({ name, icon: Icon }, i) => (
              <RevealOnScroll key={name} delay={i * 0.05} direction="up">
                <Link href={`/interview?stack=${name.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '14px 28px',
                      borderRadius: 20,
                      background: 'var(--bg-card)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="stack-chip-v2"
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32,
                      borderRadius: 10,
                      background: 'var(--gradient-purple)',
                      color: 'white',
                      boxShadow: '0 4px 12px hsl(270,75%,55%,0.3)',
                    }}>
                      <Icon size={18} />
                    </div>
                    {name}
                  </motion.div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </RevealOnScroll>
      </div>

      <style jsx>{`
        .stack-chip-v2:hover { 
          border-color: var(--accent) !important; 
          box-shadow: 0 10px 25px -5px hsl(270,75%,55%,0.2) !important;
          background: var(--bg-primary) !important;
        }
      `}</style>
    </section>
  )
}
