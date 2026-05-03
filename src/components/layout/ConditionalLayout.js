'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import PageWrapper from './PageWrapper'

export default function ConditionalLayout({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <PageWrapper>
        {children}
      </PageWrapper>
      <Footer />
    </>
  )
}
