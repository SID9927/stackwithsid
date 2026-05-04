'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layers, LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [mode, setMode]         = useState('login') // 'login' | 'signup'
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/')
      }
    })
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fn = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })

    const { data, error: authError } = await fn

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/')
    } else {
      setLoading(false)
      if (mode === 'signup') {
        setError('Verification email sent! Please check your inbox.')
      }
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/` },
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(270,80%,40%,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '20%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(300,70%,45%,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out 2s infinite',
        }} />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: 'clamp(32px, 5vw, 48px)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--gradient-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 20px hsl(270,75%,55%,0.4)',
          }}>
            <Layers size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {mode === 'login' ? 'Sign in to your StackWithSid account' : 'Join the StackWithSid community'}
          </p>
        </div>

        {/* Google OAuth */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGoogle}
          style={{
            width: '100%', padding: '12px 20px', minHeight: 44,
            borderRadius: 12, border: '1px solid var(--border-mid)',
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem',
            marginBottom: 20, transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
        >
          {/* Google SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '12px 16px 12px 42px', minHeight: 44,
                  borderRadius: 12, background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-mid)', color: 'var(--text-primary)',
                  fontSize: '0.9rem', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 44px 12px 42px', minHeight: 44,
                  borderRadius: 12, background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-mid)', color: 'var(--text-primary)',
                  fontSize: '0.9rem', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                color: '#ef4444', fontSize: '0.8rem',
                padding: '10px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={15} />}
          </motion.button>
        </form>

        {/* Toggle mode */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
