export async function GET() {
  const baseUrl = 'https://stack.dsiddharth.in'
  
  const metadata = {
    resource: `${baseUrl}/api`,
    authorization_servers: [baseUrl],
    scopes_supported: ['read', 'write']
  }

  return new Response(JSON.stringify(metadata), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
