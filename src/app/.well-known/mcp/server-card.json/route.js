export async function GET() {
  const baseUrl = 'https://stack.dsiddharth.in'
  
  const serverCard = {
    serverInfo: {
      name: 'StackWithSid',
      version: '1.0.0'
    },
    endpoint: `${baseUrl}/api/mcp`,
    capabilities: {
      tools: {
        listChanged: false
      },
      resources: {
        subscribe: false,
        listChanged: false
      },
      prompts: {
        listChanged: false
      }
    }
  }

  return new Response(JSON.stringify(serverCard), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
