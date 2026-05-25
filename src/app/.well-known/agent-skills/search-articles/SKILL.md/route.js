import { skillMarkdown } from '../skill-content'

export async function GET() {
  return new Response(skillMarkdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
