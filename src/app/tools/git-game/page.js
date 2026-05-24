import GitGame from '@/components/tools/GitGame'

export const metadata = {
  title: 'Interactive Git Learning Game & Visualizer | StackWithSid',
  description: 'Master Git commits, branching, merging, rebasing, and cherry-picking through an interactive, level-based visual puzzle game and simulator.',
  keywords: [
    'git game', 'learn git', 'git visualizer', 'interactive git tutorial',
    'git branch simulator', 'git merge visualizer', 'developer tools',
    'learn git branching', 'git sandbox'
  ],
  openGraph: {
    title: 'Interactive Git Learning Game & Visualizer | StackWithSid',
    description: 'Learn Git branching, merging, rebasing, and recovery commands visually through interactive gameplay puzzles.',
    url: 'https://stackwithsid.com/tools/git-game',
    siteName: 'StackWithSid',
    type: 'website',
    images: [
      {
        url: 'https://stackwithsid.com/images/git-game-preview_optimized.webp',
        width: 1200,
        height: 630,
        alt: 'Git Master Quest Interactive Visualizer Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Git Learning Game & Visualizer | StackWithSid',
    description: 'Learn Git branching, merging, rebasing, and recovery commands visually through interactive gameplay puzzles.',
    images: ['https://stackwithsid.com/images/git-game-preview_optimized.webp']
  }
}

export default function GitGamePage() {
  return (
    <main style={{ minHeight: 'calc(100vh - var(--nav-height))', position: 'relative' }} className="grid-pattern">
      <GitGame />
    </main>
  )
}
