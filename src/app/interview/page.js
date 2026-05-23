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

export default async function InterviewPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams?.q

  // Fetch real data from Supabase
  const { data: questions } = supabase
    ? await supabase
        .from('interview_questions')
        .select('id, slug, question, answer, stack, difficulty, created_at, company, is_frequent')
        .eq('published', true)
        .order('created_at', { ascending: false })
    : { data: [] }

  const allQuestions = questions || []
  let jsonLd = null

  if (q) {
    const activeQuestion = allQuestions.find(question => question.slug === q || question.id === q)
    if (activeQuestion) {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        'mainEntity': {
          '@type': 'Question',
          'name': activeQuestion.question,
          'text': activeQuestion.question,
          'answerCount': 1,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': activeQuestion.answer,
            'upvoteCount': 1,
            'url': `https://stack.dsiddharth.in/interview?q=${activeQuestion.slug}`,
          },
        },
      }
    }
  }

  if (!jsonLd && allQuestions.length > 0) {
    const frequentQuestions = allQuestions.filter(question => question.is_frequent).slice(0, 10)
    if (frequentQuestions.length > 0) {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': frequentQuestions.map(question => ({
          '@type': 'Question',
          'name': question.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': question.answer,
          },
        })),
      }
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Suspense fallback={<div className="loading-state">Loading Interview Prep...</div>}>
        <InterviewClient initialQuestions={allQuestions} />
      </Suspense>
    </>
  )
}
