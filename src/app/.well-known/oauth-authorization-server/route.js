export async function GET() {
  const baseUrl = 'https://stack.dsiddharth.in'
  
  const config = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/auth/authorize`,
    token_endpoint: `${baseUrl}/api/auth/token`,
    jwks_uri: `${baseUrl}/api/auth/jwks`,
    scopes_supported: ['openid', 'profile', 'email', 'read', 'write'],
    response_types_supported: ['code', 'token'],
    grant_types_supported: ['authorization_code', 'client_credentials', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic']
  }

  return new Response(JSON.stringify(config), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
