export const skillMarkdown = `# Search Articles Skill

Search for technical deep-dive articles in software engineering, system design, and retirement schemes on StackWithSid.

## Endpoint

POST https://stack.dsiddharth.in/api/search

### Request Schema

\`\`\`json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "The search keywords or tags"
    }
  },
  "required": ["query"]
}
\`\`\`

### Response Schema

\`\`\`json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "slug": { "type": "string" },
      "excerpt": { "type": "string" }
    }
  }
}
\`\`\`
`
