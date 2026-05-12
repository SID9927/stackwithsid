'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import { FaTwitter, FaLinkedin, FaWhatsapp, FaTelegramPlane, FaInstagram } from 'react-icons/fa'

export default function ShareModal({ 
  isOpen, 
  onClose, 
  title, 
  url, 
  type = 'Article' 
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy!', err)
    }
  }

  // Define professional messages based on type
  const getShareText = () => {
    if (type.toLowerCase().includes('interview') || type.toLowerCase().includes('question')) {
      return {
        whatsapp: `Check out this Interview Question:\n*${title}*\n\nRead the simplified explanation on StackWithSid:\n${url}`,
        twitter: `Check out this Interview Question: ${title}`,
        generic: `Check out this Interview Question: ${title}\n\nLearn more on StackWithSid:\n`
      }
    }
    return {
      whatsapp: `Check out this Article:\n*${title}*\n\nRead more on StackWithSid:\n${url}`,
      twitter: `Check out this Article: ${title}`,
      generic: `Read this Article: ${title}\n\nExplore more on StackWithSid:\n`
    }
  }

  const messages = getShareText()

  const socialLinks = [
    { 
      name: 'WhatsApp', 
      icon: <FaWhatsapp size={20} />, 
      color: '#25D366', 
      url: `https://wa.me/?text=${encodeURIComponent(messages.whatsapp)}` 
    },
    { 
      name: 'X', 
      icon: <FaTwitter size={20} />, 
      color: '#000000', 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}&url=${encodeURIComponent(url)}` 
    },
    { 
      name: 'LinkedIn', 
      icon: <FaLinkedin size={20} />, 
      color: '#0077b5', 
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` 
    },
    {
      name: 'Telegram',
      icon: <FaTelegramPlane size={20} />,
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(messages.generic)}`
    },
    {
      name: 'Instagram',
      icon: <FaInstagram size={20} />,
      color: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
      url: `https://www.instagram.com/`
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="share-modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="share-modal"
          >
            <div className="modal-header">
              <h3>Share {type}</h3>
              <button onClick={onClose} aria-label="Close modal"><X size={20} /></button>
            </div>
            
            <div className="social-grid">
              {socialLinks.map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="social-item">
                  <div className="icon-wrapper" style={{ background: link.color }}>{link.icon}</div>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>

            <div className="copy-section">
              <p>{type} Link</p>
              <div className="copy-box">
                <input type="text" readOnly value={url} />
                <button onClick={copyToClipboard} className={copied ? 'copied' : ''}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </motion.div>

          <style jsx>{`
            .share-modal-overlay {
              position: fixed; inset: 0; background: rgba(0,0,0,0.6); 
              backdrop-filter: blur(8px); z-index: 10000; 
              display: flex; align-items: center; justify-content: center; padding: 20px;
            }
            .share-modal {
              background: var(--bg-card); border: 1px solid var(--border-subtle); 
              border-radius: 32px; width: 100%; max-width: 400px; padding: 32px;
              box-shadow: 0 20px 80px rgba(0,0,0,0.3);
            }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
            .modal-header h3 { font-family: Syne, sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin: 0; }
            .modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: color 0.2s; }
            .modal-header button:hover { color: var(--text-primary); }
            
            .social-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 16px; margin-bottom: 40px; }
            .social-item { display: flex; flex-direction: column; align-items: center; gap: 10px; text-decoration: none; }
            .icon-wrapper { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: white; transition: transform 0.2s; }
            .social-item:hover .icon-wrapper { transform: translateY(-5px); }
            .social-item span { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
            
            .copy-section p { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
            .copy-box { display: flex; gap: 10px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 6px 6px 6px 16px; align-items: center; width: 100%; }
            .copy-box input { background: none; border: none; color: var(--text-primary); font-size: 0.85rem; width: 100%; outline: none; }
            .copy-box button { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; padding: 8px; border-radius: 8px; }
            .copy-box button:hover { color: var(--accent); background: rgba(124, 58, 237, 0.1); }
            .copy-box button.copied { color: #22c55e; }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  )
}
