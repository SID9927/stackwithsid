'use client'

import ArticleDetailLayout from '@/components/articles/ArticleDetailLayout'
import { ShieldCheck, Zap, Globe, CheckCircle2 } from 'lucide-react'

export default function CloudflareGuidePage() {
  const articleData = {
    title: "What is Cloudflare? A Simple Guide for Developers",
    tags: ["Network", "Security"],
    publishDate: "Oct 24, 2024",
    readTime: "6 min read",
    stats: { likes: 42, dislikes: 2, comments: 12 }
  }

  return (
    <ArticleDetailLayout {...articleData}>
      <p style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '40px', fontWeight: 500, lineHeight: 1.6 }}>
        In the modern web, speed and security are no longer optional—they are expected. Cloudflare has become the silent backbone of the internet, powering millions of websites.
      </p>

      <h2 style={{ marginTop: '40px' }}>The Basics: What exactly is Cloudflare?</h2>
      <p>
        At its core, Cloudflare is a global network designed to make everything you connect to the Internet secure, private, fast, and reliable. It acts as a <strong>Reverse Proxy</strong>, sitting between your website visitors and your actual web server.
      </p>

      <div style={{ 
        margin: '48px 0', padding: '32px', borderRadius: '20px', 
        background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)'
      }}>
        <h3 style={{ color: 'var(--accent-soft)', fontSize: '1.15rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <ShieldCheck size={22} /> Core Benefits
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle2 size={18} color="#00ffaa" /> DDoS Protection</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle2 size={18} color="#00ffaa" /> Global CDN</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle2 size={18} color="#00ffaa" /> Fast DNS Resolution</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle2 size={18} color="#00ffaa" /> Free SSL/TLS</li>
        </ul>
      </div>

      <h2>How It Works: The Edge Network</h2>
      <p>
        Cloudflare operates a massive network of data centers in over 200 cities worldwide. When you enable Cloudflare for your site, your traffic is routed through their nearest data center. This "edge" processing reduces latency dramatically.
      </p>

      <blockquote>
        "By moving the logic closer to the user, we eliminate the physical distance that traffic must travel, making the internet feel instantaneous."
      </blockquote>

      <h2>Key Features for Developers</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', margin: '48px 0' }}>
        <div style={{ padding: '32px', borderRadius: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)' }}>
          <Zap size={28} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '1.2rem' }}>Workers</h4>
          <p style={{ fontSize: '0.95rem', margin: 0, opacity: 0.8 }}>Run serverless code at the edge without managing servers.</p>
        </div>
        <div style={{ padding: '32px', borderRadius: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)' }}>
          <Globe size={28} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '1.2rem' }}>Pages</h4>
          <p style={{ fontSize: '0.95rem', margin: 0, opacity: 0.8 }}>Fastest way to deploy frontend applications globally.</p>
        </div>
      </div>

      <h2>Conclusion</h2>
      <p>
        Whether you're a hobbyist with a personal blog or a company with millions of users, Cloudflare provides the tools to ensure your corner of the web is fast and protected. Best of all, most of these core features are available on their generous free tier.
      </p>
    </ArticleDetailLayout>
  )
}
