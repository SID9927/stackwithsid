'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function FormHeader({ backLink, backText, title }) {
  return (
    <header className="form-header">
      <div className="header-main">
        <Link href={backLink} className="back-link">
          <ChevronLeft size={18} /> {backText}
        </Link>
        <h1>{title}</h1>
        <div className="header-placeholder" style={{ width: 100 }}></div>
      </div>
      <style jsx>{`
        .form-header { margin-bottom: 32px; }
        .header-main { display: flex; justify-content: space-between; align-items: center; }
        .back-link { display: flex; align-items: center; gap: 8px; color: var(--text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: color 0.2s; }
        .back-link:hover { color: var(--accent); }
        .form-header h1 { font-family: Syne, sans-serif; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; }

        @media (max-width: 1024px) {
          .form-header { margin-bottom: 24px; padding: 0 16px; }
          .header-main { flex-direction: column; align-items: flex-start; gap: 12px; }
          .header-placeholder { display: none; }
          .form-header h1 { font-size: 1.6rem !important; margin-top: 8px; }
        }
      `}</style>
    </header>
  )
}
