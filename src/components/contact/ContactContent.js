'use client'

import { useState, useRef, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import ContactHeader from './ContactHeader'
import ContactForm from './ContactForm'
import SocialSidebar from './SocialSidebar'

export default function ContactContent() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [errors, setErrors] = useState({})
  const formRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setErrors({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const validate = () => {
    let newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message cannot be empty'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const supabase = getSupabase()
      
      const promises = []
      
      // 1. Add DB insertion if Supabase is configured
      if (supabase) {
        const dbPromise = (async () => {
          try {
            return await supabase.from('contact_messages').insert([
              { 
                name: formData.name, 
                email: formData.email, 
                subject: formData.subject, 
                message: formData.message,
                created_at: new Date().toISOString()
              }
            ])
          } catch (err) {
            return { error: err }
          }
        })()
        promises.push(dbPromise)
      } else {
        promises.push(Promise.resolve({ error: null })) 
      }

      // 2. Add Email API call
      promises.push(
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }).catch(err => {
          // If the fetch itself fails (network error)
          return { ok: false, json: () => Promise.resolve({ message: err.message }) }
        })
      )

      const [dbResult, emailResult] = await Promise.all(promises)

      // Log DB error but don't stop the success flow
      if (dbResult && dbResult.error) {
        console.warn('Database Backup Failed (Optional):', dbResult.error)
      }

      if (!emailResult.ok) {
        const errData = await emailResult.json().catch(() => ({}))
        throw new Error(errData.message || 'Email delivery failed. Please check your SMTP settings.')
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err) {
      console.error('Full Contact Error:', err)
      setStatus('error')
      
      // Handle both string errors and Supabase error objects
      const finalMessage = err.message || (typeof err === 'string' ? err : 'Failed to send message. Please check your connection or try again later.')
      setErrorMessage(finalMessage)
      
      console.log('Error Details:', {
        name: err.name,
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code
      })
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null })
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 100, position: 'relative', overflow: 'hidden' }}>
      {/* ── BACKGROUND AMBIANCE ────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ 
          position: 'absolute', top: '-10%', left: '10%', width: '600px', height: '600px', 
          background: 'radial-gradient(circle, hsla(270,75%,55%,0.12) 0%, transparent 70%)', 
          borderRadius: '50%', filter: 'blur(100px)' 
        }} />
        <div style={{ 
          position: 'absolute', bottom: '0%', right: '0%', width: '500px', height: '500px', 
          background: 'radial-gradient(circle, hsla(300,75%,55%,0.08) 0%, transparent 70%)', 
          borderRadius: '50%', filter: 'blur(100px)' 
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <ContactHeader />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', 
          gap: 60,
          alignItems: 'start'
        }}>
          <ContactForm 
            formRef={formRef}
            formData={formData}
            status={status}
            errors={errors}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
          />

          <SocialSidebar />
        </div>
      </div>
    </div>
  )
}
