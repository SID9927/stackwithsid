'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw, HelpCircle, CheckCircle2, ArrowRight,
  Terminal, BookOpen, RefreshCw, ChevronDown, ChevronRight,
  Star, X, Zap, Trophy
} from 'lucide-react'
import LevelSelector from './git-game/LevelSelector'
import TierProgress from './git-game/TierProgress'
import CheatSheet from './git-game/CheatSheet'
import LevelBanner from './git-game/LevelBanner'
import { GAME_LEVELS, TIERS, CHEATSHEET, XP_PER_LEVEL, QUICK_ACTIONS } from './git-game/gameData'
import { createInitialState, executeGitCommand } from '@/lib/gitEngine'
import GitVisualizer from './GitVisualizer'
import Confetti from './git-game/Confetti'

// ─── Component ───────────────────────────────────────────────────────────────

export default function GitGame() {
  const [levelIndex, setLevelIndex] = useState(0)
  const [isSandbox, setIsSandbox] = useState(false)
  const [gitState, setGitState] = useState(GAME_LEVELS[0].initialState)
  const [terminalLogs, setTerminalLogs] = useState([
    '🎮 Welcome to Git Master Quest!',
    'Type Git commands below or click Quick Play buttons.',
    'Start: type `git help` to see all supported commands.'
  ])
  const [inputVal, setInputVal] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showHint, setShowHint] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [commandsUsed, setCommandsUsed] = useState(new Set())

  // XP & completed levels — localStorage persistence
  const [xp, setXp] = useState(0)
  const [completedLevels, setCompletedLevels] = useState([])
  const [triggerConfetti, setTriggerConfetti] = useState(false)
  const [showQuestCompleteModal, setShowQuestCompleteModal] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState('workspace') // 'info' or 'workspace'

  // Load from localStorage on mount (client-side only) to prevent hydration mismatch
  useEffect(() => {
    try {
      const savedXp = localStorage.getItem('git-game-xp')
      if (savedXp) setXp(parseInt(savedXp, 10))

      const savedCompleted = localStorage.getItem('git-game-completed')
      if (savedCompleted) setCompletedLevels(JSON.parse(savedCompleted))
    } catch (e) {
      console.error('Failed to load git-game state from localStorage', e)
    }
  }, [])

  const logsContainerRef = useRef(null)
  const inputRef = useRef(null)

  const activeLevel = GAME_LEVELS[levelIndex]
  const currentTier = TIERS.find(t => t.levels.includes(activeLevel?.id))
  const quickActions = isSandbox ? QUICK_ACTIONS.sandbox : (QUICK_ACTIONS[activeLevel?.id] || [])

  // ── Initialize level when levelIndex or sandbox mode changes ────────────
  useEffect(() => {
    if (!isSandbox) {
      setGitState(JSON.parse(JSON.stringify(activeLevel.initialState)))
      setTerminalLogs([
        `── Level ${activeLevel.id}: ${activeLevel.title} ──`,
        `🎯 ${activeLevel.objective}`,
        '',
        activeLevel.instructions,
        '',
        'Type commands below or click Quick Play buttons. Good luck!'
      ])
      setIsCompleted(false)
      setShowHint(false)
    } else {
      setGitState(createInitialState())
      setTerminalLogs([
        '── Sandbox Mode ──',
        'Free-roam playground. Create branches, commit, rebase, merge — experiment freely!',
        'Type `reset` to clear the sandbox back to a fresh repo.'
      ])
    }
    setInputVal('')
    setCommandsUsed(new Set())
  }, [levelIndex, isSandbox])

  // ── Scroll terminal logs internally (NOT page-level scroll) ─────────────
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [terminalLogs])

  // ── ESC key closes level-complete banner ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isCompleted) setIsCompleted(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isCompleted])

  // ── Command submission ────────────────────────────────────────────────────
  const handleCommandSubmit = (cmd) => {
    if (!cmd.trim()) return

    const trimmedCmd = cmd.trim()
    const nextHistory = [trimmedCmd, ...cmdHistory].slice(0, 50)
    setCmdHistory(nextHistory)
    setHistoryIndex(-1)

    // Track which git sub-commands have been used (for goalCondition)
    const cmdParts = trimmedCmd.split(/\s+/)
    let updatedCommands = new Set(commandsUsed)
    if (cmdParts[0] === 'git' && cmdParts[1]) {
      const subCommand = cmdParts[1]
      const nextCommands = [subCommand]

      // Standardize stash actions to track stashing and popping separately
      if (subCommand === 'stash') {
        let stashAction = cmdParts[2] || 'push'
        if (stashAction === 'save') stashAction = 'push'
        if (stashAction === 'apply') stashAction = 'pop'
        nextCommands.push(`stash-${stashAction}`)
      }

      nextCommands.forEach(cmd => updatedCommands.add(cmd))
      setCommandsUsed(new Set(updatedCommands))
    }

    // Built-in console commands
    if (trimmedCmd === 'clear') {
      setTerminalLogs([])
      setInputVal('')
      return
    }

    if (trimmedCmd === 'reset') {
      const freshState = isSandbox
        ? createInitialState()
        : JSON.parse(JSON.stringify(activeLevel.initialState))
      setGitState(freshState)
      setIsCompleted(false)
      setCommandsUsed(new Set())
      setTerminalLogs(isSandbox
        ? ['Sandbox reset to fresh repo.']
        : [`── Level Reset ──`, `🎯 ${activeLevel.objective}`]
      )
      setInputVal('')
      return
    }

    // Execute Git command through the engine
    const { state: nextState, log } = executeGitCommand(gitState, trimmedCmd)
    setGitState(nextState)
    setTerminalLogs(prev => [...prev, `\n$ ${trimmedCmd}`, ...log])
    setInputVal('')

    // ── Check goal condition after command execution ──────────────────────
    if (!isSandbox && !isCompleted) {
      try {
        if (activeLevel.goalCondition(nextState, updatedCommands)) {
          setIsCompleted(true)

          // Trigger confetti popper on level complete
          setTriggerConfetti(true)
          setTimeout(() => {
            setTriggerConfetti(false)
          }, 4500)

          // Award XP if this level hasn't been completed before
          if (!completedLevels.includes(activeLevel.id)) {
            const newXp = xp + XP_PER_LEVEL
            const newCompleted = [...completedLevels, activeLevel.id]
            setXp(newXp)
            setCompletedLevels(newCompleted)
            try {
              localStorage.setItem('git-game-xp', String(newXp))
              localStorage.setItem('git-game-completed', JSON.stringify(newCompleted))
            } catch {}

            // If the final level is completed, show the Quest Completion Modal
            if (newCompleted.length === GAME_LEVELS.length) {
              setTimeout(() => {
                setShowQuestCompleteModal(true)
                setTriggerConfetti(true) // Keep confetti active for the modal
              }, 1200)
            }
          }
        }
      } catch (e) {
        console.error('Error checking goal condition:', e)
      }
    }
  }

  // ── Keyboard navigation (↑↓ history, Enter submit) ────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
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
      setInputVal(nextIdx >= 0 ? cmdHistory[nextIdx] : '')
    }
  }

  const loadNextLevel = () => {
    if (levelIndex < GAME_LEVELS.length - 1) {
      setLevelIndex(prev => prev + 1)
    } else {
      setIsSandbox(true)
    }
    setIsCompleted(false)
  }

  const restartLevel = () => {
    setGitState(JSON.parse(JSON.stringify(activeLevel.initialState)))
    setIsCompleted(false)
    setCommandsUsed(new Set())
    setTerminalLogs([
      `── Level Reset ──`,
      `🎯 ${activeLevel.objective}`,
      'Try again. Good luck!'
    ])
  }

  const cheatsheetSections = isSandbox
    ? [
        ...CHEATSHEET,
        {
          id: 'sandbox-fs',
          label: '📂 Sandbox File System',
          commands: [
            { cmd: 'touch <file>', desc: 'Create a new untracked file' },
            { cmd: 'edit <file>', desc: 'Modify/dirty an existing file' },
            { cmd: 'rm <file>', desc: 'Remove a file from working directory' },
            { cmd: 'echo "text" > <file>', desc: 'Write text content to a file' }
          ]
        }
      ]
    : CHEATSHEET

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      className="responsive-grid-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 380px) 1fr',
        height: 'calc(100vh - var(--nav-height))',
        overflow: 'hidden',
        background: 'var(--bg-primary)'
      }}
    >
      {/* Mobile Tab Switcher */}
      <div
        className="mobile-tabs-container"
        style={{
          display: 'none',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          height: 48,
          alignItems: 'center',
          justifyContent: 'stretch',
          flexShrink: 0,
          zIndex: 10
        }}
      >
        <button
          onClick={() => setActiveMobileTab('info')}
          style={{
            flex: 1,
            height: '100%',
            border: 'none',
            background: activeMobileTab === 'info' ? 'rgba(124, 58, 237, 0.08)' : 'none',
            color: activeMobileTab === 'info' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderBottom: activeMobileTab === 'info' ? '2px solid var(--accent)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <BookOpen size={14} />
          Quest Info & Ref
        </button>
        <button
          onClick={() => setActiveMobileTab('workspace')}
          style={{
            flex: 1,
            height: '100%',
            border: 'none',
            background: activeMobileTab === 'workspace' ? 'rgba(124, 58, 237, 0.08)' : 'none',
            color: activeMobileTab === 'workspace' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderBottom: activeMobileTab === 'workspace' ? '2px solid var(--accent)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Terminal size={14} />
          Live Workspace
        </button>
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="git-game-sidebar" style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          flexShrink: 0
        }}>
          {/* Row 1: Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-syne)', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
              Git Master Quest
            </h1>
          </div>

          {/* Row 2: Stats & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            {/* Left: Progress & XP badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {completedLevels.length === GAME_LEVELS.length ? (
                <p 
                  onClick={() => {
                    setShowQuestCompleteModal(true)
                    setTriggerConfetti(true)
                  }}
                  style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--accent-soft)', 
                    margin: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 700
                  }}
                >
                  🏆 Certificate
                </p>
              ) : (
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                  {completedLevels.length}/{GAME_LEVELS.length} Done
                </p>
              )}

              {/* XP Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 20, padding: '3px 8px'
              }}>
                <Star size={11} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.72rem' }}>{xp} XP</span>
              </div>
            </div>

            {/* Right: Sandbox toggle & Reset button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Sandbox toggle */}
              <button
                onClick={() => setIsSandbox(!isSandbox)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  border: '1px solid var(--border-mid)',
                  background: isSandbox ? 'var(--bg-elevated)' : 'hsl(270,75%,55%,0.12)',
                  borderColor: isSandbox ? 'var(--border-mid)' : 'var(--border-accent)',
                  color: isSandbox ? 'var(--text-secondary)' : 'var(--accent)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                {isSandbox ? '🎮 Play Quest' : '🧪 Sandbox'}
              </button>

              {/* Reset Quest Button */}
              <button
                title="Reset Quest Progress"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all your quest progress? This will clear your XP and completed levels.')) {
                    setXp(0)
                    setCompletedLevels([])
                    setLevelIndex(0)
                    setIsSandbox(false)
                    setShowQuestCompleteModal(false)
                    setTriggerConfetti(false)
                    localStorage.removeItem('git-game-xp')
                    localStorage.removeItem('git-game-completed')
                    setGitState(JSON.parse(JSON.stringify(GAME_LEVELS[0].initialState)))
                    setTerminalLogs([
                      `── Level 1: ${GAME_LEVELS[0].title} ──`,
                      `🎯 ${GAME_LEVELS[0].objective}`,
                      '',
                      GAME_LEVELS[0].instructions,
                      '',
                      'Type commands below or click Quick Play buttons. Good luck!'
                    ])
                    setIsCompleted(false)
                    setCommandsUsed(new Set())
                  }
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '1px solid var(--border-mid)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  outline: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#f87171'
                  e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)'
                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.borderColor = 'var(--border-mid)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <RotateCcw size={11} />
              </button>
            </div>
          </div>

          {/* Tier Progress */}
          {!isSandbox && (
            <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
              <TierProgress
                tiers={TIERS}
                levels={GAME_LEVELS}
                levelIndex={levelIndex}
                completedLevels={completedLevels}
                isSandbox={isSandbox}
                onSelectLevel={(idx) => {
                  setIsSandbox(false)
                  setLevelIndex(idx)
                  setActiveMobileTab('workspace')
                }}
              />
            </div>
          )}
        </div>

        {/* Level Select dropdown */}
        {!isSandbox && (
          <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              JUMP TO LEVEL
            </label>
            <LevelSelector
              levels={GAME_LEVELS}
              currentIndex={levelIndex}
              completedLevels={completedLevels}
              onChange={(idx) => {
                setIsSandbox(false)
                setLevelIndex(idx)
                setActiveMobileTab('workspace')
              }}
            />
          </div>
        )}

        {/* Level Details or Sandbox Info */}
        <div style={{ padding: '16px 20px', flexShrink: 0 }}>
          {!isSandbox ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Tier badge + objective */}
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: `${currentTier?.color}22`, color: currentTier?.color,
                    border: `1px solid ${currentTier?.color}44`
                  }}>
                    {currentTier?.emoji} {currentTier?.name}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: 'rgba(124,58,237,0.1)', color: 'var(--accent)',
                    border: '1px solid rgba(124,58,237,0.2)'
                  }}>
                    Level {activeLevel.id} of {GAME_LEVELS.length}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4, margin: 0 }}>
                  {activeLevel.objective}
                </h3>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {activeLevel.description}
              </p>

              {/* Instructions */}
              <div style={{
                background: 'rgba(124,58,237,0.04)', border: '1px solid var(--border-subtle)',
                borderLeft: '3px solid var(--accent)', borderRadius: 10, padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <BookOpen size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>INSTRUCTIONS</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {activeLevel.instructions}
                </p>
              </div>

              {/* Hint accordion */}
              <div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none',
                    color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', padding: 0
                  }}
                >
                  <HelpCircle size={13} />
                  {showHint ? 'Hide Hint' : 'Need a hint?'}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}
                    >
                      <p style={{
                        fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 8,
                        padding: '10px 12px', background: 'var(--bg-secondary)',
                        borderRadius: 8, borderLeft: '3px solid var(--accent)', lineHeight: 1.6, margin: '8px 0 0'
                      }}>
                        💡 {activeLevel.hint}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Play Level Button */}
              <button
                className="mobile-play-level-btn"
                onClick={() => setActiveMobileTab('workspace')}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--accent), hsl(270,75%,60%))',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s',
                  marginTop: 10,
                  outline: 'none'
                }}
              >
                <Terminal size={15} />
                Start Level {activeLevel.id}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} style={{ color: '#a855f7' }} />
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Sandbox Playground</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Free-roam mode. Test any command — branch, rebase, cherry-pick, stash, tag, remote. No goals, no pressure. Use it to understand complex workflows visually.
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Type <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4, color: 'var(--accent-soft)' }}>reset</code> to restore a fresh repo.
              </p>

              {/* Mobile Open Sandbox Terminal Button */}
              <button
                className="mobile-play-level-btn"
                onClick={() => setActiveMobileTab('workspace')}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--accent), hsl(270,75%,60%))',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s',
                  marginTop: 14,
                  outline: 'none'
                }}
              >
                <Terminal size={15} />
                Open Sandbox Terminal
              </button>
            </div>
          )}
        </div>

        {/* Expandable Cheatsheet */}
        <div style={{
          marginTop: 'auto', borderTop: '1px solid var(--border-subtle)',
          padding: '14px 20px 20px', flexShrink: 0
        }}>
          <h4 style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 6 }}>
            GIT REFERENCE
          </h4>
          <CheatSheet
            sections={cheatsheetSections}
            onRunCommand={handleCommandSubmit}
          />
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────── */}
      <section className="git-game-main" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* Level Complete Banner — slides in above visualizer, NOT as overlay */}
        <LevelBanner
          isCompleted={isCompleted}
          isSandbox={isSandbox}
          activeLevel={activeLevel}
          levelIndex={levelIndex}
          totalLevels={GAME_LEVELS.length}
          xp={xp}
          xpPerLevel={XP_PER_LEVEL}
          completedLevels={completedLevels}
          onRestart={restartLevel}
          onNext={loadNextLevel}
          onDismiss={() => setIsCompleted(false)}
        />

        {/* SVG Commit Graph — fills remaining space */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
          <GitVisualizer gitState={gitState} />
        </div>

        {/* Terminal Console — fixed height at bottom */}
        <div className="git-game-terminal" style={{
          height: '290px', flexShrink: 0,
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Terminal Title Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px', background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-subtle)', flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Terminal size={13} style={{ color: 'var(--accent)' }} />
              <span>TERMINAL</span>
              <span style={{ color: 'var(--border-mid)' }}>|</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                {isSandbox ? 'sandbox mode' : `level ${activeLevel.id} / ${GAME_LEVELS.length}`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleCommandSubmit('reset')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <RefreshCw size={11} /> Reset Repo
              </button>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <button
                onClick={() => handleCommandSubmit('clear')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.68rem', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Play buttons */}
          <div style={{
            display: 'flex', gap: 6, padding: '6px 14px',
            background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto', flexShrink: 0, alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>QUICK:</span>
            {quickActions.map(action => (
              <button
                key={action}
                onClick={() => handleCommandSubmit(action)}
                style={{
                  padding: '3px 9px', borderRadius: 5, flexShrink: 0,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-soft)', fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                }}
              >
                {action}
              </button>
            ))}
          </div>

          {/* Terminal Log Output */}
          <div
            ref={logsContainerRef}
            style={{
              flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 16px',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
              lineHeight: 1.55, color: 'var(--text-primary)', cursor: 'text'
            }}
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
          >
            {terminalLogs.map((line, i) => {
              let displayLog = line
              let color = 'var(--text-secondary)'

              if (line.startsWith('\n$'))        { color = 'var(--accent)' }
              else if (line.startsWith('\tred:'))   { displayLog = line.substring(5); color = '#ef4444' }
              else if (line.startsWith('\tgreen:')) { displayLog = line.substring(7); color = '#10b981' }
              else if (line.includes('fatal:') || line.includes('error:')) { color = '#ef4444' }
              else if (line.includes('──'))       { color = 'var(--text-muted)' }

              return (
                <div key={i} style={{ whiteSpace: 'pre-wrap', color }}>
                  {displayLog}
                </div>
              )
            })}
          </div>

          {/* Shell Input Prompt */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-subtle)', flexShrink: 0
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#10b981', fontWeight: 700, userSelect: 'none', flexShrink: 0 }}>
              ~/repo$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {}}
              placeholder="Type a git command…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem', minHeight: '22px'
              }}
              autoFocus
            />
          </div>
        </div>
      </section>

      {/* Responsive styles */}
      <style jsx global>{`
        .responsive-grid-layout {
          grid-template-columns: minmax(300px, 380px) 1fr;
        }
        @media (max-width: 860px) {
          .responsive-grid-layout {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto 1fr !important;
            height: calc(100vh - var(--nav-height)) !important;
          }
          .mobile-tabs-container {
            display: flex !important;
          }
          .git-game-sidebar {
            display: ${activeMobileTab === 'info' ? 'flex' : 'none'} !important;
            width: 100% !important;
            max-width: 100% !important;
            border-right: none !important;
            height: 100% !important;
          }
          .git-game-main {
            display: ${activeMobileTab === 'workspace' ? 'flex' : 'none'} !important;
            width: 100% !important;
            height: 100% !important;
          }
          .git-game-terminal {
            height: 230px !important;
          }
          .mobile-play-level-btn {
            display: flex !important;
          }
        }
      `}</style>

      {/* Confetti Animation */}
      {triggerConfetti && <Confetti active={true} />}

      {/* Quest Completion Modal */}
      <AnimatePresence>
        {showQuestCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5, 5, 10, 0.75)',
              backdropFilter: 'blur(16px)',
              padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                width: '100%',
                maxWidth: 480,
                background: 'rgba(20, 15, 30, 0.7)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: 24,
                padding: '40px 32px',
                textAlign: 'center',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-dm)',
                position: 'relative',
                animation: 'floatGlowCard 6s ease-in-out infinite',
                backdropFilter: 'blur(30px)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Trophy Icon */}
              <div style={{
                position: 'relative',
                width: 100,
                height: 100,
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
              }}>
                <Trophy size={60} style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))' }} />
              </div>

              {/* Congratulations Header */}
              <h2 style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '1.8rem',
                fontWeight: 800,
                marginBottom: 8,
                background: 'linear-gradient(135deg, #f59e0b 0%, #a855f7 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em'
              }}>
                Quest Conquered!
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.55 }}>
                Congratulations, Git Master! You've navigated through commits, branching, stashes, rebases, and advanced recovery tools. Your local Git mastery is complete!
              </p>

              {/* Stats Panel */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 32
              }}>
                <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: 8 }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>XP Earned</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Star size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    {xp} XP
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Levels Conquered</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                    18 / 18
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => {
                    setIsSandbox(true)
                    setShowQuestCompleteModal(false)
                    setTriggerConfetti(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 12,
                    background: 'var(--gradient-purple)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                >
                  🧪 Enter Sandbox Playground
                </button>
                
                <button
                  onClick={() => {
                    setShowQuestCompleteModal(false)
                    setTriggerConfetti(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 20px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    border: '1px solid var(--border-mid)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                >
                  🔍 Close & Review Board
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all your quest progress and start again? This will clear all your XP.')) {
                      setXp(0)
                      setCompletedLevels([])
                      setLevelIndex(0)
                      setIsSandbox(false)
                      setShowQuestCompleteModal(false)
                      setTriggerConfetti(false)
                      localStorage.removeItem('git-game-xp')
                      localStorage.removeItem('git-game-completed')
                      setGitState(JSON.parse(JSON.stringify(GAME_LEVELS[0].initialState)))
                      setTerminalLogs([
                        `── Level 1: ${GAME_LEVELS[0].title} ──`,
                        `🎯 ${GAME_LEVELS[0].objective}`,
                        '',
                        GAME_LEVELS[0].instructions,
                        '',
                        'Type commands below or click Quick Play buttons. Good luck!'
                      ])
                      setIsCompleted(false)
                      setCommandsUsed(new Set())
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    opacity: 0.8,
                    marginTop: 10,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
                >
                  🔄 Reset Progress & Replay Quest
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
