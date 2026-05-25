export async function GET() {
  const baseUrl = 'https://stack.dsiddharth.in'
  
  const catalog = {
    linkset: [
      {
        anchor: `${baseUrl}/api`,
        'service-desc': [
          {
            href: `${baseUrl}/api/openapi.json`,
            type: 'application/openapi+json'
          }
        ],
        'service-doc': [
          {
            href: `${baseUrl}/docs`,
            type: 'text/html'
          }
        ],
        status: [
          {
            href: `${baseUrl}/api/health`,
            type: 'application/json'
          }
        ]
      }
    ]
  }

  return new Response(JSON.stringify(catalog), {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
