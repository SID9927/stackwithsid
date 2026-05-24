'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  BookOpen, 
  Check, 
  ChevronRight, 
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { createInitialState, executeGitCommand } from '@/lib/gitEngine'
import GitVisualizer from './GitVisualizer'

// Defined Levels
const GAME_LEVELS = [
  {
    id: 1,
    title: '1. Your First Commit',
    description: 'Every project using Git starts with a commit. A commit captures a snapshot of the repository\'s staged changes at that moment in time.',
    objective: 'Create a new commit on the `main` branch.',
    instructions: 'Type `git commit -m "add index page"` and press Enter to record your first changes, or use the quick command button.',
    hint: 'Running `git commit` will create a new commit node (C1) pointing to (C0), and advance the `main` branch to it.',
    initialState: createInitialState(),
    goalCondition: (state) => {
      return Object.keys(state.commits).length >= 2;
    }
  },
  {
    id: 2,
    title: '2. Creating & Checking out Branches',
    description: 'Branches allow you to work on different features or bugfixes in isolation without modifying the main line of development.',
    objective: 'Create a new branch named `dev` and switch (checkout) to it.',
    instructions: 'Run `git checkout -b dev` to create and switch to it in a single step. Alternatively, run `git branch dev` followed by `git checkout dev`.',
    hint: 'Creating a branch adds a new pointer named `dev` pointing to the current commit. Checking out moves HEAD to point to the `dev` branch.',
    initialState: createInitialState({
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add index page', branch: 'main' }
      },
      branches: { 'main': 'C1' },
      head: 'main'
    }),
    goalCondition: (state) => {
      return state.head === 'dev' && state.branches['dev'] !== undefined;
    }
  },
  {
    id: 3,
    title: '3. Fast-Forward Merge',
    description: 'When you want to pull changes from a feature branch back to your main branch, you perform a merge. If the main branch has no new commits since the feature branch split off, Git performs a fast-forward merge.',
    objective: 'Merge the `feature` branch into the `main` branch.',
    instructions: 'Ensure you are on the `main` branch (run `git checkout main` if you aren\'t), then merge the feature branch using `git merge feature`.',
    hint: 'A fast-forward merge simply moves the `main` branch pointer forward to match `feature`. No new merge commit is created.',
    initialState: createInitialState({
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add nav', branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Fix login issue', branch: 'feature' }
      },
      branches: { 'main': 'C1', 'feature': 'C2' },
      head: 'main'
    }),
    goalCondition: (state) => {
      return state.branches['main'] === 'C2' && state.head === 'main';
    }
  },
  {
    id: 4,
    title: '4. Three-Way Merge (Merge Commit)',
    description: 'When both branches have diverged (both have new, separate commits since they split), Git cannot do a fast-forward. Instead, it creates a special new commit with two parents—a merge commit.',
    objective: 'Merge the `dev` branch into the `main` branch.',
    instructions: 'Ensure you are on `main` (the current HEAD), then merge the `dev` branch by running `git merge dev`.',
    hint: 'Git will look at the common ancestor (C0), compare the changes on both branches, and create a new merge commit (C3) connecting them.',
    initialState: createInitialState({
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Hotfix on main', branch: 'main' },
        'C2': { id: 'C2', parents: ['C0'], message: 'New page on dev', branch: 'dev' }
      },
      branches: { 'main': 'C1', 'dev': 'C2' },
      head: 'main'
    }),
    goalCondition: (state) => {
      const currentCommitId = state.branches['main'];
      const currentCommit = state.commits[currentCommitId];
      return currentCommit && currentCommit.parents.includes('C1') && currentCommit.parents.includes('C2');
    }
  },
  {
    id: 5,
    title: '5. Git Rebase',
    description: 'Rebasing is another way of integrating changes. It takes all commits from one branch, copies them, and appends them onto another branch, producing a perfectly linear commit history.',
    objective: 'Rebase the `feature` branch onto `main`.',
    instructions: 'Make sure you are on `feature` (`git checkout feature`), and run `git rebase main`.',
    hint: 'Rebasing takes the commits on `feature` since it diverged, saves them temporarily, moves the `feature` branch to the tip of `main`, and then replays those saved commits on top.',
    initialState: createInitialState({
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Update homepage on main', branch: 'main' },
        'C2': { id: 'C2', parents: ['C0'], message: 'Draft styling on feature', branch: 'feature' }
      },
      branches: { 'main': 'C1', 'feature': 'C2' },
      head: 'feature'
    }),
    goalCondition: (state) => {
      const featureCommitId = state.branches['feature'];
      const featureCommit = state.commits[featureCommitId];
      return featureCommit && featureCommit.parents.includes('C1') && state.head === 'feature';
    }
  },
  {
    id: 6,
    title: '6. Cherry Pick',
    description: 'Sometimes you don\'t want to merge or rebase an entire branch. If you only want a single commit\'s changes, you can cherry-pick it.',
    objective: 'Cherry-pick commit `C2` from the `dev` branch onto the `main` branch.',
    instructions: 'You are on the `main` branch. Cherry-pick the changes of commit C2 by running `git cherry-pick C2`.',
    hint: 'Cherry-picking creates a new duplicate commit on your current branch containing the exact changes introduced in C2.',
    initialState: createInitialState({
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'C1 work', branch: 'dev' },
        'C2': { id: 'C2', parents: ['C1'], message: 'C2 (Crucial Bugfix)', branch: 'dev' }
      },
      branches: { 'main': 'C0', 'dev': 'C2' },
      head: 'main'
    }),
    goalCondition: (state) => {
      const mainCommitId = state.branches['main'];
      const mainCommit = state.commits[mainCommitId];
      return mainCommit && mainCommit.message.includes('Bugfix') && mainCommit.parents.includes('C0');
    }
  },
  {
    id: 7,
    title: '7. Git Reset & Revert',
    description: 'When you make a mistake, Git offers tools to go back. `git reset` moves the branch pointer backward, discarding commits. `git revert` creates a new commit that reverses the changes of an old commit.',
    objective: 'Reset your branch back by 1 commit (to C1).',
    instructions: 'You are on the `main` branch. Undo your last commit by running `git reset --hard HEAD~1`.',
    hint: 'Resetting moves the active branch pointer back to a parent commit. HEAD~1 points to the parent of the current HEAD.',
    initialState: createInitialState({
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'First commit', branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Mistaken commit', branch: 'main' }
      },
      branches: { 'main': 'C2' },
      head: 'main'
    }),
    goalCondition: (state) => {
      return state.branches['main'] === 'C1';
    }
  }
];

export default function GitGame() {
  const [levelIndex, setLevelIndex] = useState(0) // 0 to GAME_LEVELS.length - 1
  const [isSandbox, setIsSandbox] = useState(false)
  const [gitState, setGitState] = useState(GAME_LEVELS[0].initialState)
  const [terminalLogs, setTerminalLogs] = useState([
    'Welcome to the Interactive Git Visualizer & Game!',
    'Type Git commands in the prompt below. Try standard commands like commit, checkout, branch, merge, etc.',
    'Or use the quick action buttons to play.'
  ])
  const [inputVal, setInputVal] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showHint, setShowHint] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const terminalEndRef = useRef(null)
  const inputRef = useRef(null)

  const activeLevel = GAME_LEVELS[levelIndex]

  // Initialize level state
  useEffect(() => {
    if (!isSandbox) {
      setGitState(activeLevel.initialState)
      setTerminalLogs([
        `--- Starting ${activeLevel.title} ---`,
        `Objective: ${activeLevel.objective}`,
        'Type your commands below. Good luck!'
      ])
      setIsCompleted(false)
      setShowHint(false)
    } else {
      setGitState(createInitialState())
      setTerminalLogs([
        '--- Sandbox Mode Active ---',
        'You are free to experiment! Create branches, commit, rebase, and merge as much as you like.',
        'Type "reset" to clear the sandbox.'
      ])
    }
    setInputVal('')
  }, [levelIndex, isSandbox])

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [terminalLogs])

  // Check goal condition on gitState change
  useEffect(() => {
    if (!isSandbox && activeLevel.goalCondition(gitState)) {
      setIsCompleted(true)
    }
  }, [gitState, isSandbox, activeLevel])

  const handleCommandSubmit = (cmd) => {
    if (!cmd.trim()) return

    const trimmedCmd = cmd.trim()
    const nextHistory = [trimmedCmd, ...cmdHistory].slice(0, 50)
    setCmdHistory(nextHistory)
    setHistoryIndex(-1)

    // Handle custom system commands
    if (trimmedCmd === 'clear') {
      setTerminalLogs([])
      setInputVal('')
      return
    }

    if (trimmedCmd === 'reset') {
      if (isSandbox) {
        setGitState(createInitialState())
        setTerminalLogs(['Sandbox reset successfully.'])
      } else {
        setGitState(activeLevel.initialState)
        setTerminalLogs([
          `--- Level Reset ---`,
          `Objective: ${activeLevel.objective}`
        ])
        setIsCompleted(false)
      }
      setInputVal('')
      return
    }

    // Process Git command
    const { state: nextState, log } = executeGitCommand(gitState, trimmedCmd)
    
    setGitState(nextState)
    setTerminalLogs(prev => [...prev, `\n$ ${trimmedCmd}`, ...log])
    setInputVal('')
  }

  // Key handlers (Arrow up/down for command history)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommandSubmit(inputVal)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, cmdHistory.length - 1)
        setHistoryIndex(nextIdx)
        setInputVal(cmdHistory[nextIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIdx = historyIndex - 1
      setHistoryIndex(nextIdx)
      if (nextIdx >= 0) {
        setInputVal(cmdHistory[nextIdx])
      } else {
        setInputVal('')
      }
    }
  }

  const loadNextLevel = () => {
    if (levelIndex < GAME_LEVELS.length - 1) {
      setLevelIndex(prev => prev + 1)
    } else {
      setIsSandbox(true)
    }
  }

  // List of quick commands helper tags
  const quickActions = isSandbox
    ? ['git commit -m "work"', 'git branch feature', 'git checkout feature', 'git merge main', 'git rebase main']
    : [
        activeLevel.id === 1 ? 'git commit -m "add index page"' : null,
        activeLevel.id === 2 ? 'git checkout -b dev' : null,
        activeLevel.id === 3 ? 'git merge feature' : null,
        activeLevel.id === 4 ? 'git merge dev' : null,
        activeLevel.id === 5 ? 'git rebase main' : null,
        activeLevel.id === 6 ? 'git cherry-pick C2' : null,
        activeLevel.id === 7 ? 'git reset --hard HEAD~1' : null,
      ].filter(Boolean)

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 400px) 1fr',
        minHeight: 'calc(100vh - var(--nav-height))',
        background: 'var(--bg-primary)'
      }}
      className="responsive-grid-layout"
    >
      {/* Sidebar: Quest / Levels */}
      <div 
        style={{
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-syne)' }}>Git Master Quest</h2>
          <button 
            onClick={() => setIsSandbox(!isSandbox)} 
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid var(--border-mid)',
              background: isSandbox ? 'hsl(270,75%,55%,0.15)' : 'transparent',
              color: isSandbox ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isSandbox ? 'Sandbox Mode' : 'Play Quest'}
          </button>
        </div>

        {/* Level Selector Dropdown */}
        {!isSandbox && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SELECT LEVEL</label>
            <select
              value={levelIndex}
              onChange={(e) => setLevelIndex(parseInt(e.target.value))}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {GAME_LEVELS.map((lvl, idx) => (
                <option key={lvl.id} value={idx}>{lvl.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Level Details Card */}
        {!isSandbox ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: 8 }}>LEVEL {activeLevel.id}</span>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{activeLevel.objective}</h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {activeLevel.description}
            </p>

            <div 
              style={{
                background: 'rgba(124, 58, 237, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 16
              }}
            >
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={14} style={{ color: 'var(--accent)' }} /> INSTRUCTIONS
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {activeLevel.instructions}
              </p>
            </div>

            {/* Hint Accordion */}
            <div>
              <button 
                onClick={() => setShowHint(!showHint)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <HelpCircle size={14} /> {showHint ? 'Hide Hint' : 'Need a Hint?'}
              </button>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text-muted)', 
                      marginTop: 8, 
                      padding: 10,
                      background: 'var(--bg-secondary)', 
                      borderRadius: 8,
                      borderLeft: '3px solid var(--accent)',
                      lineHeight: 1.5 
                    }}>
                      {activeLevel.hint}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: '1.1rem' }}>Sandbox Playground</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              In Sandbox Mode, you are in a free-roaming local repository. Test commands like checkout, branching, rebases, or cherry-picks. Use it to understand complex workflows visually!
            </p>
          </div>
        )}

        {/* Cheat Sheet */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>GIT CHEATSHEET</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <div><span style={{ color: 'var(--accent)' }}>git commit -m "msg"</span> - Record snapshot</div>
            <div><span style={{ color: 'var(--accent)' }}>git branch &lt;name&gt;</span> - Create pointer</div>
            <div><span style={{ color: 'var(--accent)' }}>git checkout &lt;name&gt;</span> - Switch branch/commit</div>
            <div><span style={{ color: 'var(--accent)' }}>git merge &lt;branch&gt;</span> - Integrate branch</div>
            <div><span style={{ color: 'var(--accent)' }}>git rebase &lt;branch&gt;</span> - Copy commits to base</div>
            <div><span style={{ color: 'var(--accent)' }}>git cherry-pick &lt;C#&gt;</span> - Apply specific commit</div>
            <div><span style={{ color: 'var(--accent)' }}>git reset HEAD~1</span> - Step back in commit tree</div>
          </div>
        </div>
      </div>

      {/* Main Board: SVG Visualization on top, Terminal on bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top: SVG Commit Graph */}
        <div style={{ flex: 1, minHeight: '300px', display: 'flex', position: 'relative' }}>
          <GitVisualizer gitState={gitState} />
          
          {/* Level Complete Overlay splash */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(5, 5, 5, 0.75)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-accent)',
                    boxShadow: 'var(--shadow-glow)',
                    borderRadius: 24,
                    padding: '40px 32px',
                    textAlign: 'center',
                    maxWidth: 400,
                    margin: '0 20px'
                  }}
                >
                  <div style={{ 
                    width: 60, height: 60, borderRadius: '50%', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    color: '#10b981', 
                    display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                    marginBottom: 20
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Level Completed!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                    You successfully completed the objective for: <br />
                    <strong>{activeLevel.title}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button 
                      onClick={() => {
                        setGitState(activeLevel.initialState)
                        setIsCompleted(false)
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 12,
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-mid)',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Restart Level
                    </button>
                    <button 
                      onClick={loadNextLevel}
                      style={{
                        padding: '10px 20px',
                        borderRadius: 12,
                        background: 'var(--gradient-purple)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {levelIndex < GAME_LEVELS.length - 1 ? 'Next Level' : 'Go to Sandbox'} <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: Simulated Terminal Console */}
        <div 
          style={{
            height: '280px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Terminal Title Bar */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'var(--bg-card)',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Terminal size={14} style={{ color: 'var(--accent)' }} />
              <span>TERMINAL CONSOLE</span>
            </div>
            
            {/* Quick Actions / Reset buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button 
                onClick={() => handleCommandSubmit('reset')} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <RefreshCw size={12} /> Reset Repo
              </button>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <button 
                onClick={() => handleCommandSubmit('clear')} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Clear Screen
              </button>
            </div>
          </div>

          {/* Quick command buttons helper box */}
          <div 
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 16px',
              background: 'var(--bg-card)',
              overflowX: 'auto',
              borderBottom: '1px solid var(--border-subtle)',
              alignItems: 'center',
              userSelect: 'none'
            }}
          >
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>QUICK PLAY:</span>
            {quickActions.map(action => (
              <button 
                key={action}
                onClick={() => handleCommandSubmit(action)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-soft)',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'hsl(270,75%,55%,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                }}
              >
                {action}
              </button>
            ))}
          </div>

          {/* Terminal Log Output List */}
          <div 
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              color: '#d4d4d8',
              cursor: 'text'
            }}
            onClick={() => inputRef.current?.focus()}
          >
            {terminalLogs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  whiteSpace: 'pre-wrap', 
                  color: log.startsWith('\n$') 
                    ? 'var(--accent-soft)' 
                    : log.includes('error') || log.includes('fatal')
                      ? '#ef4444'
                      : log.includes('Success!') || log.includes('switched to') || log.includes('Rebased') || log.includes('Completed')
                        ? '#10b981'
                        : '#e4e4e7'
                }}
              >
                {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Interactive Shell Input Prompt */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#10b981', fontWeight: 700, userSelect: 'none' }}>
              stackwithsid$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type Git command (e.g. git commit)..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                minHeight: '24px'
              }}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Embedded CSS styling overrides */}
      <style jsx global>{`
        .responsive-grid-layout {
          grid-template-columns: minmax(320px, 400px) 1fr;
        }
        @media (max-width: 900px) {
          .responsive-grid-layout {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto 450px 300px;
          }
        }
        
        /* Keyframe overrides matching main globals.css animations */
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 8px var(--accent), 0 0 16px rgba(168, 85, 247, 0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 16px var(--accent), 0 0 32px rgba(168, 85, 247, 0.4);
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}
