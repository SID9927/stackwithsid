'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Type, MessageSquare, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import RevealOnScroll from '@/components/animations/RevealOnScroll'

export default function ContactForm({ 
  formRef, 
  formData, 
  status, 
  errors, 
  handleSubmit, 
  handleChange 
}) {
  return (
    <RevealOnScroll delay={0.2}>
      <div className="premium-contact-container" ref={formRef} style={{ width: '100%' }}>
        <div className="glass-card" style={{ 
          padding: 'clamp(20px, 5vw, 60px)', 
          borderRadius: 32,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(24px)', 
        }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* FULL NAME */}
            <div className="premium-input-group">
              <label className="premium-label">
                <User size={14} /> Full Name
              </label>
              <div className="input-wrapper">
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="What should I call you?"
                  className={`premium-input ${errors.name ? 'error' : ''}`}
                  style={{ paddingRight: errors.name ? 50 : 20 }}
                />
                {errors.name && (
                  <div className="error-icon">
                    <AlertCircle size={18} />
                  </div>
                )}
                {errors.name && (
                  <motion.span 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    style={{ 
                      position: 'absolute', bottom: -22, right: 4, 
                      color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, 
                      fontStyle: 'italic', textAlign: 'right' 
                    }}
                  >
                    {errors.name}
                  </motion.span>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className="premium-input-group">
              <label className="premium-label">
                <Mail size={14} /> Email
              </label>
              <div className="input-wrapper">
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="Where can I reach you?"
                  className={`premium-input ${errors.email ? 'error' : ''}`}
                  style={{ paddingRight: errors.email ? 50 : 20 }}
                />
                {errors.email && (
                  <div className="error-icon">
                    <AlertCircle size={18} />
                  </div>
                )}
                {errors.email && (
                  <motion.span 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    style={{ 
                      position: 'absolute', bottom: -22, right: 4, 
                      color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, 
                      fontStyle: 'italic', textAlign: 'right' 
                    }}
                  >
                    {errors.email}
                  </motion.span>
                )}
              </div>
            </div>

            {/* SUBJECT */}
            <div className="premium-input-group">
              <label className="premium-label">
                <Type size={14} /> Subject
              </label>
              <div className="input-wrapper">
                <input 
                  type="text" name="subject" value={formData.subject} onChange={handleChange}
                  placeholder="What's this about?"
                  className={`premium-input ${errors.subject ? 'error' : ''}`}
                  style={{ paddingRight: errors.subject ? 50 : 20 }}
                />
                {errors.subject && (
                  <div className="error-icon">
                    <AlertCircle size={18} />
                  </div>
                )}
                {errors.subject && (
                  <motion.span 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    style={{ 
                      position: 'absolute', bottom: -22, right: 4, 
                      color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, 
                      fontStyle: 'italic', textAlign: 'right' 
                    }}
                  >
                    {errors.subject}
                  </motion.span>
                )}
              </div>
            </div>

            {/* MESSAGE */}
            <div className="premium-input-group">
              <label className="premium-label">
                <MessageSquare size={14} /> Message
              </label>
              <div className="input-wrapper">
                <textarea 
                  name="message" value={formData.message} onChange={handleChange}
                  placeholder="Tell me all about it..."
                  rows={6}
                  className={`premium-input premium-textarea ${errors.message ? 'error' : ''}`}
                  style={{ paddingRight: errors.message ? 50 : 20 }}
                />
                {errors.message && (
                  <div className="error-icon" style={{ top: 20 }}>
                    <AlertCircle size={18} />
                  </div>
                )}
                {errors.message && (
                  <motion.span 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    style={{ 
                      position: 'absolute', bottom: -22, right: 4, 
                      color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, 
                      fontStyle: 'italic', textAlign: 'right' 
                    }}
                  >
                    {errors.message}
                  </motion.span>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px hsla(270,75%,55%,0.6)' }}
              whileTap={{ scale: 0.98 }}
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '20px 0',
                borderRadius: 20,
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: '1.15rem',
                fontFamily: 'Syne, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
                boxShadow: '0 10px 25px -5px hsla(270,75%,55%,0.5)',
                letterSpacing: '0.02em',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                lineHeight: 'normal',
                overflow: 'visible',
              }}
            >
              <AnimatePresence mode="wait">
                {status === 'loading' ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'visible' }}>
                    <Loader2 size={20} className="animate-spin" /> Sending...
                  </motion.div>
                ) : status === 'success' ? (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'visible', paddingBottom: 5 }}>
                    <CheckCircle size={20} /> Sent Successfully
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'visible', paddingBottom: 8 }}>
                    Send Message <Send size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>

        <style jsx>{`
          .premium-input-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .premium-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding-left: 4px;
          }
          .input-wrapper {
            position: relative;
            width: 100%;
          }
          .premium-input {
            width: 100%;
            padding: 16px 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-subtle);
            border-radius: 16px;
            color: var(--text-primary);
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            outline: none;
          }
          .premium-input::placeholder {
            color: var(--text-muted);
            opacity: 0.6;
          }
          .premium-input:focus {
            background: var(--bg-card);
            border-color: var(--accent);
            box-shadow: 0 0 0 4px hsla(270,75%,55%,0.15);
            transform: translateY(-2px);
          }
          .premium-input.error {
            border-color: #ef4444;
            background: hsla(0, 100%, 50%, 0.02);
          }
          .error-icon {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #ef4444;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
          }
          .premium-textarea {
            resize: none;
            line-height: 1.6;
            min-height: 160px;
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </RevealOnScroll>
  )
}
