import { supabase } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''

  if (!query) {
    return Response.json([])
  }

  const { data } = supabase
    ? await supabase
        .from('articles')
        .select('title, slug, excerpt')
        .eq('published', true)
        .ilike('title', `%${query}%`)
        .limit(10)
    : { data: [] }

  return Response.json(data || [])
}

export async function POST(request) {
  try {
    const payload = await request.json()
    const query = payload.query || ''

    if (!query) {
      return Response.json([])
    }

    const { data } = supabase
      ? await supabase
          .from('articles')
          .select('title, slug, excerpt')
          .eq('published', true)
          .ilike('title', `%${query}%`)
          .limit(10)
      : { data: [] }

    return Response.json(data || [])
  } catch (err) {
    return Response.json({ error: 'Invalid JSON request payload' }, { status: 400 })
  }
}
