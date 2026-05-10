import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import InterviewClient from '@/components/interview/InterviewClient'

export const metadata = {
  title: 'Interview Prep',
  description: 'Curated interview Q&As for React, Node.js, DSA, System Design and more. Filter by stack and difficulty.',
}

export default async function InterviewPage() {
  // Fetch real data from Supabase
  const { data: questions } = supabase
    ? await supabase
        .from('interview_questions')
        .select('id, slug, question, answer, stack, difficulty, created_at, company, is_frequent')
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <Suspense fallback={<div className="loading-state">Loading Mastery...</div>}>
      <InterviewClient initialQuestions={questions || []} />
    </Suspense>
  )
}
