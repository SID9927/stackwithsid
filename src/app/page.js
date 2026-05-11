'use client'

import { useState, useEffect } from 'react'
import { FileText, Wrench, Zap, Users, BookOpen, MessageSquare, Star, Layers, Code2, Atom, Server, Triangle, Network, Palette, FileCode, Database, Box } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

// Sub-components
import Hero from '@/components/home/Hero'
import StatsRow from '@/components/home/StatsRow'
import Features from '@/components/home/Features'
import StackChips from '@/components/home/StackChips'
import CTABanner from '@/components/home/CTABanner'

// ── Data Constants ──────────────────────────────────────────────────
const STATS_INITIAL = [
  { label: 'Articles',   value: '50+',  icon: FileText },
  // { label: 'Dev Tools',  value: '30+',  icon: Wrench },
  { label: 'Q&As',       value: '200+', icon: Zap },
  // { label: 'Community',  value: '1K+',  icon: Users },
]

const FEATURES_DATA = [
  {
    href: '/articles',
    icon: BookOpen,
    title: 'Deep-Dive Articles',
    desc: 'In-depth technical content on modern web development, system design, and best practices.',
    gradient: 'linear-gradient(135deg, #7c3aed22, #a855f711)',
    border: '#7c3aed40',
    accent: '#a855f7',
  },
  {
    href: '/interview',
    icon: Zap,
    title: 'Interview Prep',
    desc: 'Curated Q&As for React, Node.js, DSA, System Design — filter by stack and difficulty.',
    gradient: 'linear-gradient(135deg, #9333ea22, #c084fc11)',
    border: '#9333ea40',
    accent: '#c084fc',
  },
  {
    href: '/tools',
    icon: Wrench,
    title: 'Developer Tools',
    desc: 'A handpicked directory of the best tools to boost your productivity and workflow.',
    gradient: 'linear-gradient(135deg, #6b21a822, #a855f711)',
    border: '#6b21a840',
    accent: '#a855f7',
  },
  {
    href: '/discuss',
    icon: MessageSquare,
    title: 'Open Discussions',
    desc: 'Ask questions, share ideas, and connect with fellow developers in the community.',
    gradient: 'linear-gradient(135deg, #7c3aed22, #9333ea11)',
    border: '#7c3aed40',
    accent: '#9333ea',
  },
]

const STACKS_DATA = [
  { name: 'React', icon: Atom },
  { name: 'Node.js', icon: Server },
  { name: 'Next.js', icon: Triangle },
  { name: 'DSA', icon: Code2 },
  { name: 'System Design', icon: Network },
  { name: 'CSS', icon: Palette },
  { name: 'TypeScript', icon: FileCode },
  { name: 'MongoDB', icon: Database },
  { name: 'SQL', icon: Database },
  { name: 'Docker', icon: Box },
]

export default function HomePage() {
  const [stats, setStats] = useState(STATS_INITIAL)
  const [stacks, setStacks] = useState(STACKS_DATA)

  useEffect(() => {
    async function fetchData() {
      const sb = getSupabase()
      if (!sb) return

      try {
        // Fetch Stats
        const [
          { count: articlesCount },
          { count: toolsCount },
          { count: interviewCount },
          { data: dbStacks }
        ] = await Promise.all([
          sb.from('articles').select('*', { count: 'exact', head: true }),
          sb.from('tools').select('*', { count: 'exact', head: true }),
          sb.from('interview_questions').select('*', { count: 'exact', head: true }),
          sb.from('tech_stacks').select('name').order('name')
        ])

        setStats([
          { label: 'Articles',   value: articlesCount ? `${articlesCount}+` : '10+',  icon: FileText },
          { label: 'Q&As',       value: interviewCount ? `${interviewCount}+` : '50+', icon: Zap },
        ])

        // If we have stacks in DB, use them (mapping icons if possible)
        if (dbStacks && dbStacks.length > 0) {
          const iconMap = {
            'React': Atom, 'Node.js': Server, 'Next.js': Triangle, 'DSA': Code2,
            'System Design': Network, 'CSS': Palette, 'TypeScript': FileCode,
            'MongoDB': Database, 'SQL': Database, 'Docker': Box
          }
          const dynamicStacks = dbStacks.map(s => ({
            name: s.name,
            icon: iconMap[s.name] || Layers // Default icon for unknown stacks
          }))
          setStacks(dynamicStacks)
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err)
      }
    }
    fetchData()
  }, [])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* ── HERO & STATS ────────────────────────────────────────── */}
      <Hero>
        <StatsRow stats={stats} />
      </Hero>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <Features features={FEATURES_DATA} />

      {/* ── STACK CHIPS ──────────────────────────────────────────── */}
      <StackChips stacks={stacks} />

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <CTABanner />
    </div>
  )
}
