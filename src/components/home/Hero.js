'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'

const InteractiveSwarm = dynamic(() => import('@/components/animations/InteractiveSwarm'), { ssr: false })

export default function Hero({ children }) {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      textAlign: 'center',
      padding: '80px 24px 60px',
      width: '100%',
    }}>
      {/* Particle 3D background */}
      <InteractiveSwarm count={20000} />

      {/* Mesh gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '10%', left: '15%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: 0.15,
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: '10%', right: '10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: 0.12,
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

      {/* Hero content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '0 auto', width: '90%' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}
        >
          <span className="badge badge-purple">
            <Star size={10} fill="currentColor" />
            Premium Dev Content Platform
          </span>
        </motion.div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
          lineHeight: 1.1,
          marginBottom: 24,
          letterSpacing: '-0.02em',
        }}>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'block' }}
          >
            Learn. Build.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'block',
              background: 'var(--gradient-purple)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Stack with Sid.
          </motion.span>
        </h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: 580,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}
        >
          Deep-dive articles, interview prep, curated dev tools, and an open developer community — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/articles">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary" style={{ fontSize: '0.95rem', padding: '14px 32px' }}>
              Explore Articles <ArrowRight size={16} />
            </motion.div>
          </Link>
          <Link href="/interview">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-ghost" style={{ fontSize: '0.95rem', padding: '13px 28px' }}>
              Interview Prep
            </motion.div>
          </Link>
        </motion.div>

        {/* Children (e.g. Stats) */}
        {children}
      </div>
    </section>
  )
}
