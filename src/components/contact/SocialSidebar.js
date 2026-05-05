'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SiYoutube, SiGithub } from 'react-icons/si'
import { IoChatbubbleEllipsesOutline, IoArrowForward, IoGlobeOutline, IoMailOutline } from 'react-icons/io5'
import RevealOnScroll from '@/components/animations/RevealOnScroll'
import TiltCard from '@/components/animations/TiltCard'

export default function SocialSidebar() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const socialLinks = [
    { name: 'YouTube', icon: SiYoutube, href: 'https://youtube.com/@stackwithsid', color: '#ff0000', handle: '@stackwithsid' },
    { name: 'Email', icon: IoMailOutline, href: 'mailto:hello@dsiddharth.in', color: '#ff7d00', handle: 'hello@dsiddharth.in' },
    { name: 'GitHub', icon: SiGithub, href: 'https://github.com/stackwithsid', color: '#333', handle: 'stackwithsid' },
    { name: 'Portfolio', icon: IoGlobeOutline, href: 'https://dsiddharth.in', color: '#7c3aed', handle: 'dsiddharth.in' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <RevealOnScroll delay={0.3}>
        <div style={{ padding: isMobile ? '0 5px' : '0 10px' }}>
          <h3 style={{ fontFamily: 'Syne', fontSize: isMobile ? '1.3rem' : '1.5rem', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IoChatbubbleEllipsesOutline color="white" size={20} />
            </div>
            Connect with me
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <motion.div 
                  whileHover={{ x: 10, background: 'rgba(255,255,255,0.05)', borderColor: social.color }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? 16 : 20, 
                    padding: isMobile ? '16px 20px' : '20px 24px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 24,
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ 
                    width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 12, 
                    background: `${social.color}15`, 
                    color: social.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 20px -5px ${social.color}33`
                  }}>
                    <social.icon size={isMobile ? 18 : 22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{social.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{social.handle}</div>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                  >
                    <IoArrowForward size={18} style={{ color: 'var(--accent)', transform: 'rotate(-45deg)' }} />
                  </motion.div>
                </motion.div>
              </a>
            ))}
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.4}>
        <TiltCard intensity={8}>
          <div style={{ 
            padding: 'clamp(24px, 5vw, 40px)', 
            borderRadius: 32, 
            background: 'var(--gradient-purple)', 
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.4)'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', marginBottom: 14, fontFamily: 'Syne' }}>Technical Support?</h3>
              <p style={{ fontSize: isMobile ? '0.9rem' : '1rem', opacity: 0.9, marginBottom: 32, lineHeight: 1.6 }}>
                Need help with a specific stack or coding problem? Our community discussion board is the best place to get expert eyes on your code.
              </p>
              <a href="/discuss" style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 10, 
                padding: '14px 28px', background: 'white', color: '#7c3aed', 
                borderRadius: 14, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }}>
                Open Discussions <IoArrowForward size={16} style={{ transform: 'rotate(-45deg)' }} />
              </a>
            </div>
            <IoChatbubbleEllipsesOutline size={isMobile ? 120 : 160} style={{ position: 'absolute', bottom: -40, right: -40, opacity: 0.15, transform: 'rotate(-15deg)' }} />
          </div>
        </TiltCard>
      </RevealOnScroll>
    </div>
  )
}
