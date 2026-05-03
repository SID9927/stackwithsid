import { supabase } from '@/lib/supabase'
import DiscussClient from '@/components/discuss/DiscussClient'

export const metadata = {
  title: 'Discussions',
  description: 'Open developer community discussions on StackWithSid.',
}

export default async function DiscussPage() {
  const { data: threads } = await supabase
    .from('discussions')
    .select('id, title, tags, created_at')
    .order('created_at', { ascending: false })

  return <DiscussClient threads={threads || []} />
}
