import { supabase } from '@/lib/supabase'
import VideosClient from '@/components/videos/VideosClient'

export const metadata = {
  title: 'Videos',
  description: 'YouTube videos and upcoming content from StackWithSid.',
}

export default async function VideosPage() {
  const { data: videos } = await supabase
    .from('youtube_videos')
    .select('id, title, thumbnail_url, youtube_url, status, publish_date')
    .order('created_at', { ascending: false })

  return <VideosClient videos={videos || []} />
}
