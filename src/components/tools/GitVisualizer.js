'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GitVisualizer({ gitState }) {
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  
  // 1. Assign branch tracks
  const branchTracks = {}
  let trackCounter = 0
  
  // Ensure main is always on track 0
  branchTracks['main'] = 0
  
  // Sort branches to keep tracking stable
  const sortedBranches = Object.keys(gitState.branches).sort((a, b) => {
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
      const parent = gitState.commits[commit.parents[0]];
      if (parent) return getCommitTrack(parent);
    }
    return 0;
  };

  // 2. Parse commits in sequential/chronological order to assign columns (horizontal positions)
  // Commits keys are in format "C0", "C1", "C2", etc.
  const commitList = Object.keys(gitState.commits)
    .sort((a, b) => {
      const aNum = parseInt(a.substring(1));
      const bNum = parseInt(b.substring(1));
      return aNum - bNum;
    })
    .map((id, index) => {
      const commit = gitState.commits[id];
      const track = getCommitTrack(commit);
      return {
        ...commit,
        col: index,
        track,
        x: 60 + index * 100, // X-coordinate
        y: 100 + track * 80,  // Y-coordinate
      };
    });

  // Create a fast lookup map for coordinates
  const coordMap = {};
  commitList.forEach(c => {
    coordMap[c.id] = { x: c.x, y: c.y, track: c.track };
  });

  // Calculate active commit ID
  const activeCommitId = gitState.branches[gitState.head] || gitState.head;

  // Track size of visualizer to fit SVG viewbox
  const maxCol = commitList.length > 0 ? commitList[commitList.length - 1].col : 0;
  const maxTrack = Math.max(...commitList.map(c => c.track), 0);
  const svgWidth = Math.max(700, 150 + maxCol * 100);
  const svgHeight = Math.max(300, 180 + maxTrack * 80);

  // Group branch labels by the commit they point to
  const labelsByCommit = {};
  Object.keys(gitState.branches).forEach(branchName => {
    const commitId = gitState.branches[branchName];
    if (!labelsByCommit[commitId]) {
      labelsByCommit[commitId] = [];
    }
    labelsByCommit[commitId].push({
      type: 'branch',
      name: branchName,
      isActive: gitState.head === branchName
    });
  });

  // If HEAD is detached, add detached label directly to the target commit
  if (!gitState.branches[gitState.head]) {
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

  // Scroll to the latest commit when new commits are created
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [gitState.commits]);

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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
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
                    r={26}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth={2}
                    opacity={0.4}
                    style={{
                      animation: 'pulseGlow 2s ease-in-out infinite',
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
                  const labelYOffset = commit.y + 28 + labelIndex * 28;
                  const labelColor = label.isActive ? 'var(--accent)' : 'var(--border-mid)';
                  const isHead = label.type === 'head-detached' || (label.isActive && gitState.head === label.name);

                  return (
                    <g key={`label-${commit.id}-${label.name}`} style={{ transition: 'all 0.3s' }}>
                      {/* Connection indicator line */}
                      {labelIndex === 0 && (
                        <line
                          x1={commit.x}
                          y1={commit.y + (commit.id === activeCommitId ? 18 : 14)}
                          x2={commit.x}
                          y2={commit.y + 28}
                          stroke="var(--text-muted)"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Label Pill Box */}
                      <rect
                        x={commit.x - 45}
                        y={labelYOffset}
                        width={90}
                        height={20}
                        rx={6}
                        fill={isHead ? 'var(--accent)' : 'var(--bg-elevated)'}
                        stroke={label.isActive ? 'var(--text-primary)' : 'var(--border-subtle)'}
                        strokeWidth={1}
                        style={{ filter: isHead ? 'drop-shadow(0 2px 8px rgba(124, 58, 237, 0.4))' : 'none' }}
                      />

                      {/* Label text */}
                      <text
                        x={commit.x}
                        y={labelYOffset + 14}
                        textAnchor="middle"
                        fill={isHead ? '#ffffff' : 'var(--text-secondary)'}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          userSelect: 'none'
                        }}
                      >
                        {label.name.length > 12 ? `${label.name.substring(0, 10)}..` : label.name}
                      </text>

                      {/* HEAD visual indicator arrow if this is a checked out branch pointer */}
                      {label.isActive && label.type === 'branch' && (
                        <g>
                          {/* HEAD pill above the branch label */}
                          <rect
                            x={commit.x - 30}
                            y={labelYOffset + 24}
                            width={60}
                            height={16}
                            rx={4}
                            fill="var(--text-primary)"
                            stroke="var(--border-mid)"
                            strokeWidth={1}
                          />
                          <text
                            x={commit.x}
                            y={labelYOffset + 35}
                            textAnchor="middle"
                            fill="var(--bg-primary)"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.55rem',
                              fontWeight: 900,
                              userSelect: 'none'
                            }}
                          >
                            HEAD
                          </text>
                          {/* Connector arrow */}
                          <line
                            x1={commit.x}
                            y1={labelYOffset + 20}
                            x2={commit.x}
                            y2={labelYOffset + 24}
                            stroke="var(--text-primary)"
                            strokeWidth={1.5}
                          />
                        </g>
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
