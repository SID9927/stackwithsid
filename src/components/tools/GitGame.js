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
  ChevronRight, 
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { createInitialState, executeGitCommand } from '@/lib/gitEngine'
import GitVisualizer from './GitVisualizer'

// Revised levels starting from basic repository tracking to advanced remote sync
const GAME_LEVELS = [
  {
    id: 1,
    title: '1. Initialize Repository',
    description: 'Before you can track any project files, you must create a Git repository. This command initializes a hidden .git subdirectory in your folder structure.',
    objective: 'Initialize a new Git repository.',
    instructions: 'Type `git init` in the terminal to initialize your empty repository, or click the quick action button.',
    hint: 'Running `git init` prepares the tracking database and creates a default branch `main`.',
    initialState: {
      initialized: false,
      commits: {},
      branches: {},
      head: null,
      workingDirectory: { 'index.html': 'untracked', 'styles.css': 'untracked' },
      stagingArea: [],
      remoteBranches: {}
    },
    goalCondition: (state) => {
      return state.initialized === true;
    }
  },
  {
    id: 2,
    title: '2. Staging Changes (git add)',
    description: 'Before committing, you must tell Git which files to include in your snapshot. Adding files to the staging area lets you organize your changes.',
    objective: 'Stage the file `index.html` for your next commit.',
    instructions: 'Run `git add index.html` (or `git add .` to stage all) and check the status with `git status`.',
    hint: 'Staging files marks them as ready. If you run `git status`, staged files appear green under "Changes to be committed".',
    initialState: createInitialState({
      initialized: true,
      commits: {},
      branches: { 'main': null },
      head: 'main',
      workingDirectory: { 'index.html': 'untracked', 'styles.css': 'untracked' },
      stagingArea: [],
      remoteBranches: {}
    }),
    goalCondition: (state) => {
      return state.stagingArea && state.stagingArea.includes('index.html');
    }
  },
  {
    id: 3,
    title: '3. Recording Snapshots (git commit)',
    description: 'A commit permanently saves your staged changes as a node in the project history. Every commit requires a clear descriptive message.',
    objective: 'Commit your staged changes to the repository.',
    instructions: 'Your files are already staged. Commit them by running `git commit -m "Initial commit"`.',
    hint: 'Running `git commit` creates commit C0. This will clear your staging area and move the `main` branch pointer forward.',
    initialState: createInitialState({
      initialized: true,
      commits: {},
      branches: { 'main': null },
      head: 'main',
      workingDirectory: { 'index.html': 'untracked' },
      stagingArea: ['index.html'],
      remoteBranches: {}
    }),
    goalCondition: (state) => {
      return Object.keys(state.commits).length >= 1;
    }
  },
  {
    id: 4,
    title: '4. Creating & Switching Branches',
    description: 'Branches allow you to work on separate features in isolation. Checkout moves your HEAD pointer to target another branch.',
    objective: 'Create a new branch named `dev` and switch to it.',
    instructions: 'Type `git checkout -b dev` to create and checkout the branch in one command. (Or use `git branch dev` then `git checkout dev`)',
    hint: 'Branching creates a pointer pointing to the current commit. checkout moves HEAD to reference that branch pointer.',
    initialState: createInitialState(),
    goalCondition: (state) => {
      return state.head === 'dev' && state.branches['dev'] !== undefined;
    }
  },
  {
    id: 5,
    title: '5. Fast-Forward Merge',
    description: 'Integrating features is called merging. When the branch you are merging has no new commits since you split off, Git simply moves your pointer forward.',
    objective: 'Merge the `feature` branch into the `main` branch.',
    instructions: 'Switch to main (`git checkout main`) and run `git merge feature` to fast-forward.',
    hint: 'No merge commit is needed for fast-forward; the pointer moves directly to the feature branch\'s tip.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add navbar', branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Fix auth bug', branch: 'feature' }
      },
      branches: { 'main': 'C1', 'feature': 'C2' },
      head: 'main',
      workingDirectory: {},
      stagingArea: [],
      remoteBranches: {}
    }),
    goalCondition: (state) => {
      return state.branches['main'] === 'C2' && state.head === 'main';
    }
  },
  {
    id: 6,
    title: '6. Three-Way Merge',
    description: 'If both branches diverged, Git merges their histories and creates a new merge commit. This commit has two parent links.',
    objective: 'Merge the `dev` branch into the `main` branch.',
    instructions: 'Ensure you are on `main` (run `git checkout main`), then merge with `git merge dev`.',
    hint: 'This creates a merge commit (C3) linking both the parent commits together.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Hotfix on main', branch: 'main' },
        'C2': { id: 'C2', parents: ['C0'], message: 'Feat on dev', branch: 'dev' }
      },
      branches: { 'main': 'C1', 'dev': 'C2' },
      head: 'main',
      workingDirectory: {},
      stagingArea: [],
      remoteBranches: {}
    }),
    goalCondition: (state) => {
      const currentCommit = state.commits[state.branches['main']];
      return currentCommit && currentCommit.parents.includes('C1') && currentCommit.parents.includes('C2');
    }
  },
  {
    id: 7,
    title: '7. Git Rebase',
    description: 'Rebasing moves a sequence of commits to a new base. It creates a linear history by copying and replaying commits.',
    objective: 'Rebase the `feature` branch onto `main`.',
    instructions: 'Checkout `feature` (`git checkout feature`) and run `git rebase main`.',
    hint: 'Rebasing makes your branch look as if it was split directly off the latest commit on `main`.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Update core on main', branch: 'main' },
        'C2': { id: 'C2', parents: ['C0'], message: 'Draft UI on feature', branch: 'feature' }
      },
      branches: { 'main': 'C1', 'feature': 'C2' },
      head: 'feature',
      workingDirectory: {},
      stagingArea: [],
      remoteBranches: {}
    }),
    goalCondition: (state) => {
      const featureCommit = state.commits[state.branches['feature']];
      return featureCommit && featureCommit.parents.includes('C1') && state.head === 'feature';
    }
  },
  {
    id: 8,
    title: '8. Cherry Picking',
    description: 'Cherry-picking copies a specific commit from another branch and applies it directly on top of your current active branch.',
    objective: 'Cherry-pick commit `C2` from the `dev` branch onto the `main` branch.',
    instructions: 'Ensure you are on `main` and type `git cherry-pick C2` to copy the bugfix.',
    hint: 'This creates a copy commit on `main` containing the exact bugfix changes from C2.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'C1 features', branch: 'dev' },
        'C2': { id: 'C2', parents: ['C1'], message: 'C2 (Crucial Bugfix)', branch: 'dev' }
      },
      branches: { 'main': 'C0', 'dev': 'C2' },
      head: 'main',
      workingDirectory: {},
      stagingArea: [],
      remoteBranches: {}
    }),
    goalCondition: (state) => {
      const mainCommit = state.commits[state.branches['main']];
      return mainCommit && mainCommit.message.includes('Bugfix') && mainCommit.parents.includes('C0');
    }
  },
  {
    id: 9,
    title: '9. Resetting Commits',
    description: 'If you want to discard changes, `git reset --hard` moves your branch pointer backward, effectively erasing commits.',
    objective: 'Discard commit C2 and reset your branch to C1.',
    instructions: 'You are on the `main` branch. Discard the last commit by running `git reset --hard HEAD~1`.',
    hint: 'HEAD~1 references the direct parent commit of the active branch pointer.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Good work', branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Broken work', branch: 'main' }
      },
      branches: { 'main': 'C2' },
      head: 'main',
      workingDirectory: {},
      stagingArea: [],
      remoteBranches: {}
    }),
    goalCondition: (state) => {
      return state.branches['main'] === 'C1';
    }
  },
  {
    id: 10,
    title: '10. Pushing to GitHub (git push)',
    description: 'To share your work, you push local branch commits to a remote server. This updates the remote branches (represented as origin/branch).',
    objective: 'Push your local main branch commits to the remote origin.',
    instructions: 'Verify your status with `git status` then run `git push` to upload C1 to origin/main.',
    hint: 'Pushing syncs origin/main with your local main pointer, updating the remote tracking branch.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Cool feature', branch: 'main' }
      },
      branches: { 'main': 'C1' },
      head: 'main',
      workingDirectory: {},
      stagingArea: [],
      remoteBranches: { 'main': 'C0' }
    }),
    goalCondition: (state) => {
      return state.remoteBranches && state.remoteBranches['main'] === 'C1';
    }
  }
];

export default function GitGame() {
  const [levelIndex, setLevelIndex] = useState(0)
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

  const logsContainerRef = useRef(null)
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

  // Scroll terminal logs container internally to bottom on changes (fixes outer page scrolling)
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
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
  const getQuickActions = () => {
    if (isSandbox) {
      return ['git status', 'git add .', 'git commit -m "work"', 'git branch feature', 'git checkout feature', 'git merge main', 'git rebase main', 'git log']
    }
    
    switch (activeLevel.id) {
      case 1: return ['git init', 'git status']
      case 2: return ['git status', 'git add index.html', 'git add .']
      case 3: return ['git status', 'git commit -m "Initial commit"']
      case 4: return ['git branch dev', 'git checkout dev', 'git checkout -b dev']
      case 5: return ['git checkout main', 'git merge feature', 'git log']
      case 6: return ['git merge dev', 'git log']
      case 7: return ['git rebase main', 'git log']
      case 8: return ['git cherry-pick C2', 'git log']
      case 9: return ['git reset --hard HEAD~1', 'git log']
      case 10: return ['git status', 'git push']
      default: return []
    }
  }

  const quickActions = getQuickActions();

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
            <div><span style={{ color: 'var(--accent)' }}>git init</span> - Create new local repo</div>
            <div><span style={{ color: 'var(--accent)' }}>git status</span> - Check modified/staged files</div>
            <div><span style={{ color: 'var(--accent)' }}>git add &lt;file&gt;</span> - Stage file changes</div>
            <div><span style={{ color: 'var(--accent)' }}>git commit -m "msg"</span> - Record snapshot</div>
            <div><span style={{ color: 'var(--accent)' }}>git log</span> - View commit history logs</div>
            <div><span style={{ color: 'var(--accent)' }}>git branch &lt;name&gt;</span> - Create pointer</div>
            <div><span style={{ color: 'var(--accent)' }}>git checkout &lt;name&gt;</span> - Switch branch/commit</div>
            <div><span style={{ color: 'var(--accent)' }}>git merge &lt;branch&gt;</span> - Integrate branch</div>
            <div><span style={{ color: 'var(--accent)' }}>git push</span> - Upload commits to GitHub</div>
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
            ref={logsContainerRef}
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
            {terminalLogs.map((log, index) => {
              let displayLog = log;
              let color = '#e4e4e7';
              
              if (log.startsWith('\n$')) {
                color = 'var(--accent-soft)';
              } else if (log.startsWith('\tred:')) {
                displayLog = log.substring(5);
                color = '#ef4444'; // red text
              } else if (log.startsWith('\tgreen:')) {
                displayLog = log.substring(7);
                color = '#10b981'; // green text
              } else if (log.includes('error') || log.includes('fatal')) {
                color = '#ef4444';
              } else if (log.includes('Success!') || log.includes('Switched to') || log.includes('Rebased') || log.includes('Completed')) {
                color = '#10b981';
              }

              return (
                <div key={index} style={{ whiteSpace: 'pre-wrap', color }}>
                  {displayLog}
                </div>
              );
            })}
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
