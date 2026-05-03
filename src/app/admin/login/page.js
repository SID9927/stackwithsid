'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [view, setView] = useState('login') // 'login' | 'forgot_password'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/interviews') // Redirect on success
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccessMsg('Password reset instructions sent to your email.')
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      {/* Background Effects */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="login-content">
        <motion.div 
          className="brand-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="brand-logo">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h1>Workspace Access</h1>
          <p>Secure administrative portal</p>
        </motion.div>

        <div className="glass-card auth-card">
          <AnimatePresence mode="wait">
            {view === 'login' ? (
              <motion.form 
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="auth-form"
              >
                <h2>Sign In</h2>
                
                {error && (
                  <div className="auth-alert error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@stackwithsid.com"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="flex justify-between items-center w-full">
                    <label>Password</label>
                    <button 
                      type="button" 
                      onClick={() => { setView('forgot_password'); setError(null); }}
                      className="text-link"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-btn mt-4">
                  {loading ? 'Authenticating...' : 'Secure Login'} 
                  {!loading && <ArrowRight size={18} />}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="forgot_password"
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="auth-form"
              >
                <button 
                  type="button" 
                  className="back-btn mb-6"
                  onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                >
                  <ArrowLeft size={16} /> Back to login
                </button>

                <h2>Reset Password</h2>
                <p className="subtitle">Enter your email and we'll send you a link to reset your password.</p>
                
                {error && (
                  <div className="auth-alert error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="auth-alert success">
                    <ShieldCheck size={16} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@stackwithsid.com"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-btn mt-4">
                  {loading ? 'Sending link...' : 'Send Reset Link'} 
                  {!loading && <Mail size={18} />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        /* Orbs for background effect */
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          z-index: 0;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(124, 58, 237, 0.3); /* Accent color */
          top: -100px;
          left: -100px;
          animation: float 10s infinite alternate ease-in-out;
        }
        .orb-2 {
          width: 500px;
          height: 500px;
          background: rgba(255, 125, 0, 0.15); /* Orange hint */
          bottom: -150px;
          right: -100px;
          animation: float 15s infinite alternate-reverse ease-in-out;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 50px) scale(1.1); }
        }

        .login-content {
          width: 100%;
          max-width: 440px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .brand-section {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 64px;
          height: 64px;
          background: var(--gradient-purple);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 10px 30px rgba(124, 58, 237, 0.4);
        }

        .brand-section h1 {
          font-family: Syne, sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .brand-section p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin: 0;
        }

        .auth-card {
          padding: 40px;
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          border-radius: 24px;
          overflow: hidden;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-form h2 {
          font-family: Syne, sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .text-link {
          background: none;
          border: none;
          color: var(--accent-soft);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }
        .text-link:hover {
          color: var(--accent);
          text-decoration: underline;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
        }

        .input-wrapper input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 14px 16px 14px 44px;
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all 0.2s;
          outline: none;
        }
        .input-wrapper input:focus {
          border-color: var(--accent);
          background: rgba(124, 58, 237, 0.05);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }
        .input-wrapper input::placeholder {
          color: var(--border-mid);
        }

        .submit-btn {
          width: 100%;
          height: 50px;
          background: var(--gradient-purple);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(124, 58, 237, 0.4);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          transition: color 0.2s;
          align-self: flex-start;
        }
        .back-btn:hover {
          color: var(--text-primary);
        }

        .auth-alert {
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.85rem;
          line-height: 1.4;
          font-weight: 500;
        }
        .auth-alert.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        .auth-alert.success {
          background: rgba(0, 255, 170, 0.1);
          border: 1px solid rgba(0, 255, 170, 0.2);
          color: #00ffaa;
        }

        /* Utilities */
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .w-full { width: 100%; }
        .mt-4 { margin-top: 16px; }
        .mb-6 { margin-bottom: 24px; }
        
        @media (max-width: 640px) {
          .auth-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  )
}
