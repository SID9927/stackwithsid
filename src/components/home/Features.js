'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import RevealOnScroll from '@/components/animations/RevealOnScroll'
import TiltCard from '@/components/animations/TiltCard'

export default function Features({ features }) {
  if (!features) return null

  return (
    <section style={{ padding: '100px 5%', position: 'relative' }}>
      <div style={{ maxWidth: 1500, margin: '0 auto' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="badge badge-purple" style={{ marginBottom: 16 }}>Everything You Need</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 16 }}>
              Built for developers,<br />
              <span style={{
                background: 'var(--gradient-purple)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>by a developer.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', fontSize: '1rem' }}>
              From learning resources to community — everything to level up your dev journey.
            </p>
          </div>
        </RevealOnScroll>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}>
          {features.map(({ href, icon: Icon, title, desc, gradient, border, accent }, i) => (
            <RevealOnScroll key={href} delay={i * 0.1} style={{ height: '100%' }}>
              <TiltCard style={{ height: '100%' }}>
                <Link href={href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="glass-card" style={{
                    padding: 28,
                    background: gradient,
                    borderColor: border,
                    height: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div style={{
                      width: 48, height: 48,
                      borderRadius: 14,
                      background: `${accent}22`,
                      border: `1px solid ${accent}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 20,
                    }}>
                      <Icon size={22} style={{ color: accent }} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 10, color: 'var(--text-primary)' }}>{title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</p>
                    
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      marginTop: 'auto', 
                      paddingTop: 24,
                      color: accent, fontSize: '0.85rem', fontWeight: 600,
                    }}>
                      Explore <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
