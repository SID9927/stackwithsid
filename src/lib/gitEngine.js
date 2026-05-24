/**
 * Git State Machine & Command Parser Engine
 * Represents a simplified client-side Git repository.
 */

export const createInitialState = (customInit = null) => {
  if (customInit) {
    return JSON.parse(JSON.stringify(customInit));
  }
  return {
    commits: {
      'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' }
    },
    branches: {
      'main': 'C0'
    },
    head: 'main' // Points to branch name 'main', or direct commit ID (detached HEAD)
  };
};

/**
 * Returns a list of ancestor commit IDs for a given commit
 */
const getAncestors = (commitId, commits) => {
  const ancestors = new Set();
  const queue = [commitId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || ancestors.has(current)) continue;
    ancestors.add(current);
    const commit = commits[current];
    if (commit && commit.parents) {
      queue.push(...commit.parents);
    }
  }
  return ancestors;
};

/**
 * Finds the common ancestor of two commits
 */
const findCommonAncestor = (c1Id, c2Id, commits) => {
  const c1Ancestors = getAncestors(c1Id, commits);
  const queue = [c2Id];
  const visited = new Set();
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    if (c1Ancestors.has(current)) {
      return current;
    }
    const commit = commits[current];
    if (commit && commit.parents) {
      queue.push(...commit.parents);
    }
  }
  return null;
};

/**
 * Returns the commits on branch `branchCommitId` that are not in `baseCommitId`'s history
 */
const getCommitsSince = (branchCommitId, baseCommitId, commits) => {
  const baseAncestors = getAncestors(baseCommitId, commits);
  const uniqueCommits = [];
  const visited = new Set();
  const queue = [branchCommitId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current) || baseAncestors.has(current)) continue;
    visited.add(current);
    uniqueCommits.push(current);
    const commit = commits[current];
    if (commit && commit.parents) {
      queue.push(...commit.parents);
    }
  }
  // Reverse to get them in chronological order
  return uniqueCommits.reverse();
};

/**
 * Parse and execute Git commands
 * Returns: { state: nextState, log: Array of terminal output strings }
 */
export const executeGitCommand = (state, cmdString) => {
  const nextState = JSON.parse(JSON.stringify(state));
  const log = [];
  const parts = cmdString.trim().split(/\s+/);

  if (parts[0] !== 'git') {
    log.push(`bash: ${parts[0]}: command not found`);
    return { state, log };
  }

  const sub = parts[1];
  if (!sub) {
    log.push('Usage: git <command> [<args>]');
    return { state, log };
  }

  // Get active commit ID
  const getActiveCommitId = (s) => {
    if (s.branches[s.head]) {
      return s.branches[s.head];
    }
    return s.head; // Detached HEAD
  };

  // Helper to generate next commit ID
  const generateNextCommitId = (s) => {
    let i = 0;
    while (s.commits[`C${i}`]) {
      i++;
    }
    return `C${i}`;
  };

  // Helper to check if a commit exists
  const commitExists = (s, id) => {
    return !!s.commits[id.toUpperCase()];
  };

  const activeCommitId = getActiveCommitId(nextState);

  switch (sub) {
    case 'commit': {
      // Find message option
      let message = 'New commit';
      const mIdx = parts.indexOf('-m');
      if (mIdx !== -1 && parts[mIdx + 1]) {
        // Rejoin message parts in case of spaces if they are not quotes
        const rawMessage = parts.slice(mIdx + 1).join(' ');
        message = rawMessage.replace(/['"]/g, ''); // strip quotes
      }

      const newId = generateNextCommitId(nextState);
      const activeBranchName = nextState.branches[nextState.head] ? nextState.head : null;

      nextState.commits[newId] = {
        id: newId,
        parents: [activeCommitId],
        message,
        branch: activeBranchName || 'detached'
      };

      if (activeBranchName) {
        nextState.branches[activeBranchName] = newId;
      } else {
        nextState.head = newId; // Detached HEAD moves directly
      }

      log.push(`[${activeBranchName || 'detached HEAD'} ${newId}] ${message}`);
      break;
    }

    case 'branch': {
      const branchName = parts[2];
      if (!branchName) {
        // List branches
        Object.keys(nextState.branches).forEach(b => {
          const prefix = nextState.head === b ? '* ' : '  ';
          log.push(`${prefix}${b}`);
        });
        break;
      }

      if (nextState.branches[branchName]) {
        log.push(`fatal: A branch named '${branchName}' already exists.`);
        return { state, log };
      }

      nextState.branches[branchName] = activeCommitId;
      log.push(`Created branch '${branchName}' at ${activeCommitId}`);
      break;
    }

    case 'checkout': {
      const optionOrTarget = parts[2];
      if (!optionOrTarget) {
        log.push('error: pathspec is required');
        return { state, log };
      }

      // Check for checkout -b
      if (optionOrTarget === '-b') {
        const newBranch = parts[3];
        if (!newBranch) {
          log.push('fatal: branch name required');
          return { state, log };
        }
        if (nextState.branches[newBranch]) {
          log.push(`fatal: A branch named '${newBranch}' already exists.`);
          return { state, log };
        }
        nextState.branches[newBranch] = activeCommitId;
        nextState.head = newBranch;
        log.push(`Switched to a new branch '${newBranch}'`);
      } else {
        // target is branch or commit
        const target = optionOrTarget;
        if (nextState.branches[target]) {
          nextState.head = target;
          log.push(`Switched to branch '${target}'`);
        } else if (commitExists(nextState, target)) {
          const upperTarget = target.toUpperCase();
          nextState.head = upperTarget;
          log.push(`Note: switching to '${upperTarget}'.\n\nYou are in 'detached HEAD' state.`);
        } else {
          log.push(`error: pathspec '${target}' did not match any file(s) known to git`);
          return { state, log };
        }
      }
      break;
    }

    case 'merge': {
      const targetBranch = parts[2];
      if (!targetBranch) {
        log.push('fatal: target branch required to merge');
        return { state, log };
      }

      const targetCommitId = nextState.branches[targetBranch];
      if (!targetCommitId) {
        log.push(`merge: ${targetBranch} - not something we can merge`);
        return { state, log };
      }

      if (targetCommitId === activeCommitId) {
        log.push('Already up to date.');
        break;
      }

      const currentBranchName = nextState.branches[nextState.head] ? nextState.head : null;
      if (!currentBranchName) {
        log.push('fatal: You are in detached HEAD state. Cannot merge here.');
        return { state, log };
      }

      // Check if targetCommit is already an ancestor of activeCommit (Already up-to-date)
      const activeAncestors = getAncestors(activeCommitId, nextState.commits);
      if (activeAncestors.has(targetCommitId)) {
        log.push('Already up to date.');
        break;
      }

      // Check for Fast-forward: Is activeCommit an ancestor of targetCommit?
      const targetAncestors = getAncestors(targetCommitId, nextState.commits);
      if (targetAncestors.has(activeCommitId)) {
        // Fast-forward merge
        nextState.branches[currentBranchName] = targetCommitId;
        log.push(`Updating ${activeCommitId}..${targetCommitId}\nFast-forward`);
      } else {
        // Diverged, 3-way merge commit
        const mergeCommitId = generateNextCommitId(nextState);
        nextState.commits[mergeCommitId] = {
          id: mergeCommitId,
          parents: [activeCommitId, targetCommitId],
          message: `Merge branch '${targetBranch}' into ${currentBranchName}`,
          branch: currentBranchName
        };
        nextState.branches[currentBranchName] = mergeCommitId;
        log.push(`Merge made by the 'ort' strategy.\nCreated merge commit ${mergeCommitId}.`);
      }
      break;
    }

    case 'rebase': {
      const targetBranch = parts[2];
      if (!targetBranch) {
        log.push('fatal: target branch required to rebase');
        return { state, log };
      }

      const targetCommitId = nextState.branches[targetBranch] || (commitExists(nextState, targetBranch) ? targetBranch.toUpperCase() : null);
      if (!targetCommitId) {
        log.push(`rebase: ${targetBranch} - invalid rebase target`);
        return { state, log };
      }

      const currentBranchName = nextState.branches[nextState.head] ? nextState.head : null;
      if (!currentBranchName) {
        log.push('fatal: You are in detached HEAD state. Cannot rebase here.');
        return { state, log };
      }

      if (targetCommitId === activeCommitId) {
        log.push(`Current branch ${currentBranchName} is up to date.`);
        break;
      }

      // Find common ancestor
      const commonAncestor = findCommonAncestor(activeCommitId, targetCommitId, nextState.commits);
      if (!commonAncestor) {
        log.push('fatal: No common ancestor found. Cannot rebase.');
        return { state, log };
      }

      if (commonAncestor === targetCommitId) {
        log.push(`Already on top of base commit ${targetCommitId}.`);
        break;
      }

      // Get commits on current branch since common ancestor
      const commitsToCopy = getCommitsSince(activeCommitId, commonAncestor, nextState.commits);

      if (commitsToCopy.length === 0) {
        // Fast-forward rebase
        nextState.branches[currentBranchName] = targetCommitId;
        log.push(`Fast-forwarded ${currentBranchName} to ${targetBranch}`);
        break;
      }

      // Copy commits one by one on top of targetCommitId
      let currentBase = targetCommitId;
      for (const commitId of commitsToCopy) {
        const origCommit = nextState.commits[commitId];
        const newId = generateNextCommitId(nextState);
        nextState.commits[newId] = {
          id: newId,
          parents: [currentBase],
          message: `${origCommit.message} (rebased)`,
          branch: currentBranchName
        };
        currentBase = newId;
      }

      // Update active branch pointer to the last rebased commit
      nextState.branches[currentBranchName] = currentBase;
      log.push(`Successfully rebased and updated refs/heads/${currentBranchName}.`);
      break;
    }

    case 'cherry-pick': {
      const targetCommit = parts[2];
      if (!targetCommit) {
        log.push('fatal: commit ID required to cherry-pick');
        return { state, log };
      }

      const upperTarget = targetCommit.toUpperCase();
      const origCommit = nextState.commits[upperTarget];
      if (!origCommit) {
        log.push(`fatal: bad revision '${targetCommit}'`);
        return { state, log };
      }

      const currentBranchName = nextState.branches[nextState.head] ? nextState.head : null;
      const newId = generateNextCommitId(nextState);

      nextState.commits[newId] = {
        id: newId,
        parents: [activeCommitId],
        message: `${origCommit.message} (cherry-picked)`,
        branch: currentBranchName || 'detached'
      };

      if (currentBranchName) {
        nextState.branches[currentBranchName] = newId;
      } else {
        nextState.head = newId;
      }

      log.push(`[${currentBranchName || 'detached HEAD'} ${newId}] ${origCommit.message}`);
      break;
    }

    case 'reset': {
      let targetRef = parts[2];
      let isHard = false;
      
      if (targetRef === '--hard') {
        isHard = true;
        targetRef = parts[3];
      }

      if (!targetRef) {
        log.push('fatal: commit reference required');
        return { state, log };
      }

      const currentBranchName = nextState.branches[nextState.head] ? nextState.head : null;
      if (!currentBranchName) {
        log.push('fatal: You are in detached HEAD state. Reset is only available on branches in this game.');
        return { state, log };
      }

      // Resolve targetRef (e.g. HEAD~1, HEAD~2, or a commit ID)
      let resolvedCommitId = null;
      if (targetRef.startsWith('HEAD~')) {
        const count = parseInt(targetRef.substring(5));
        if (isNaN(count)) {
          log.push(`fatal: invalid reference '${targetRef}'`);
          return { state, log };
        }
        let current = activeCommitId;
        for (let i = 0; i < count; i++) {
          const commit = nextState.commits[current];
          if (commit && commit.parents && commit.parents[0]) {
            current = commit.parents[0];
          } else {
            current = null;
            break;
          }
        }
        resolvedCommitId = current;
      } else {
        const upperTarget = targetRef.toUpperCase();
        if (nextState.commits[upperTarget]) {
          resolvedCommitId = upperTarget;
        } else if (nextState.branches[targetRef]) {
          resolvedCommitId = nextState.branches[targetRef];
        }
      }

      if (!resolvedCommitId) {
        log.push(`fatal: Cannot resolve target reference '${targetRef}'`);
        return { state, log };
      }

      nextState.branches[currentBranchName] = resolvedCommitId;
      log.push(`HEAD is now at ${resolvedCommitId} ${nextState.commits[resolvedCommitId].message}`);
      break;
    }

    case 'revert': {
      const targetCommit = parts[2];
      if (!targetCommit) {
        log.push('fatal: commit reference required to revert');
        return { state, log };
      }

      const upperTarget = targetCommit.toUpperCase();
      const origCommit = nextState.commits[upperTarget];
      if (!origCommit) {
        log.push(`fatal: bad revision '${targetCommit}'`);
        return { state, log };
      }

      const currentBranchName = nextState.branches[nextState.head] ? nextState.head : null;
      const newId = generateNextCommitId(nextState);

      nextState.commits[newId] = {
        id: newId,
        parents: [activeCommitId],
        message: `Revert "${origCommit.message}"`,
        branch: currentBranchName || 'detached'
      };

      if (currentBranchName) {
        nextState.branches[currentBranchName] = newId;
      } else {
        nextState.head = newId;
      }

      log.push(`[${currentBranchName || 'detached HEAD'} ${newId}] Revert "${origCommit.message}"`);
      break;
    }

    default:
      log.push(`git: '${sub}' is not a git command. See 'git --help'.`);
      break;
  }

  return { state: nextState, log };
};
