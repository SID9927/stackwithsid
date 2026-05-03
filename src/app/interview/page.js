import { supabase } from '@/lib/supabase'
import InterviewClient from '@/components/interview/InterviewClient'

export const metadata = {
  title: 'Interview Prep',
  description: 'Curated interview Q&As for React, Node.js, DSA, System Design and more. Filter by stack and difficulty.',
}

const MOCK_QUESTIONS = [
  {
    id: 'm1',
    question: "What is the difference between useMemo and useCallback in React?",
    company: "Meta",
    answer: "Think of it like this: **useMemo** is for remembering a **value** (like a calculated price), while **useCallback** is for remembering a **function** (like a click handler). \n\n**Simple Example:**\n- useMemo: 'Don't re-calculate this expensive math if inputs haven't changed.'\n- useCallback: 'Don't re-create this function if inputs haven't changed, so my child component doesn't get confused.'",
    stack: "React",
    difficulty: "Beginner",
    created_at: new Date().toISOString()
  },
  {
    id: 'm2',
    question: "How does the Node.js Event Loop work in simple terms?",
    company: "Amazon",
    answer: "Imagine Node.js is a **waiter**. The waiter takes orders (requests) and gives them to the kitchen (system). Instead of waiting for the food to be ready, the waiter goes to the next table. When the food is ready, the kitchen rings a bell, and the waiter delivers it. \n\nThis is 'non-blocking'—one waiter can handle many tables without ever standing still!",
    stack: "Node.js",
    difficulty: "Intermediate",
    created_at: new Date().toISOString()
  },
  {
    id: 'm3',
    question: "What is Sharding, and why do we need it?",
    company: "Google",
    answer: "Sharding is like breaking a massive library into smaller branches across different cities. If one library (database) gets too crowded, you split the books (data) so people can go to different locations. \n\n**Why?** Because one server can only handle so much. Sharding lets you grow your database infinitely by spreading it across many servers.",
    stack: "System Design",
    difficulty: "Advanced",
    created_at: new Date().toISOString()
  },
  {
    id: 'm4',
    question: "Why use Next.js Server Components?",
    company: "Vercel",
    answer: "Traditional React sends all the 'building instructions' (JavaScript) to your phone. **Server Components** do the building on the server and just send the 'final result' (HTML) to you. \n\n**Result:** Your site loads way faster because your phone has less work to do and less code to download.",
    stack: "Next.js",
    difficulty: "Intermediate",
    created_at: new Date().toISOString()
  }
]

export default async function InterviewPage() {
  const { data: dbQuestions } = supabase
    ? await supabase.from('interview_questions').select('id, question, answer, stack, difficulty, created_at, company').order('created_at', { ascending: false })
    : { data: [] }

  const questions = [...(dbQuestions || []), ...MOCK_QUESTIONS]

  return <InterviewClient initialQuestions={questions} />
}
