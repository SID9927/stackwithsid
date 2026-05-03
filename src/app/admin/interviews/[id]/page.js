import InterviewForm from '@/components/admin/InterviewForm'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Edit Question | SidCMS',
}

export default async function EditInterviewPage({ params }) {
  const { id } = params
  
  const { data: question } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('id', id)
    .single()

  if (!question) notFound()

  return (
    <div className="admin-content">
      <InterviewForm initialData={question} isEdit={true} />
    </div>
  )
}
