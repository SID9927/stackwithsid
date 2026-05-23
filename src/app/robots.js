export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/api/', '/login/'],
    },
    sitemap: 'https://stack.dsiddharth.in/sitemap.xml',
  }
}
