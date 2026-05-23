'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastLoggedPath = useRef('')

  useEffect(() => {
    if (!pathname) return
    
    // Ignore local development hosts to avoid polluting the database with dev traffic
    if (typeof window !== 'undefined') {
      const hn = window.location.hostname
      if (
        hn === 'localhost' || 
        hn === '127.0.0.1' || 
        hn.startsWith('192.168.') || 
        hn.startsWith('10.') || 
        hn.startsWith('172.') || 
        hn.endsWith('.local')
      ) {
        return
      }
    }

    // Ignore admin and API pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    // Avoid logging duplicate hits for the exact same path and query on hot-reloads
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    if (lastLoggedPath.current === fullPath) return
    lastLoggedPath.current = fullPath

    const getDeviceType = () => {
      const ua = navigator.userAgent
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet'
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accordion|Opera Mini/i.test(ua)) return 'Mobile'
      return 'Desktop'
    }

    const getBrowser = () => {
      const ua = navigator.userAgent
      if (ua.includes('Firefox')) return 'Firefox'
      if (ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('Edg')) return 'Chrome'
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
      if (ua.includes('Edg')) return 'Edge'
      return 'Other'
    }

    const getVisitorHash = () => {
      const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const lang = navigator.language || 'en'
      const ua = navigator.userAgent
      const raw = `${ua}|${screenInfo}|${tz}|${lang}`
      
      // Stable FNV-1a hash algorithm
      let hash = 2166136261
      for (let i = 0; i < raw.length; i++) {
        hash ^= raw.charCodeAt(i)
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
      }
      return (hash >>> 0).toString(16)
    }

    const getGeoLocation = async () => {
      const cached = sessionStorage.getItem('geo_location')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed && parsed.country && parsed.country !== 'Unknown') {
            return parsed
          }
        } catch (e) {}
      }

      // Try free.freeipapi.com first
      try {
        const res = await fetch('https://free.freeipapi.com/api/json')
        if (res.ok) {
          const data = await res.json()
          if (data && (data.countryName || data.cityName)) {
            const country = data.countryName && data.countryName !== '-' ? data.countryName : 'Unknown'
            const city = data.cityName && data.cityName !== '-' ? data.cityName : 'Unknown'
            if (country !== 'Unknown') {
              const geo = { country, city }
              sessionStorage.setItem('geo_location', JSON.stringify(geo))
              return geo
            }
          }
        }
      } catch (e) {
        console.warn('Failed freeipapi lookup:', e)
      }

      // Try ipapi.co fallback (supports CORS)
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error && (data.country_name || data.city)) {
            const country = data.country_name || 'Unknown'
            const city = data.city || 'Unknown'
            const geo = { country, city }
            sessionStorage.setItem('geo_location', JSON.stringify(geo))
            return geo
          }
        }
      } catch (e) {
        console.warn('Failed ipapi.co lookup:', e)
      }

      // Fallback: Guess country from timezone (useful for localhost development / offline / adblockers)
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (tz) {
          if (tz.includes('Kolkata') || tz.includes('Calcutta')) {
            return { country: 'India', city: 'Local Dev' }
          }
          if (tz.includes('America/')) {
            return { country: 'United States', city: 'Local Dev' }
          }
          if (tz.includes('Europe/')) {
            return { country: 'Europe', city: 'Local Dev' }
          }
        }
      } catch (e) {}

      return { country: 'Unknown', city: 'Unknown' }
    }

    const getReferrer = () => {
      const ref = document.referrer
      if (!ref) return 'Direct'
      try {
        const url = new URL(ref)
        if (url.hostname === window.location.hostname) return 'Internal'
        return url.hostname
      } catch (e) {
        return ref
      }
    }

    const logPageView = async () => {
      const device = getDeviceType()
      const browser = getBrowser()
      const visitorHash = getVisitorHash()
      const referrer = getReferrer()
      const geo = await getGeoLocation()

      // Insert tracking row
      await supabase
        .from('page_views')
        .insert([{
          page_url: pathname,
          referrer,
          device_type: device,
          browser,
          country: geo.country,
          city: geo.city,
          visitor_hash: visitorHash
        }])
    }

    // Delay logging slightly to allow complete loading and avoid blocking initial paint
    const timer = setTimeout(logPageView, 800)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return null
}
