import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeProvider'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import { Suspense } from 'react'
import AnalyticsTracker from '@/components/common/AnalyticsTracker'

const syne = Syne({
  subsets:  ['latin'],
  variable: '--font-syne',
  display:  'swap',
  weight:   ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm',
  display:  'swap',
  weight:   ['300', '400', '500', '600'],
  style:    ['normal', 'italic'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-mono',
  display:  'swap',
  weight:   ['400', '500'],
})

export const metadata = {
  metadataBase: new URL('https://stack.dsiddharth.in'),
  title: {
    default:  'StackWithSid — Dev Articles, Interview Prep & Community',
    template: '%s | StackWithSid',
  },
  description:
    'A modern tech platform for developers. Deep-dive articles, curated interview Q&As, developer tools, and open community discussions. By Sid.',
  keywords: ['web development', 'programming', 'javascript', 'react', 'interview prep', 'dev tools', 'tech community'],
  authors:   [{ name: 'Sid', url: 'https://stack.dsiddharth.in' }],
  creator:   'StackWithSid',
  openGraph: {
    type:     'website',
    locale:   'en_US',
    url:      'https://stack.dsiddharth.in',
    siteName: 'StackWithSid',
    title:    'StackWithSid — Dev Articles, Interview Prep & Community',
    description:
      'A modern tech platform for developers. Deep-dive articles, curated interview Q&As, developer tools, and open community discussions.',
    images: [{
      url:    '/og-default.png',
      width:  1200,
      height: 630,
      alt:    'StackWithSid',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    site:        '@stackwithsid',
    creator:     '@stackwithsid',
    title:       'StackWithSid — Dev Platform',
    description: 'A modern tech platform for developers. By Sid.',
    images:      ['/og-default.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="noise" suppressHydrationWarning>
        <ThemeProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
