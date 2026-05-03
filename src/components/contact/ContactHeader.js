'use client'

import { motion } from 'framer-motion'
import RevealOnScroll from '@/components/animations/RevealOnScroll'

export default function ContactHeader() {
  return (
    <RevealOnScroll>
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="badge badge-purple" 
          style={{ marginBottom: 20 }}
        >
          Get in Touch
        </motion.span>
        <h1 style={{ 
          fontFamily: 'Syne, sans-serif', 
          fontSize: 'clamp(2.2rem, 10vw, 4.5rem)', 
          fontWeight: 800, 
          lineHeight: 1.2,
          marginBottom: 24,
          letterSpacing: '-0.03em',
          overflow: 'visible'
        }}>
          Let's build <br />
          <span style={{ 
            background: 'var(--gradient-purple)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            backgroundClip: 'text',
            filter: 'drop-shadow(0 10px 20px rgba(124, 58, 237, 0.2))',
            paddingBottom: '0.15em',
            display: 'inline',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere'
          }}>something great.</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: 650, margin: '0 auto', lineHeight: 1.6 }}>
          Whether you have a specific project in mind or just want to chat about tech, I'm all ears.
        </p>
      </div>
    </RevealOnScroll>
  )
}
