import crypto from 'crypto'
import { skillMarkdown } from '../search-articles/skill-content'

export async function GET() {
  const hash = crypto.createHash('sha256').update(skillMarkdown).digest('hex')
  const baseUrl = 'https://stack.dsiddharth.in'

  const index = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'search-articles',
        type: 'skill-md',
        description: 'Search and retrieve articles on modern web development.',
        url: `${baseUrl}/.well-known/agent-skills/search-articles/SKILL.md`,
        digest: `sha256:${hash}`
      }
    ]
  }

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
