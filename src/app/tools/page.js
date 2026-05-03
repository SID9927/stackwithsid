import { supabase } from '@/lib/supabase'
import ToolsClient from '@/components/tools/ToolsClient'

export const metadata = {
  title: 'Developer Tools',
  description: 'Handpicked developer tools to boost your productivity and workflow.',
}

export default async function ToolsPage() {
  const { data: tools } = await supabase
    .from('tools')
    .select('id, name, description, url, category')
    .order('name')
  return <ToolsClient tools={tools || []} />
}
