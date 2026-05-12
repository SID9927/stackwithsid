import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import InterviewClient from '@/components/interview/InterviewClient'

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams
  
  if (q) {
    const { data } = await supabase
      .from('interview_questions')
      .select('question, stack, difficulty')
      .or(`slug.eq.${q},id.eq.${q}`)
      .maybeSingle()
      
    if (data) {
      return {
        title: `${data.question} | Interview Prep`,
        description: `Learn ${data.stack} interview questions: ${data.question} (${data.difficulty} level).`,
        openGraph: {
          title: data.question,
          description: `Learn how to answer: "${data.question}" with our simplified guide on ${data.stack}.`,
          type: 'article',
        }
      }
    }
  }
  
  return {
    title: 'Interview Prep | SidStack',
    description: 'Curated interview Q&As for React, Node.js, DSA, System Design and more.',
  }
}

// Force Next.js to dynamically render this page on every request
export const dynamic = 'force-dynamic'

export default async function InterviewPage() {
  // Fetch real data from Supabase
  const { data: questions } = supabase
    ? await supabase
        .from('interview_questions')
        .select('id, slug, question, answer, stack, difficulty, created_at, company, is_frequent')
        .eq('published', true)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <Suspense fallback={<div className="loading-state">Loading Interview Prep...</div>}>
      <InterviewClient initialQuestions={questions || []} />
    </Suspense>
  )
}
