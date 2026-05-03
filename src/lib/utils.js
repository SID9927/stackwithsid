import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function timeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function readingTime(content = '') {
  const words = content.trim().split(/\s+/).length
  const mins  = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export function truncate(text = '', length = 120) {
  if (text.length <= length) return text
  return text.slice(0, length).replace(/\s+\S*$/, '') + '...'
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
