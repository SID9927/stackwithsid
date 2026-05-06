'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop
      if (scrolled > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    toggleVisibility()
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ 
            scale: 1.1, 
            y: -5,
            boxShadow: '0 0 25px hsl(270, 75%, 60%, 0.4)'
          }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          // Optimized Tailwind v4 syntax (no more squiggles!)
          className="fixed bottom-[70px] md:bottom-[60px] right-[20px] md:right-[32px] z-9999 
                     w-[42px] h-[42px] md:w-[48px] md:h-[48px] 
                     rounded-[14px] md:rounded-[16px]
                     bg-(--bg-card)/30 border border-(--border-subtle) 
                     text-(--accent) flex items-center justify-center 
                     cursor-pointer shadow-[0_10px_25px_rgba(0,0,0,0.3)]
                     backdrop-blur-[10px] transition-all duration-300
                     opacity-60 hover:opacity-100 hover:border-(--accent)"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} strokeWidth={3} className="drop-shadow-sm" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
