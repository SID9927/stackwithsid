export async function GET() {
  const baseUrl = 'https://stack.dsiddharth.in'
  
  const config = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/auth/authorize`,
    token_endpoint: `${baseUrl}/api/auth/token`,
    jwks_uri: `${baseUrl}/api/auth/jwks`,
    userinfo_endpoint: `${baseUrl}/api/auth/userinfo`,
    scopes_supported: ['openid', 'profile', 'email'],
    response_types_supported: ['code', 'token', 'id_token'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    claims_supported: ['iss', 'sub', 'aud', 'exp', 'iat', 'name', 'email', 'picture']
  }

  return new Response(JSON.stringify(config), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
