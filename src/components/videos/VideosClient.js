'use client'

import { motion } from 'framer-motion'
import { Play, Clock, ExternalLink } from 'lucide-react'
import RevealOnScroll from '@/components/animations/RevealOnScroll'
import TiltCard from '@/components/animations/TiltCard'
import { formatDate } from '@/lib/utils'

function VideoCard({ video, index }) {
  const isComingSoon = video.status === 'coming_soon'

  return (
    <RevealOnScroll delay={index * 0.07}>
      <TiltCard>
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Thumbnail */}
          <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
            {video.thumbnail_url ? (
              <img src={video.thumbnail_url} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'var(--gradient-purple)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Play size={40} color="white" style={{ opacity: 0.7 }} />
              </div>
            )}

            {/* Overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
            }} />

            {/* Coming soon badge */}
            {isComingSoon && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                padding: '4px 10px', borderRadius: 999,
                background: 'hsl(270,75%,55%,0.9)',
                backdropFilter: 'blur(8px)',
                color: 'white', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                animation: 'pulseGlow 2s ease-in-out infinite',
                boxShadow: '0 0 16px hsl(270,75%,55%,0.5)',
              }}>
                Coming Soon
              </div>
            )}

            {/* Play button hover */}
            {!isComingSoon && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}>
                  <Play size={22} color="white" fill="white" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, marginBottom: 10 }}>
              {video.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {isComingSoon && video.publish_date ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <Clock size={12} /> {formatDate(video.publish_date)}
                </span>
              ) : (
                <span />
              )}
              {!isComingSoon && video.youtube_url && (
                <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
                }}>
                  Watch <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </TiltCard>
    </RevealOnScroll>
  )
}

export default function VideosClient({ videos }) {
  const published  = videos.filter(v => v.status === 'published')
  const comingSoon = videos.filter(v => v.status === 'coming_soon')

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '60px 5%' }}>
      <RevealOnScroll>
        <span className="badge badge-purple" style={{ marginBottom: 12 }}>YouTube</span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 12 }}>
          Videos &{' '}
          <span style={{
            background: 'var(--gradient-purple)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>upcoming content</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 48 }}>
          Watch published videos and get notified about upcoming ones.
        </p>
      </RevealOnScroll>

      {comingSoon.length > 0 && (
        <section style={{ marginBottom: 64 }}>
          <RevealOnScroll>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                display: 'inline-block', boxShadow: '0 0 8px var(--accent)', animation: 'pulseGlow 2s infinite',
              }} />
              Coming Soon
            </h2>
          </RevealOnScroll>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {comingSoon.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}
          </div>
        </section>
      )}

      {published.length > 0 && (
        <section>
          <RevealOnScroll>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 24 }}>Published</h2>
          </RevealOnScroll>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {published.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}
          </div>
        </section>
      )}

      {videos.length === 0 && (
        <RevealOnScroll delay={0.2}>
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px',
            background: 'rgba(124, 58, 237, 0.03)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 32,
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              width: 54, height: 54, borderRadius: 16, 
              background: 'rgba(124, 58, 237, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, color: 'var(--accent)'
            }}>
              <Play size={24} fill="currentColor" />
            </div>
            <h2 style={{ 
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800,
              marginBottom: 12,
              color: 'var(--text-primary)'
            }}>
              Curating New Lessons
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, fontSize: '1.05rem', lineHeight: 1.6, margin: '0 auto' }}>
              I'm currently recording and editing deep-dive technical tutorials. High-quality content takes time to cook—stay tuned for the first drop!
            </p>
          </div>
        </RevealOnScroll>
      )}
    </div>
  )
}
