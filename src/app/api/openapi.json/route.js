export async function GET() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'StackWithSid API',
      version: '1.0.0',
      description: 'API endpoints for StackWithSid development platform'
    },
    paths: {
      '/api/contact': {
        post: {
          summary: 'Submit contact message',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    message: { type: 'string' }
                  },
                  required: ['name', 'email', 'message']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Message sent successfully'
            }
          }
        }
      }
    }
  }

  return new Response(JSON.stringify(spec), {
    status: 200,
    headers: {
      'Content-Type': 'application/openapi+json',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
