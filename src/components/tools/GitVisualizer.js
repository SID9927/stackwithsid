'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GitVisualizer({ gitState }) {
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  // Scroll to the latest commit when new commits are created
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [gitState.commits]);
  
  // 1. Render empty state if repository is not initialized
  if (!gitState.initialized) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-syne)',
        padding: 24,
        textAlign: 'center',
        minHeight: '300px',
        width: '100%'
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'rgba(124, 58, 237, 0.05)',
          border: '1px dashed var(--border-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, fontSize: '1.5rem'
        }}>
          📁
        </div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>Local Directory Not Initialized</h3>
        <p style={{ fontSize: '0.85rem', maxWidth: 320, marginTop: 6, lineHeight: 1.5 }}>
          Before tracking changes, you must initialize Git. Type <code style={{ color: 'var(--accent-soft)', background: 'var(--bg-card)', padding: '3px 8px', borderRadius: 6, fontFamily: 'var(--font-mono)' }}>git init</code> below to start!
        </p>
      </div>
    )
  }

  const commits = gitState.commits || {};
  const branches = gitState.branches || {};
  const commitKeys = Object.keys(commits);

  // 2. Render Interactive Staging Area pipeline diagram if there are 0 commits in the tree
  if (commitKeys.length === 0) {
    const stagedFiles = gitState.stagingArea || [];
    const unstagedFiles = Object.keys(gitState.workingDirectory || {}).filter(f => !stagedFiles.includes(f));

    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        padding: '24px',
        minHeight: '320px',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-dm)'
      }}>
        {/* Pipeline Layout */}
        <>
          <style jsx>{`
            .git-pipeline-container {
              display: flex;
              gap: 24px;
              width: 100%;
              max-width: 800px;
              justify-content: center;
              align-items: stretch;
              user-select: none;
            }
            .git-pipeline-card {
              flex: 1;
              min-width: 220px;
            }
            .git-pipeline-card-dashed {
              flex: 1;
              min-width: 200px;
            }
            .git-pipeline-arrow-horizontal {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: var(--text-muted);
              gap: 4px;
            }
            .git-pipeline-arrow-vertical {
              display: none;
            }
            @media (max-width: 768px) {
              .git-pipeline-container {
                flex-direction: column !important;
                align-items: center !important;
                gap: 16px !important;
                padding-bottom: 24px;
              }
              .git-pipeline-card, .git-pipeline-card-dashed {
                width: 100% !important;
                min-width: 0 !important;
              }
              .git-pipeline-arrow-horizontal {
                display: none !important;
              }
              .git-pipeline-arrow-vertical {
                display: flex !important;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: var(--text-muted);
                gap: 4px;
                margin: 4px 0;
              }
            }
          `}</style>

          <div className="git-pipeline-container">
            
            {/* Column 1: Working Directory */}
            <div className="git-pipeline-card glass-card" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.02)', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                📁 Working Directory
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {unstagedFiles.length > 0 ? (
                  unstagedFiles.map(file => {
                    const status = gitState.workingDirectory[file];
                    return (
                      <motion.div 
                        layoutId={`file-${file}`}
                        key={file} 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontFamily: 'var(--font-mono)', 
                          padding: '8px 12px', 
                          background: 'rgba(239, 68, 68, 0.08)',
                          borderRadius: 8,
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{file}</span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.8, background: 'rgba(239, 68, 68, 0.2)', padding: '2px 6px', borderRadius: 4 }}>{status}</span>
                      </motion.div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                    No untracked changes
                  </div>
                )}
              </div>
            </div>

            {/* Staging arrow (Horizontal) */}
            <div className="git-pipeline-arrow-horizontal">
              <span style={{ fontSize: '1.2rem' }}>➡️</span>
              <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>git add</span>
            </div>
            {/* Staging arrow (Vertical) */}
            <div className="git-pipeline-arrow-vertical">
              <span style={{ fontSize: '1.2rem' }}>⬇️</span>
              <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>git add</span>
            </div>

            {/* Column 2: Staging Area */}
            <div className="git-pipeline-card glass-card" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.02)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                🟢 Staging Area (Index)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stagedFiles.length > 0 ? (
                  stagedFiles.map(file => (
                    <motion.div 
                      layoutId={`file-${file}`}
                      key={file} 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontFamily: 'var(--font-mono)', 
                        padding: '8px 12px', 
                        background: 'rgba(16, 185, 129, 0.08)',
                        borderRadius: 8,
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{file}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: 4 }}>
                        staged <span style={{ fontWeight: 'bold' }}>✓</span>
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0', lineHeight: 1.5 }}>
                    Staging area is empty.<br />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Type `git add` to stage files.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Commit arrow (Horizontal) */}
            <div className="git-pipeline-arrow-horizontal">
              <span style={{ fontSize: '1.2rem' }}>➡️</span>
              <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>git commit</span>
            </div>
            {/* Commit arrow (Vertical) */}
            <div className="git-pipeline-arrow-vertical">
              <span style={{ fontSize: '1.2rem' }}>⬇️</span>
              <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>git commit</span>
            </div>

            {/* Column 3: Commit history empty indicator */}
            <div className="git-pipeline-card-dashed glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderColor: 'var(--border-mid)' }}>
              <div style={{ 
                width: 44, height: 44, borderRadius: '50%', 
                border: '2px dashed var(--accent)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                marginBottom: 12
              }}>
                C0
              </div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 6, fontWeight: 700 }}>Git History</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                {stagedFiles.length > 0 ? (
                  <span style={{ color: 'var(--accent-soft)', fontWeight: 600 }}>
                    Staged changes ready!<br/>Run `git commit -m "..."`
                  </span>
                ) : (
                  <span>Unborn branch `main`. No commits recorded yet.</span>
                )}
              </p>
            </div>

          </div>
        </>
      </div>
    )
  }

  // 3. Render Commit Tree SVG Graph
  // Assign branch tracks
  const branchTracks = {}
  let trackCounter = 0
  
  // Ensure main is always on track 0
  branchTracks['main'] = 0
  
  // Sort branches to keep tracking stable
  const sortedBranches = Object.keys(branches).sort((a, b) => {
    if (a === 'main') return -1;
    if (b === 'main') return 1;
    return a.localeCompare(b);
  });

  sortedBranches.forEach(branch => {
    if (branch !== 'main') {
      trackCounter++;
      branchTracks[branch] = trackCounter;
    }
  });

  // Helper to determine the track index of a commit
  const getCommitTrack = (commit) => {
    if (commit.branch && branchTracks[commit.branch] !== undefined) {
      return branchTracks[commit.branch];
    }
    // Fallback: search parents
    if (commit.parents && commit.parents[0]) {
      const parent = commits[commit.parents[0]];
      if (parent) return getCommitTrack(parent);
    }
    return 0;
  };

  // Parse commits in sequential/chronological order to assign columns (horizontal positions)
  const commitList = commitKeys
    .sort((a, b) => {
      const aNum = parseInt(a.substring(1));
      const bNum = parseInt(b.substring(1));
      return aNum - bNum;
    })
    .map((id, index) => {
      const commit = commits[id];
      const track = getCommitTrack(commit);
      return {
        ...commit,
        col: index,
        track,
        x: 60 + index * 100, // X-coordinate
        y: 80 + track * 110,  // Y-coordinate
      };
    });

  // Create a fast lookup map for coordinates
  const coordMap = {};
  commitList.forEach(c => {
    coordMap[c.id] = { x: c.x, y: c.y, track: c.track };
  });

  // Calculate active commit ID
  const activeCommitId = branches[gitState.head] || gitState.head;

  // Track size of visualizer to fit SVG viewbox
  const maxCol = commitList.length > 0 ? commitList[commitList.length - 1].col : 0;
  const maxTrack = Math.max(...commitList.map(c => c.track), 0);
  const svgWidth = Math.max(700, 150 + maxCol * 100);
  const svgHeight = Math.max(300, 180 + maxTrack * 110);

  // Group branch labels by the commit they point to
  const labelsByCommit = {};
  Object.keys(branches).forEach(branchName => {
    const commitId = branches[branchName];
    if (!commitId) return; // Skip branches not created yet
    if (!labelsByCommit[commitId]) {
      labelsByCommit[commitId] = [];
    }
    labelsByCommit[commitId].push({
      type: 'branch',
      name: branchName,
      isActive: gitState.head === branchName
    });
  });

  // Add remote origin branches labels if they exist
  if (gitState.remoteBranches) {
    Object.keys(gitState.remoteBranches).forEach(branchName => {
      const commitId = gitState.remoteBranches[branchName];
      if (!commitId || !commits[commitId]) return;
      if (!labelsByCommit[commitId]) {
        labelsByCommit[commitId] = [];
      }
      const existing = labelsByCommit[commitId].find(l => l.name === `origin/${branchName}`);
      if (!existing) {
        labelsByCommit[commitId].push({
          type: 'remote-branch',
          name: `origin/${branchName}`,
          isActive: false
        });
      }
    });
  }

  // Add tag labels from gitState.tags
  if (gitState.tags) {
    Object.entries(gitState.tags).forEach(([tagName, commitId]) => {
      if (!commitId || !commits[commitId]) return;
      if (!labelsByCommit[commitId]) {
        labelsByCommit[commitId] = [];
      }
      const existing = labelsByCommit[commitId].find(l => l.name === tagName && l.type === 'tag');
      if (!existing) {
        labelsByCommit[commitId].push({
          type: 'tag',
          name: tagName,
          isActive: false
        });
      }
    });
  }

  // If HEAD is detached and resolved, add detached label directly to the target commit
  if (gitState.head && !branches[gitState.head] && commits[gitState.head]) {
    const detachedCommitId = gitState.head;
    if (!labelsByCommit[detachedCommitId]) {
      labelsByCommit[detachedCommitId] = [];
    }
    labelsByCommit[detachedCommitId].push({
      type: 'head-detached',
      name: 'HEAD (detached)',
      isActive: true
    });
  }

  // Color palette for branches
  const getBranchColor = (track) => {
    const colors = [
      'var(--accent)',        // Main track: purple
      '#06b6d4',             // Cyan
      '#ec4899',             // Pink
      '#f59e0b',             // Orange
      '#10b981',             // Emerald
      '#8b5cf6',             // Purple
    ];
    return colors[track % colors.length];
  };

  // Compact floating file status badges
  const stagedCount = gitState.stagingArea?.length || 0;
  const unstagedCount = Object.keys(gitState.workingDirectory || {}).filter(f => !gitState.stagingArea?.includes(f)).length;
  const stashCount = gitState.stash?.length || 0;
  const tagCount = Object.keys(gitState.tags || {}).length;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* File Status Overlay Indicators */}
      {(stagedCount > 0 || unstagedCount > 0 || stashCount > 0 || tagCount > 0) && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(15, 15, 25, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 5,
          boxShadow: 'var(--shadow-card)',
          width: 200
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {stagedCount > 0 && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span> {stagedCount} staged</span>}
            {unstagedCount > 0 && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span> {unstagedCount} modified</span>}
            {stashCount > 0 && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}></span> {stashCount} stash{stashCount > 1 ? 'es' : ''}</span>}
            {tagCount > 0 && <span style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: '0.6rem' }}>🏷️</span> {tagCount} tag{tagCount > 1 ? 's' : ''}</span>}
          </div>
          {stashCount > 0 && (
            <div style={{
              paddingTop: 6,
              borderTop: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              color: 'var(--text-muted)',
              fontSize: '0.62rem'
            }}>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>📦 Stashed State:</span>
              {gitState.stash.map((s, idx) => (
                <div key={idx} style={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  stash@&#123;{idx}&#125;: {s.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          padding: '24px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'relative',
          scrollBehavior: 'smooth',
          userSelect: 'none'
        }}
      >
        <svg 
          width={svgWidth} 
          height={svgHeight}
          style={{ overflow: 'visible', transition: 'width 0.3s ease' }}
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-glow)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines helper */}
          {Array.from({ length: Math.ceil(svgWidth / 100) }).map((_, i) => (
            <line 
              key={`grid-${i}`}
              x1={60 + i * 100}
              y1={20}
              x2={60 + i * 100}
              y2={svgHeight - 20}
              stroke="var(--border-subtle)"
              strokeWidth={1}
              strokeDasharray="4 8"
              opacity={0.3}
            />
          ))}

          {/* Connector Paths (Arrows between parent and child commits) */}
          {commitList.map(commit => {
            if (!commit.parents || commit.parents.length === 0) return null;
            return commit.parents.map(parentId => {
              const parent = coordMap[parentId];
              if (!parent) return null;

              const startX = parent.x;
              const startY = parent.y;
              const endX = commit.x;
              const endY = commit.y;

              const pathId = `${parentId}-${commit.id}`;
              const strokeColor = getBranchColor(commit.track);

              // Smooth curve if switching tracks
              if (startY !== endY) {
                const controlX1 = startX + 40;
                const controlY1 = startY;
                const controlX2 = endX - 40;
                const controlY2 = endY;
                return (
                  <g key={pathId}>
                    <path
                      d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={3}
                      strokeLinecap="round"
                      opacity={0.7}
                      style={{ transition: 'all 0.3s' }}
                    />
                  </g>
                );
              }

              // Straight line if on same track
              return (
                <line
                  key={pathId}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={strokeColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.8}
                  style={{ transition: 'all 0.3s' }}
                />
              );
            });
          })}

          {/* Render Commit Nodes */}
          {commitList.map(commit => {
            const isCurrent = commit.id === activeCommitId;
            const nodeColor = getBranchColor(commit.track);

            return (
              <g 
                key={commit.id} 
                className="commit-node"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const scrollContainer = containerRef.current.getBoundingClientRect();
                  setTooltip({
                    id: commit.id,
                    message: commit.message,
                    branch: commit.branch,
                    parents: commit.parents.join(', ') || 'none',
                    x: rect.left - scrollContainer.left + containerRef.current.scrollLeft + 15,
                    y: rect.top - scrollContainer.top - 100
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Active node pulsing background glow */}
                {isCurrent && (
                  <circle
                    cx={commit.x}
                    cy={commit.y}
                    r={22}
                    fill="none"
                    stroke={nodeColor}
                    style={{
                      animation: 'pulseSvgGlow 2s ease-in-out infinite',
                    }}
                  />
                )}

                {/* Commit outer border */}
                <circle
                  cx={commit.x}
                  cy={commit.y}
                  r={isCurrent ? 18 : 14}
                  fill="var(--bg-card)"
                  stroke={isCurrent ? 'var(--text-primary)' : nodeColor}
                  strokeWidth={3}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Commit inner dot */}
                <circle
                  cx={commit.x}
                  cy={commit.y}
                  r={isCurrent ? 8 : 6}
                  fill={nodeColor}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Commit label text (e.g. C0, C1) */}
                <text
                  x={commit.x}
                  y={commit.y - (isCurrent ? 26 : 22)}
                  textAnchor="middle"
                  fill={isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: isCurrent ? '0.85rem' : '0.75rem',
                    fontWeight: isCurrent ? 700 : 500,
                    userSelect: 'none'
                  }}
                >
                  {commit.id}
                </text>
              </g>
            );
          })}

          {/* Render Branch & HEAD Pointer Labels */}
          {commitList.map(commit => {
            const labels = labelsByCommit[commit.id];
            if (!labels || labels.length === 0) return null;

            return (
              <g key={`labels-${commit.id}`}>
                {labels.map((label, labelIndex) => {
                  const labelYOffset = commit.y + 24 + labelIndex * 22;
                  const labelColor = label.isActive ? 'var(--accent)' : 'var(--border-mid)';
                  const isHead = label.type === 'head-detached' || (label.isActive && gitState.head === label.name);
                  const isRemote = label.type === 'remote-branch';
                  const isTag = label.type === 'tag';

                  // Format the display name
                  let displayName = label.name;
                  if (label.isActive && label.type === 'branch') {
                    displayName = `* ${label.name}`; // Prefix checked out branch with *
                  }

                  return (
                    <g key={`label-${commit.id}-${label.name}`} style={{ transition: 'all 0.3s' }}>
                      {/* Connection indicator line */}
                      {labelIndex === 0 && (
                        <line
                          x1={commit.x}
                          y1={commit.y + (commit.id === activeCommitId ? 18 : 14)}
                          x2={commit.x}
                          y2={commit.y + 24}
                          stroke="var(--text-muted)"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                        />
                      )}

                      {isTag ? (
                        <>
                          <rect
                            x={commit.x - 38}
                            y={labelYOffset}
                            width={76}
                            height={18}
                            rx={4}
                            fill="rgba(167, 139, 250, 0.15)"
                            stroke="#a78bfa"
                            strokeWidth={1}
                          />
                          <text
                            x={commit.x}
                            y={labelYOffset + 13}
                            textAnchor="middle"
                            fill="#c4b5fd"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.58rem',
                              fontWeight: 700,
                              userSelect: 'none'
                            }}
                          >
                            🏷️ {displayName.length > 9 ? displayName.substring(0, 9) + '..' : displayName}
                          </text>
                        </>
                      ) : (
                        <>
                          {/* Label Pill Box */}
                          <rect
                            x={commit.x - 38}
                            y={labelYOffset}
                            width={76}
                            height={18}
                            rx={5}
                            fill={isHead ? 'var(--accent)' : isRemote ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-elevated)'}
                            stroke={isHead ? 'var(--text-primary)' : isRemote ? '#f59e0b' : 'var(--border-subtle)'}
                            strokeWidth={1}
                            style={{ filter: isHead ? 'drop-shadow(0 2px 8px rgba(124, 58, 237, 0.4))' : 'none' }}
                          />

                          {/* Label text */}
                          <text
                            x={commit.x}
                            y={labelYOffset + 13}
                            textAnchor="middle"
                            fill={isHead ? '#ffffff' : isRemote ? '#f59e0b' : 'var(--text-secondary)'}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              letterSpacing: '0.02em',
                              userSelect: 'none'
                            }}
                          >
                            {displayName.length > 11 ? `${displayName.substring(0, 9)}..` : displayName}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                left: tooltip.x,
                top: tooltip.y,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 12,
                padding: '12px 16px',
                zIndex: 10,
                boxShadow: 'var(--shadow-card)',
                width: 220,
                pointerEvents: 'none'
              }}
            >
              <h4 style={{ 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                marginBottom: 6, 
                color: 'var(--accent)',
                fontFamily: 'var(--font-mono)',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 4
              }}>
                Commit: {tooltip.id}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
                <strong>Msg:</strong> "{tooltip.message}"
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                <strong>Branch:</strong> {tooltip.branch || 'detached'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <strong>Parents:</strong> {tooltip.parents}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
