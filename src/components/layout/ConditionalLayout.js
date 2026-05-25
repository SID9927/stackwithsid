'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import PageWrapper from './PageWrapper'
import ScrollToTop from './ScrollToTop'

export default function ConditionalLayout({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const nav = window.navigator
      if (nav.modelContext) {
        try {
          const tools = [
            {
              name: 'search_articles',
              description: 'Search technical articles by query on StackWithSid',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'The search term or tag to search for' }
                },
                required: ['query']
              },
              execute: async ({ query }) => {
                try {
                  const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
                  return await res.json()
                } catch (err) {
                  return { error: err.message }
                }
              }
            }
          ]

          if (typeof nav.modelContext.provideContext === 'function') {
            nav.modelContext.provideContext({ tools })
            console.log('[StackWithSid] Registered WebMCP tools via provideContext')
          } else if (typeof nav.modelContext.registerTool === 'function') {
            nav.modelContext.registerTool(tools[0])
            console.log('[StackWithSid] Registered WebMCP tools via registerTool')
          }
        } catch (err) {
          console.warn('[StackWithSid] WebMCP registration failed:', err)
        }
      }
    }
  }, [])

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <PageWrapper>
        {children}
      </PageWrapper>
      <ScrollToTop />
      <Footer />
    </>
  )
}
