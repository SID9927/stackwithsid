export async function GET() {
  return new Response("Model Context Protocol (MCP) HTTP Transport Endpoint", {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}

export async function POST(request) {
  try {
    const payload = await request.json()
    // Handle standard JSON-RPC handshake / requests
    if (payload.method === 'initialize') {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: payload.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          serverInfo: {
            name: 'StackWithSid',
            version: '1.0.0'
          }
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: payload.id || null,
      result: {}
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error' },
      id: null
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
