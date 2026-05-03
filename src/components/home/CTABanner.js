'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import RevealOnScroll from '@/components/animations/RevealOnScroll'
import TiltCard from '@/components/animations/TiltCard'

export default function CTABanner() {
  return (
    <section style={{ padding: '0 5% 100px' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <RevealOnScroll>
          <TiltCard intensity={6}>
            <div style={{
              padding: 'clamp(40px, 6vw, 72px)',
              borderRadius: 24,
              background: 'var(--gradient-purple)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -60, right: -60,
                width: 200, height: 200, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
              }} />
              <div style={{
                position: 'absolute', bottom: -40, left: -40,
                width: 160, height: 160, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }} />
              <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: 14, position: 'relative' }}>
                Join the StackWithSid community
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: '1rem', position: 'relative' }}>
                Get access to discussions, like articles, and connect with fellow developers.
              </p>
              <Link href="/login" style={{ position: 'relative', display: 'inline-block' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '14px 36px',
                    borderRadius: 12,
                    background: '#fff',
                    color: '#7c3aed',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  }}
                >
                  Get Started Free <ArrowRight size={16} />
                </motion.div>
              </Link>
            </div>
          </TiltCard>
        </RevealOnScroll>
      </div>
    </section>
  )
}
