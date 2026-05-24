import GitGame from '@/components/tools/GitGame'

export const metadata = {
  title: 'Interactive Git Learning Game & Visualizer | StackWithSid',
  description: 'Master Git commits, branching, merging, rebasing, and cherry-picking through an interactive, level-based visual puzzle game and simulator.',
  keywords: [
    'git game', 'learn git', 'git visualizer', 'interactive git tutorial',
    'git branch simulator', 'git merge visualizer', 'developer tools',
    'learn git branching', 'git sandbox'
  ]
}

export default function GitGamePage() {
  return (
    <main style={{ minHeight: 'calc(100vh - var(--nav-height))', position: 'relative' }} className="grid-pattern">
      <GitGame />
    </main>
  )
}
