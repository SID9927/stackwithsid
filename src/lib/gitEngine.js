/**
 * Git State Machine & Command Parser Engine
 * Represents a simplified client-side Git repository with staging area, files, and remote tracking.
 */

export const createInitialState = (customInit = null) => {
  if (customInit) {
    return JSON.parse(JSON.stringify(customInit));
  }
  return {
    initialized: true,
    commits: {
      'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' }
    },
    branches: {
      'main': 'C0'
    },
    head: 'main', // Points to branch name 'main', or direct commit ID (detached HEAD)
    workingDirectory: {
      'index.html': 'modified',
      'styles.css': 'untracked'
    },
    stagingArea: [],
    remoteBranches: {
      'main': 'C0'
    },
    config: {
      'user.name': 'Dev',
      'user.email': 'hello@dsiddharth.in',
      'core.editor': 'vim',
      'init.defaultBranch': 'main'
    },
    stash: [],       // Array of stash entries: { message, stagingArea, workingDirectory }
    tags: {},        // tag name -> commit ID
    remotes: {       // remote name -> url
      'origin': 'https://github.com/SID9927/stackwithsid.git'
    }
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

  // Handle multi-word commands split properly (preserve quoted args)
  const parseArgs = (str) => {
    const result = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (inQuote) {
        if (ch === quoteChar) {
          inQuote = false;
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      } else if (ch === '"' || ch === "'") {
        inQuote = true;
        quoteChar = ch;
      } else if (ch === ' ' || ch === '\t') {
        if (current) {
          result.push(current);
          current = '';
        }
      } else {
        current += ch;
      }
    }
    if (current) result.push(current);
    return result;
  };

  const parts = parseArgs(cmdString.trim());

  if (parts[0] !== 'git') {
    const shellCmd = parts[0];
    if (shellCmd === 'touch') {
      const fileName = parts[1];
      if (!fileName) {
        log.push('usage: touch <filename>');
        return { state, log };
      }
      nextState.workingDirectory = nextState.workingDirectory || {};
      nextState.workingDirectory[fileName] = 'untracked';
      log.push(`Created untracked file '${fileName}'`);
      return { state: nextState, log };
    }

    if (shellCmd === 'edit') {
      const fileName = parts[1];
      if (!fileName) {
        log.push('usage: edit <filename>');
        return { state, log };
      }
      nextState.workingDirectory = nextState.workingDirectory || {};
      nextState.workingDirectory[fileName] = 'modified';
      log.push(`Modified file '${fileName}'`);
      return { state: nextState, log };
    }

    if (shellCmd === 'echo') {
      const arrowIdx = parts.indexOf('>');
      let fileName = null;
      if (arrowIdx !== -1 && parts[arrowIdx + 1]) {
        fileName = parts[arrowIdx + 1];
      }
      if (!fileName) {
        log.push('usage: echo "content" > <filename>');
        return { state, log };
      }
      nextState.workingDirectory = nextState.workingDirectory || {};
      nextState.workingDirectory[fileName] = 'modified';
      log.push(`Modified file '${fileName}'`);
      return { state: nextState, log };
    }

    if (shellCmd === 'rm') {
      const fileName = parts[1];
      if (!fileName) {
        log.push('usage: rm <filename>');
        return { state, log };
      }
      if (nextState.workingDirectory && nextState.workingDirectory[fileName] !== undefined) {
        delete nextState.workingDirectory[fileName];
        log.push(`Removed file '${fileName}' from working directory.`);
      } else {
        log.push(`\tred:rm: ${fileName}: No such file or directory`);
      }
      return { state: nextState, log };
    }

    log.push(`\tred:bash: ${parts[0]}: command not found`);
    return { state, log };
  }

  const sub = parts[1];
  if (!sub) {
    log.push('Usage: git <command> [<args>]');
    log.push('');
    log.push('These are common Git commands used in various situations:');
    log.push('  init       Create an empty Git repository');
    log.push('  clone      Clone a repository into a new directory');
    log.push('  add        Add file contents to the index');
    log.push('  commit     Record changes to the repository');
    log.push('  status     Show the working tree status');
    log.push('  diff       Show changes between commits');
    log.push('  log        Show commit logs');
    log.push('  branch     List, create, or delete branches');
    log.push('  checkout   Switch branches or restore files');
    log.push('  switch     Switch branches');
    log.push('  merge      Join two or more development histories');
    log.push('  rebase     Reapply commits on top of another base tip');
    log.push('  remote     Manage set of tracked repositories');
    log.push('  fetch      Download objects from remote');
    log.push('  pull       Fetch from remote and integrate');
    log.push('  push       Update remote refs along with associated objects');
    log.push('  stash      Stash the changes in a dirty working directory');
    log.push('  tag        Create, list, delete or verify a tag object');
    log.push('  show       Show various types of objects');
    log.push('  reset      Reset current HEAD to the specified state');
    log.push('  revert     Revert some existing commits');
    log.push('  cherry-pick  Apply the changes introduced by some existing commits');
    log.push('  restore    Restore working tree files');
    log.push('  config     Get and set repository or global options');
    return { state, log };
  }

  // Handle git init first (special case for uninitialized state)
  if (sub === 'init') {
    nextState.initialized = true;
    const dirName = parts[2] || '.';
    if (!nextState.commits || Object.keys(nextState.commits).length === 0) {
      nextState.commits = {};
      nextState.branches = {};
      nextState.head = 'main';
    }
    nextState.workingDirectory = nextState.workingDirectory || {};
    nextState.stagingArea = nextState.stagingArea || [];
    nextState.remoteBranches = nextState.remoteBranches || {};
    nextState.config = nextState.config || {
      'user.name': 'Dev',
      'user.email': 'hello@dsiddharth.in',
      'core.editor': 'vim',
      'init.defaultBranch': 'main'
    };
    nextState.stash = nextState.stash || [];
    nextState.tags = nextState.tags || {};
    nextState.remotes = nextState.remotes || {};
    const path = dirName === '.' ? '/workspace' : `/workspace/${dirName}`;
    log.push(`Initialized empty Git repository in ${path}/.git/`);
    log.push(`hint: Using 'main' as the name for the initial branch. This default branch`);
    log.push(`hint: name is subject to change. To configure the initial branch name to use`);
    log.push(`hint: in all of your new repositories, which will suppress this warning, call:`);
    log.push(`hint:   git config --global init.defaultBranch <name>`);
    return { state: nextState, log };
  }

  // Guard all other commands if not initialized
  if (!nextState.initialized) {
    log.push('\tred:fatal: not a git repository (or any of the parent directories): .git');
    return { state, log };
  }

  // Initialize optional fields if missing (backwards compat)
  if (!nextState.config) nextState.config = { 'user.name': 'Dev', 'user.email': 'hello@dsiddharth.in' };
  if (!nextState.stash) nextState.stash = [];
  if (!nextState.tags) nextState.tags = {};
  if (!nextState.remotes) nextState.remotes = { 'origin': 'https://github.com/SID9927/stackwithsid.git' };

  // Get active commit ID
  const getActiveCommitId = (s) => {
    if (s.branches && s.branches[s.head] !== undefined) {
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
    return !!(s.commits && s.commits[id.toUpperCase()]);
  };

  const activeCommitId = getActiveCommitId(nextState);

  switch (sub) {
    // ─────────────────────────── SETUP ───────────────────────────

    case 'config': {
      const flags = parts.slice(2);
      // Handle --list
      if (flags.includes('--list') || flags.includes('-l')) {
        log.push('--- Git Configuration ---');
        Object.entries(nextState.config).forEach(([key, val]) => {
          log.push(`${key}=${val}`);
        });
        break;
      }
      // Handle --global / --local transparently
      const keyIndex = flags.findIndex(f => !f.startsWith('-'));
      if (keyIndex === -1) {
        log.push('usage: git config [<options>] <name> [<value>]');
        break;
      }
      const key = flags[keyIndex];
      const value = flags[keyIndex + 1];
      if (!value) {
        // Get mode
        if (nextState.config[key] !== undefined) {
          log.push(nextState.config[key]);
        } else {
          log.push(`\tred:error: key does not exist: ${key}`);
        }
      } else {
        nextState.config[key] = value;
        log.push(`\tgreen:Config updated: ${key}=${value}`);
      }
      break;
    }

    case 'clone': {
      const url = parts[2];
      const destDir = parts[3] || (url ? url.split('/').pop().replace('.git', '') : null);
      if (!url) {
        log.push('\tred:fatal: You must specify a repository to clone.');
        break;
      }
      log.push(`Cloning into '${destDir}'...`);
      log.push('remote: Enumerating objects: 42, done.');
      log.push('remote: Counting objects: 100% (42/42), done.');
      log.push('remote: Compressing objects: 100% (28/28), done.');
      log.push('Receiving objects: 100% (42/42), 18.34 KiB | 4.59 MiB/s, done.');
      log.push('Resolving deltas: 100% (12/12), done.');
      log.push(`\tgreen:Repository cloned to ./${destDir}/`);
      
      // Initialize repository & seed it with remote commits
      nextState.initialized = true;
      nextState.commits = {
        'C0': { id: 'C0', parents: [], message: 'Initial commit', branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add landing page content', branch: 'main' }
      };
      nextState.branches = {
        'main': 'C1'
      };
      nextState.head = 'main';
      nextState.workingDirectory = {
        'README.md': 'modified'
      };
      nextState.stagingArea = [];
      nextState.remoteBranches = {
        'main': 'C1'
      };
      nextState.remotes = {
        'origin': url
      };
      nextState.tags = {};
      nextState.stash = [];

      log.push('hint: Run `git log` to view the commit history.');
      break;
    }

    // ─────────────────────────── STATUS/DIFF ───────────────────────────

    case 'status': {
      const staged = nextState.stagingArea || [];
      const unstaged = [];
      const untracked = [];

      Object.keys(nextState.workingDirectory || {}).forEach(file => {
        const status = nextState.workingDirectory[file];
        if (status === 'modified' && !staged.includes(file)) {
          unstaged.push(file);
        } else if (status === 'untracked' && !staged.includes(file)) {
          untracked.push(file);
        }
      });

      const branchName = nextState.branches && nextState.branches[nextState.head] !== undefined ? nextState.head : null;
      log.push(`On branch ${branchName || 'detached HEAD'}`);

      // Remote tracking info
      if (branchName && nextState.remoteBranches && nextState.remoteBranches[branchName]) {
        const localCommit = nextState.branches[branchName];
        const remoteCommit = nextState.remoteBranches[branchName];
        if (!localCommit) {
          log.push(`No commits yet`);
        } else if (localCommit === remoteCommit) {
          log.push(`Your branch is up to date with 'origin/${branchName}'.`);
        } else {
          const localAncestors = getAncestors(localCommit, nextState.commits);
          if (localAncestors.has(remoteCommit)) {
            const count = getCommitsSince(localCommit, remoteCommit, nextState.commits).length;
            log.push(`Your branch is ahead of 'origin/${branchName}' by ${count} commit(s).`);
            log.push(`  (use "git push" to publish your local commits)`);
          } else {
            log.push(`Your branch is behind 'origin/${branchName}'.`);
            log.push(`  (use "git pull" to update your local branch)`);
          }
        }
      } else if (branchName && nextState.branches[branchName] === null) {
        log.push(`No commits yet on branch '${branchName}'.`);
      }

      log.push('');

      if (staged.length > 0) {
        log.push('Changes to be committed:');
        log.push('  (use "git restore --staged <file>..." to unstage)');
        staged.forEach(f => {
          log.push(`\tgreen:        new file:   ${f}`);
        });
        log.push('');
      }

      if (unstaged.length > 0) {
        log.push('Changes not staged for commit:');
        log.push('  (use "git add <file>..." to update what will be committed)');
        log.push('  (use "git restore <file>..." to discard changes in working directory)');
        unstaged.forEach(f => {
          log.push(`\tred:        modified:   ${f}`);
        });
        log.push('');
      }

      if (untracked.length > 0) {
        log.push('Untracked files:');
        log.push('  (use "git add <file>..." to include in what will be committed)');
        untracked.forEach(f => {
          log.push(`\tred:        ${f}`);
        });
        log.push('');
      }

      if (staged.length === 0 && unstaged.length === 0 && untracked.length === 0) {
        log.push('nothing to commit, working tree clean');
      }
      break;
    }

    case 'diff': {
      const args = parts.slice(2);
      const staged = args.includes('--staged') || args.includes('--cached');
      const targetFile = args.find(a => !a.startsWith('-'));

      const wd = nextState.workingDirectory || {};
      const stg = nextState.stagingArea || [];

      if (staged) {
        // Show staged diff
        if (stg.length === 0) {
          log.push('(no staged changes)');
        } else {
          log.push(`diff --git a/${stg[0]} b/${stg[0]}`);
          log.push('--- a/(empty)');
          log.push(`+++ b/${stg[0]}`);
          stg.forEach(f => {
            log.push(`\tgreen:+ Added: ${f} (new file staged for commit)`);
          });
        }
      } else {
        // Show working directory diff
        const modifiedFiles = Object.keys(wd).filter(f => wd[f] === 'modified' && !stg.includes(f) && (!targetFile || f === targetFile));
        if (modifiedFiles.length === 0) {
          log.push('(no unstaged changes)');
        } else {
          modifiedFiles.forEach(f => {
            log.push(`diff --git a/${f} b/${f}`);
            log.push(`index 1234567..abcdef0 100644`);
            log.push(`--- a/${f}`);
            log.push(`+++ b/${f}`);
            log.push(`@@ -1,5 +1,7 @@`);
            log.push(' <!-- existing content -->');
            log.push('\tgreen:+<div class="new-feature">Added section</div>');
            log.push('\tred:-<!-- old placeholder -->');
          });
        }
      }
      break;
    }

    case 'show': {
      const target = parts[2];
      let commitId = null;
      if (!target || target === 'HEAD') {
        commitId = activeCommitId;
      } else if (nextState.commits[target?.toUpperCase()]) {
        commitId = target.toUpperCase();
      } else if (nextState.tags && nextState.tags[target]) {
        commitId = nextState.tags[target];
      }

      if (!commitId || !nextState.commits[commitId]) {
        log.push(`\tred:fatal: ambiguous argument '${target || 'HEAD'}': unknown revision`);
        break;
      }

      const commit = nextState.commits[commitId];
      log.push(`commit ${commitId}`);
      log.push(`Author: ${nextState.config['user.name'] || 'Dev'} <${nextState.config['user.email'] || 'dev@example.com'}>`);
      log.push(`Date:   ${new Date().toDateString()}`);
      log.push('');
      log.push(`    ${commit.message}`);
      log.push('');
      log.push(`diff --git a/example.js b/example.js`);
      log.push(`--- a/example.js`);
      log.push(`+++ b/example.js`);
      log.push(`@@ -0,0 +1,3 @@`);
      log.push(`\tgreen:+// Committed in: ${commitId}`);
      log.push(`\tgreen:+// Message: ${commit.message}`);
      log.push(`\tgreen:+// Branch: ${commit.branch || 'detached'}`);
      break;
    }

    // ─────────────────────────── STAGING ───────────────────────────

    case 'add': {
      const target = parts[2];
      if (!target) {
        log.push('Nothing specified, nothing added.');
        log.push("hint: Maybe you wanted to say 'git add .'?");
        break;
      }

      nextState.workingDirectory = nextState.workingDirectory || {};
      nextState.stagingArea = nextState.stagingArea || [];

      if (target === '.' || target === '*' || target === '-A') {
        // Add all modified/untracked files
        let count = 0;
        Object.keys(nextState.workingDirectory).forEach(file => {
          if (!nextState.stagingArea.includes(file)) {
            nextState.stagingArea.push(file);
            count++;
          }
        });
        if (count === 0) {
          log.push('nothing to stage, working tree clean');
        } else {
          log.push(`\tgreen:Staged ${count} file(s).`);
        }
      } else {
        if (nextState.workingDirectory[target] !== undefined) {
          if (!nextState.stagingArea.includes(target)) {
            nextState.stagingArea.push(target);
            log.push(`\tgreen:Staged '${target}'`);
          } else {
            log.push(`'${target}' is already staged.`);
          }
        } else {
          log.push(`\tred:fatal: pathspec '${target}' did not match any files`);
        }
      }
      break;
    }

    case 'restore': {
      const args = parts.slice(2);
      const stagedFlag = args.includes('--staged') || args.includes('-S');
      const file = args.find(a => !a.startsWith('-'));

      if (!file) {
        log.push('\tred:error: pathspec required');
        break;
      }

      if (stagedFlag) {
        // Unstage file
        nextState.stagingArea = (nextState.stagingArea || []).filter(f => f !== file);
        log.push(`Unstaged '${file}' — changes kept in working directory.`);
      } else {
        // Discard working directory changes
        if (nextState.workingDirectory[file]) {
          delete nextState.workingDirectory[file];
          log.push(`\tgreen:Restored '${file}' from last commit.`);
        } else {
          log.push(`\tred:error: pathspec '${file}' did not match any file(s) known to git`);
        }
      }
      break;
    }

    case 'rm': {
      const args = parts.slice(2);
      const cached = args.includes('--cached');
      const file = args.find(a => !a.startsWith('-'));
      if (!file) {
        log.push('\tred:fatal: No pathspec given. Nothing removed.');
        break;
      }
      nextState.stagingArea = (nextState.stagingArea || []).filter(f => f !== file);
      if (!cached) {
        delete nextState.workingDirectory[file];
      }
      log.push(`rm '${file}'`);
      log.push(`\tgreen:File '${file}' removed from ${cached ? 'index (staging area)' : 'index and working tree'}.`);
      break;
    }

    case 'mv': {
      const src = parts[2];
      const dest = parts[3];
      if (!src || !dest) {
        log.push('\tred:fatal: source and destination required');
        break;
      }
      if (nextState.workingDirectory[src] !== undefined) {
        nextState.workingDirectory[dest] = nextState.workingDirectory[src];
        delete nextState.workingDirectory[src];
        log.push(`\tgreen:Renamed '${src}' to '${dest}'.`);
      } else {
        log.push(`\tred:fatal: '${src}' not in the working directory`);
      }
      break;
    }

    // ─────────────────────────── COMMIT ───────────────────────────

    case 'commit': {
      const staged = nextState.stagingArea || [];
      const args = parts.slice(2);
      const isAmend = args.includes('--amend');

      if (!isAmend && staged.length === 0) {
        log.push('\tred:no changes added to commit (use "git add" and/or "git commit -a")');
        break;
      }

      // Find message option
      let message = 'New commit';
      const mIdx = parts.indexOf('-m');
      if (mIdx !== -1 && parts[mIdx + 1]) {
        message = parts.slice(mIdx + 1).join(' ').replace(/^['"]|['"]$/g, '');
      }

      if (isAmend && Object.keys(nextState.commits).length === 0) {
        log.push('\tred:fatal: nothing to amend — no commits yet');
        break;
      }

      if (isAmend) {
        // Amend the last commit
        const commitId = activeCommitId;
        if (commitId && nextState.commits[commitId]) {
          nextState.commits[commitId].message = message;
          log.push(`\tgreen:[${nextState.head} ${commitId}] ${message} (amended)`);
        }
        nextState.stagingArea = [];
        break;
      }

      const newId = generateNextCommitId(nextState);
      const activeBranchName = nextState.branches && nextState.branches[nextState.head] !== undefined ? nextState.head : null;

      nextState.commits[newId] = {
        id: newId,
        parents: activeCommitId ? [activeCommitId] : [],
        message,
        branch: activeBranchName || 'detached'
      };

      if (activeBranchName !== null) {
        nextState.branches[activeBranchName] = newId;
      } else {
        nextState.head = newId; // Detached HEAD moves directly
      }

      // Clear staged files and update working directory
      nextState.stagingArea = [];
      staged.forEach(f => {
        delete nextState.workingDirectory[f];
      });

      // Add a new file in working directory for further commands
      nextState.workingDirectory[`feature-${newId.toLowerCase()}.js`] = 'untracked';

      const author = nextState.config['user.name'] || 'Dev';
      log.push(`[${activeBranchName || 'detached HEAD'} ${newId}] ${message}`);
      log.push(` Author: ${author}`);
      log.push(` ${staged.length} file(s) changed`);
      break;
    }

    // ─────────────────────────── LOG/HISTORY ───────────────────────────

    case 'log': {
      const args = parts.slice(2);
      const oneline = args.includes('--oneline') || args.includes('--one-line');
      const isGraph = args.includes('--graph');
      const isAll = args.includes('--all');

      let current = activeCommitId;
      if (!current) {
        log.push('\tred:fatal: your current branch does not have any commits yet');
        break;
      }

      log.push('--- Commit History Log ---');
      let count = 0;
      const visited = new Set();
      const queue = [current];

      while (queue.length > 0 && count < 20) {
        const cid = queue.shift();
        if (!cid || visited.has(cid)) continue;
        visited.add(cid);
        const commit = nextState.commits[cid];
        if (!commit) break;

        const isHeadStr = (nextState.head === cid || nextState.branches?.[nextState.head] === cid)
          ? ` (HEAD -> ${nextState.head})`
          : '';
        const tagStr = Object.entries(nextState.tags || {})
          .filter(([, v]) => v === cid)
          .map(([k]) => ` tag: ${k}`)
          .join('');

        if (oneline) {
          log.push(`${cid}${isHeadStr}${tagStr} ${commit.message}`);
        } else {
          log.push(`commit ${cid}${isHeadStr}${tagStr}`);
          log.push(`Author: ${nextState.config['user.name'] || 'Dev'} <${nextState.config['user.email'] || 'dev@example.com'}>`);
          log.push(`Date:   ${new Date().toDateString()}`);
          log.push(`\n    ${commit.message}\n`);
        }
        count++;

        if (commit.parents) {
          commit.parents.forEach(p => queue.push(p));
        }
      }
      break;
    }

    // ─────────────────────────── BRANCHES ───────────────────────────

    case 'branch': {
      const args = parts.slice(2);
      const deleteFlag = args.includes('-d') || args.includes('-D') || args.includes('--delete');
      const allFlag = args.includes('-a') || args.includes('--all');
      const remoteFlag = args.includes('-r') || args.includes('--remotes');
      const renameFlag = args.includes('-m') || args.includes('--move');

      const nonFlagArgs = args.filter(a => !a.startsWith('-'));

      if (deleteFlag) {
        const branchName = nonFlagArgs[0];
        if (!branchName) { log.push('\tred:fatal: branch name required'); break; }
        if (!nextState.branches[branchName]) { log.push(`\tred:error: branch '${branchName}' not found.`); break; }
        if (nextState.head === branchName) { log.push(`\tred:error: Cannot delete the branch '${branchName}' that you are currently on.`); break; }
        delete nextState.branches[branchName];
        log.push(`\tgreen:Deleted branch ${branchName}.`);
        break;
      }

      if (renameFlag) {
        const [oldName, newName] = nonFlagArgs;
        if (!oldName || !newName) { log.push('\tred:fatal: old name and new name required'); break; }
        if (!nextState.branches[oldName]) { log.push(`\tred:error: branch '${oldName}' not found.`); break; }
        nextState.branches[newName] = nextState.branches[oldName];
        delete nextState.branches[oldName];
        if (nextState.head === oldName) nextState.head = newName;
        log.push(`\tgreen:Branch '${oldName}' renamed to '${newName}'.`);
        break;
      }

      if (!nonFlagArgs[0]) {
        // List branches
        Object.keys(nextState.branches).forEach(b => {
          const prefix = nextState.head === b ? '* ' : '  ';
          const isCurrent = nextState.head === b;
          log.push(`${prefix}${b}${isCurrent ? ' (current)' : ''}`);
        });
        if (allFlag || remoteFlag) {
          Object.keys(nextState.remoteBranches || {}).forEach(b => {
            log.push(`  remotes/origin/${b}`);
          });
        }
        break;
      }

      const branchName = nonFlagArgs[0];
      if (nextState.branches[branchName] !== undefined) {
        log.push(`\tred:fatal: A branch named '${branchName}' already exists.`);
        break;
      }

      nextState.branches[branchName] = activeCommitId;
      log.push(`\tgreen:Created branch '${branchName}' at ${activeCommitId}`);
      break;
    }

    case 'checkout': {
      const optionOrTarget = parts[2];
      if (!optionOrTarget) {
        log.push('\tred:error: pathspec is required');
        break;
      }

      // Check for checkout -b
      if (optionOrTarget === '-b') {
        const newBranch = parts[3];
        if (!newBranch) { log.push('\tred:fatal: branch name required'); break; }
        if (nextState.branches[newBranch] !== undefined) {
          log.push(`\tred:fatal: A branch named '${newBranch}' already exists.`);
          break;
        }
        nextState.branches[newBranch] = activeCommitId;
        nextState.head = newBranch;
        log.push(`\tgreen:Switched to a new branch '${newBranch}'`);
      } else {
        const target = optionOrTarget;
        if (nextState.branches && nextState.branches[target] !== undefined) {
          nextState.head = target;
          log.push(`\tgreen:Switched to branch '${target}'`);
          if (nextState.remoteBranches?.[target]) {
            log.push(`Your branch is tracking 'origin/${target}'.`);
          }
        } else if (commitExists(nextState, target)) {
          const upperTarget = target.toUpperCase();
          nextState.head = upperTarget;
          log.push(`Note: switching to '${upperTarget}'.`);
          log.push('');
          log.push(`You are in 'detached HEAD' state. You can look around, make experimental`);
          log.push(`changes and commit them, and you can discard any commits you make in this`);
          log.push(`state without impacting any branches.`);
        } else if (nextState.tags?.[target]) {
          nextState.head = nextState.tags[target];
          log.push(`Note: switching to tag '${target}' (${nextState.tags[target]}).`);
          log.push(`You are in 'detached HEAD' state.`);
        } else {
          log.push(`\tred:error: pathspec '${target}' did not match any file(s) known to git`);
          break;
        }
      }
      break;
    }

    case 'switch': {
      const args = parts.slice(2);
      const createFlag = args.includes('-c') || args.includes('-C') || args.includes('--create');
      const nonFlagArgs = args.filter(a => !a.startsWith('-'));
      const target = nonFlagArgs[0];

      if (!target) { log.push('\tred:fatal: branch name required'); break; }

      if (createFlag) {
        if (nextState.branches[target] !== undefined) {
          log.push(`\tred:fatal: A branch named '${target}' already exists.`);
          break;
        }
        nextState.branches[target] = activeCommitId;
        nextState.head = target;
        log.push(`\tgreen:Switched to a new branch '${target}'`);
      } else {
        if (nextState.branches[target] !== undefined) {
          nextState.head = target;
          log.push(`\tgreen:Switched to branch '${target}'`);
        } else {
          log.push(`\tred:error: pathspec '${target}' did not match any file(s) known to git`);
          log.push(`hint: If you want to create a new branch, use 'git switch -c ${target}'`);
        }
      }
      break;
    }

    // ─────────────────────────── MERGE / REBASE ───────────────────────────

    case 'merge': {
      const args = parts.slice(2);
      const noFF = args.includes('--no-ff');
      const targetBranch = args.find(a => !a.startsWith('-'));

      if (!targetBranch) {
        log.push('\tred:fatal: target branch required to merge');
        break;
      }

      let targetCommitId = nextState.branches?.[targetBranch];
      if (targetCommitId === undefined) {
        const upperTarget = targetBranch.toUpperCase();
        if (nextState.commits && nextState.commits[upperTarget]) {
          targetCommitId = upperTarget;
        }
      }
      
      if (!targetCommitId) {
        log.push(`\tred:merge: ${targetBranch} - not something we can merge`);
        break;
      }

      if (targetCommitId === activeCommitId) {
        log.push('Already up to date.');
        break;
      }

      const currentBranchName = nextState.branches && nextState.branches[nextState.head] !== undefined ? nextState.head : null;
      if (!currentBranchName) {
        log.push('\tred:fatal: You are in detached HEAD state. Cannot merge here.');
        break;
      }

      // Check if targetCommit is already an ancestor of activeCommit
      const activeAncestors = getAncestors(activeCommitId, nextState.commits);
      if (activeAncestors.has(targetCommitId)) {
        log.push('Already up to date.');
        break;
      }

      // Fast-forward: Is activeCommit an ancestor of targetCommit?
      const targetAncestors = getAncestors(targetCommitId, nextState.commits);
      if (targetAncestors.has(activeCommitId) && !noFF) {
        nextState.branches[currentBranchName] = targetCommitId;
        log.push(`Updating ${activeCommitId}..${targetCommitId}`);
        log.push('\tgreen:Fast-forward');
        log.push(` ${targetBranch} integrated into ${currentBranchName}`);
      } else {
        // Diverged, 3-way merge commit
        const mergeCommitId = generateNextCommitId(nextState);
        nextState.commits[mergeCommitId] = {
          id: mergeCommitId,
          parents: [activeCommitId, targetCommitId],
          message: nextState.branches?.[targetBranch]
            ? `Merge branch '${targetBranch}' into ${currentBranchName}`
            : `Merge commit '${targetCommitId}' into ${currentBranchName}`,
          branch: currentBranchName
        };
        nextState.branches[currentBranchName] = mergeCommitId;
        log.push(`Merge made by the 'ort' strategy.`);
        log.push(`\tgreen:Merge commit ${mergeCommitId} created.`);
      }
      break;
    }

    case 'rebase': {
      const args = parts.slice(2);
      const isInteractive = args.includes('-i') || args.includes('--interactive');
      const targetBranch = args.find(a => !a.startsWith('-'));

      if (!targetBranch) {
        log.push('\tred:fatal: target branch required to rebase');
        break;
      }

      if (isInteractive) {
        log.push(`Interactive rebase onto '${targetBranch}':`);
        log.push('');
        log.push(`# Commands:`);
        log.push(`#  p, pick <commit>   = use commit`);
        log.push(`#  r, reword <commit> = use commit, but edit the message`);
        log.push(`#  s, squash <commit> = use commit, but meld into previous commit`);
        log.push(`#  d, drop <commit>   = remove commit`);
        log.push('');
        log.push('(Interactive mode simulated — proceeding as regular rebase)');
      }

      const targetCommitId = nextState.branches?.[targetBranch] || (commitExists(nextState, targetBranch) ? targetBranch.toUpperCase() : null);
      if (!targetCommitId) {
        log.push(`\tred:rebase: ${targetBranch} - invalid rebase target`);
        break;
      }

      const currentBranchName = nextState.branches && nextState.branches[nextState.head] !== undefined ? nextState.head : null;
      if (!currentBranchName) {
        log.push('\tred:fatal: You are in detached HEAD state. Cannot rebase here.');
        break;
      }

      if (targetCommitId === activeCommitId) {
        log.push(`Current branch ${currentBranchName} is up to date.`);
        break;
      }

      const commonAncestor = findCommonAncestor(activeCommitId, targetCommitId, nextState.commits);
      if (!commonAncestor) {
        log.push('\tred:fatal: No common ancestor found. Cannot rebase.');
        break;
      }

      if (commonAncestor === targetCommitId) {
        log.push(`Already on top of base commit ${targetCommitId}.`);
        break;
      }

      const commitsToCopy = getCommitsSince(activeCommitId, commonAncestor, nextState.commits);

      if (commitsToCopy.length === 0) {
        nextState.branches[currentBranchName] = targetCommitId;
        log.push(`\tgreen:Fast-forwarded ${currentBranchName} to ${targetBranch}`);
        break;
      }

      let currentBase = targetCommitId;
      commitsToCopy.forEach((commitId, i) => {
        const origCommit = nextState.commits[commitId];
        const newId = generateNextCommitId(nextState);
        nextState.commits[newId] = {
          id: newId,
          parents: [currentBase],
          message: `${origCommit.message} (rebased)`,
          branch: currentBranchName
        };
        log.push(`\tgreen:Rebasing (${i + 1}/${commitsToCopy.length}): ${origCommit.message}`);
        currentBase = newId;
      });

      nextState.branches[currentBranchName] = currentBase;
      log.push(`\tgreen:Successfully rebased and updated refs/heads/${currentBranchName}.`);
      break;
    }

    case 'cherry-pick': {
      const targetCommit = parts[2];
      if (!targetCommit) {
        log.push('\tred:fatal: commit ID required to cherry-pick');
        break;
      }

      const upperTarget = targetCommit.toUpperCase();
      const origCommit = nextState.commits?.[upperTarget];
      if (!origCommit) {
        log.push(`\tred:fatal: bad revision '${targetCommit}' — commit not found`);
        break;
      }

      const currentBranchName = nextState.branches && nextState.branches[nextState.head] !== undefined ? nextState.head : null;
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

      log.push(`\tgreen:[${currentBranchName || 'detached HEAD'} ${newId}] ${origCommit.message} (cherry-picked)`);
      break;
    }

    // ─────────────────────────── RESET / REVERT ───────────────────────────

    case 'reset': {
      let args = parts.slice(2);
      let isHard = false;
      let isSoft = false;
      let isMixed = true; // default

      if (args.includes('--hard')) { isHard = true; isMixed = false; args = args.filter(a => a !== '--hard'); }
      else if (args.includes('--soft')) { isSoft = true; isMixed = false; args = args.filter(a => a !== '--soft'); }
      else if (args.includes('--mixed')) { args = args.filter(a => a !== '--mixed'); }

      const targetRef = args[0];
      if (!targetRef) {
        // Reset staging area if no target
        nextState.stagingArea = [];
        log.push('\tgreen:Staging area cleared (mixed reset to HEAD).');
        break;
      }

      const currentBranchName = nextState.branches && nextState.branches[nextState.head] !== undefined ? nextState.head : null;
      if (!currentBranchName) {
        log.push('\tred:fatal: You are in detached HEAD state. Reset only available on branches in this simulator.');
        break;
      }

      let resolvedCommitId = null;
      if (targetRef.startsWith('HEAD~')) {
        const count = parseInt(targetRef.substring(5));
        if (isNaN(count)) { log.push(`\tred:fatal: invalid reference '${targetRef}'`); break; }
        let current = activeCommitId;
        for (let i = 0; i < count; i++) {
          const commit = nextState.commits[current];
          if (commit?.parents?.[0]) {
            current = commit.parents[0];
          } else {
            current = null;
            break;
          }
        }
        resolvedCommitId = current;
      } else if (targetRef.toUpperCase() === 'HEAD') {
        resolvedCommitId = activeCommitId;
      } else {
        const upper = targetRef.toUpperCase();
        if (nextState.commits[upper]) {
          resolvedCommitId = upper;
        } else if (nextState.branches?.[targetRef]) {
          resolvedCommitId = nextState.branches[targetRef];
        }
      }

      if (!resolvedCommitId) {
        log.push(`\tred:fatal: Cannot resolve target reference '${targetRef}'`);
        break;
      }

      nextState.branches[currentBranchName] = resolvedCommitId;
      const mode = isHard ? '--hard' : isSoft ? '--soft' : '--mixed';
      log.push(`HEAD is now at ${resolvedCommitId} ${nextState.commits[resolvedCommitId]?.message}`);

      if (isHard) {
        nextState.stagingArea = [];
        nextState.workingDirectory = {};
        log.push('\tgreen:Working directory and staging area reset.');
      } else if (isMixed) {
        nextState.stagingArea = [];
        log.push('Unstaged changes after reset.');
      }
      // soft: keep everything
      break;
    }

    case 'revert': {
      const targetCommit = parts[2];
      if (!targetCommit) {
        log.push('\tred:fatal: commit reference required to revert');
        break;
      }

      const upperTarget = targetCommit.toUpperCase() === 'HEAD' ? activeCommitId : targetCommit.toUpperCase();
      const origCommit = nextState.commits?.[upperTarget];
      if (!origCommit) {
        log.push(`\tred:fatal: bad revision '${targetCommit}'`);
        break;
      }

      const currentBranchName = nextState.branches && nextState.branches[nextState.head] !== undefined ? nextState.head : null;
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

      log.push(`\tgreen:[${currentBranchName || 'detached HEAD'} ${newId}] Revert "${origCommit.message}"`);
      log.push('This reverts commit ' + upperTarget + '.');
      break;
    }

    // ─────────────────────────── STASH ───────────────────────────

    case 'stash': {
      const stashSub = parts[2];
      nextState.stash = nextState.stash || [];

      if (!stashSub || stashSub === 'push' || stashSub === 'save') {
        const msg = parts.slice(stashSub === 'save' || stashSub === 'push' ? 3 : 3).join(' ').replace(/^['"]|['"]$/g, '') || `WIP on ${nextState.head}`;
        const wd = nextState.workingDirectory || {};
        const stg = nextState.stagingArea || [];
        const hasChanges = Object.keys(wd).length > 0 || stg.length > 0;

        if (!hasChanges) {
          log.push('No local changes to save');
          break;
        }

        nextState.stash.unshift({
          message: msg,
          stagingArea: [...stg],
          workingDirectory: { ...wd }
        });
        nextState.stagingArea = [];
        nextState.workingDirectory = {};
        log.push(`\tgreen:Saved working directory and index state: "${msg}"`);
      } else if (stashSub === 'list') {
        if (nextState.stash.length === 0) {
          log.push('(no stash entries)');
        } else {
          nextState.stash.forEach((entry, i) => {
            log.push(`stash@{${i}}: ${entry.message}`);
          });
        }
      } else if (stashSub === 'pop' || stashSub === 'apply') {
        if (nextState.stash.length === 0) {
          log.push('\tred:No stash entries found.');
          break;
        }
        const entry = nextState.stash[0];
        if (stashSub === 'pop') nextState.stash.shift();
        nextState.stagingArea = [...(entry.stagingArea || [])];
        Object.assign(nextState.workingDirectory, entry.workingDirectory || {});
        log.push(`\tgreen:Restored stash: "${entry.message}"`);
        if (stashSub === 'pop') log.push('Dropped stash@{0}');
      } else if (stashSub === 'drop') {
        if (nextState.stash.length === 0) {
          log.push('\tred:No stash entries found.');
          break;
        }
        const idx = parseInt(parts[3]?.match(/\{(\d+)\}/)?.[1] ?? '0');
        nextState.stash.splice(idx, 1);
        log.push(`\tgreen:Dropped stash@{${idx}}`);
      } else if (stashSub === 'clear') {
        nextState.stash = [];
        log.push('\tgreen:All stash entries cleared.');
      } else if (stashSub === 'show') {
        if (nextState.stash.length === 0) {
          log.push('(no stash entries)');
        } else {
          const entry = nextState.stash[0];
          log.push(`Stash: "${entry.message}"`);
          log.push(`Files: ${Object.keys(entry.workingDirectory || {}).join(', ') || '(none)'}`);
        }
      } else {
        log.push(`\tred:error: unknown stash command: ${stashSub}`);
        log.push('Usage: git stash [push|pop|apply|list|drop|clear|show]');
      }
      break;
    }

    // ─────────────────────────── TAGS ───────────────────────────

    case 'tag': {
      const args = parts.slice(2);
      const deleteFlag = args.includes('-d') || args.includes('--delete');
      const annotated = args.includes('-a') || args.includes('--annotate');
      const nonFlags = args.filter(a => !a.startsWith('-'));
      const tagName = nonFlags[0];

      if (!tagName) {
        // List tags
        const tags = Object.keys(nextState.tags || {});
        if (tags.length === 0) {
          log.push('(no tags)');
        } else {
          tags.sort().forEach(t => log.push(t));
        }
        break;
      }

      if (deleteFlag) {
        if (!nextState.tags?.[tagName]) {
          log.push(`\tred:error: tag '${tagName}' not found.`);
          break;
        }
        delete nextState.tags[tagName];
        log.push(`\tgreen:Deleted tag '${tagName}'`);
        break;
      }

      const targetCommitId2 = nonFlags[1] ? (nextState.commits[nonFlags[1].toUpperCase()] ? nonFlags[1].toUpperCase() : activeCommitId) : activeCommitId;
      nextState.tags[tagName] = targetCommitId2;

      if (annotated) {
        const mIdx = args.indexOf('-m');
        const msg = mIdx !== -1 && args[mIdx + 1] ? args.slice(mIdx + 1).join(' ').replace(/^['"]|['"]$/g, '') : tagName;
        log.push(`\tgreen:Tagged commit ${targetCommitId2} as '${tagName}' (annotated: "${msg}")`);
      } else {
        log.push(`\tgreen:Tagged commit ${targetCommitId2} as '${tagName}' (lightweight)`);
      }
      break;
    }

    // ─────────────────────────── REMOTE ───────────────────────────

    case 'remote': {
      const remoteSub = parts[2];
      nextState.remotes = nextState.remotes || {};

      if (!remoteSub || remoteSub === '-v' || remoteSub === '--verbose') {
        // List remotes
        const remotes = Object.entries(nextState.remotes);
        if (remotes.length === 0) {
          log.push('(no remotes configured)');
        } else {
          remotes.forEach(([name, url]) => {
            log.push(`${name}\t${url} (fetch)`);
            log.push(`${name}\t${url} (push)`);
          });
        }
      } else if (remoteSub === 'add') {
        const remoteName = parts[3];
        const remoteUrl = parts[4];
        if (!remoteName || !remoteUrl) {
          log.push('\tred:usage: git remote add <name> <url>');
          break;
        }
        if (nextState.remotes[remoteName]) {
          log.push(`\tred:error: remote ${remoteName} already exists.`);
          break;
        }
        nextState.remotes[remoteName] = remoteUrl;
        log.push(`\tgreen:Remote '${remoteName}' added → ${remoteUrl}`);
      } else if (remoteSub === 'remove' || remoteSub === 'rm') {
        const remoteName = parts[3];
        if (!remoteName || !nextState.remotes[remoteName]) {
          log.push(`\tred:error: No such remote: ${remoteName}`);
          break;
        }
        delete nextState.remotes[remoteName];
        log.push(`\tgreen:Remote '${remoteName}' removed.`);
      } else if (remoteSub === 'rename') {
        const [oldN, newN] = [parts[3], parts[4]];
        if (!oldN || !newN) { log.push('\tred:usage: git remote rename <old> <new>'); break; }
        if (!nextState.remotes[oldN]) { log.push(`\tred:error: No such remote: ${oldN}`); break; }
        nextState.remotes[newN] = nextState.remotes[oldN];
        delete nextState.remotes[oldN];
        log.push(`\tgreen:Renamed remote '${oldN}' to '${newN}'.`);
      } else if (remoteSub === 'get-url') {
        const remoteName = parts[3] || 'origin';
        if (nextState.remotes[remoteName]) {
          log.push(nextState.remotes[remoteName]);
        } else {
          log.push(`\tred:error: No such remote: ${remoteName}`);
        }
      } else {
        log.push(`\tred:error: unknown subcommand: ${remoteSub}`);
        log.push('Usage: git remote [-v] | add <name> <url> | remove <name> | rename <old> <new>');
      }
      break;
    }

    // ─────────────────────────── FETCH / PULL / PUSH ───────────────────────────

    case 'fetch': {
      const args = parts.slice(2);
      const allFlag = args.includes('--all');
      const remoteName = args.find(a => !a.startsWith('-')) || 'origin';

      if (!nextState.remotes?.[remoteName]) {
        log.push(`\tred:fatal: '${remoteName}' does not appear to be a git repository`);
        log.push(`\tred:fatal: Could not read from remote repository.`);
        break;
      }

      const remoteUrl = nextState.remotes[remoteName];
      log.push(`From ${remoteUrl}`);
      // Simulate fetch — update remote tracking refs to match current remote branches
      const currentBranchName = nextState.branches?.[nextState.head] !== undefined ? nextState.head : null;
      const remoteBranch = currentBranchName || 'main';
      const remoteCommit = nextState.remoteBranches?.[remoteBranch];
      if (remoteCommit) {
        log.push(`   ${remoteCommit.substring(0, 7)}..${remoteCommit.substring(0, 7)}  ${remoteBranch} -> ${remoteName}/${remoteBranch}`);
        log.push('Already up to date (simulated fetch).');
      } else {
        log.push('Fetching origin');
        log.push(`\tgreen:Fetched remote tracking refs.`);
      }
      break;
    }

    case 'pull': {
      const args = parts.slice(2);
      const rebaseFlag = args.includes('--rebase');
      const currentBranchName = nextState.branches?.[nextState.head] !== undefined ? nextState.head : null;

      if (!currentBranchName) {
        log.push('\tred:fatal: You are in detached HEAD state. Cannot pull.');
        break;
      }

      nextState.remoteBranches = nextState.remoteBranches || {};
      const remoteCommit = nextState.remoteBranches[currentBranchName];
      if (!remoteCommit || remoteCommit === activeCommitId) {
        log.push('Already up to date.');
        break;
      }

      if (rebaseFlag) {
        log.push(`Rebasing from origin/${currentBranchName}...`);
      }

      // Fast-forward merge of remote commit
      nextState.branches[currentBranchName] = remoteCommit;
      log.push(`Updating ${activeCommitId}..${remoteCommit}`);
      log.push('\tgreen:Fast-forward');
      log.push(`\tgreen:Branch '${currentBranchName}' set up to track 'origin/${currentBranchName}'.`);
      break;
    }

    case 'push': {
      const args = parts.slice(2);
      const setUpstream = args.includes('-u') || args.includes('--set-upstream');
      const forceFlag = args.includes('-f') || args.includes('--force') || args.includes('--force-with-lease');
      const nonFlags = args.filter(a => !a.startsWith('-'));
      const remoteName = nonFlags[0] || 'origin';
      const branchName = nonFlags[1];

      const currentBranchName = nextState.branches?.[nextState.head] !== undefined ? nextState.head : null;
      if (!currentBranchName) {
        log.push('\tred:fatal: You are in detached HEAD state. Cannot push.');
        break;
      }

      const pushBranch = branchName || currentBranchName;
      const localCommit = nextState.branches[pushBranch];
      nextState.remoteBranches = nextState.remoteBranches || {};

      const remoteCommit = nextState.remoteBranches[pushBranch];
      if (remoteCommit && !forceFlag) {
        const localAncestors = getAncestors(localCommit, nextState.commits);
        if (!localAncestors.has(remoteCommit) && localCommit !== remoteCommit) {
          log.push(`\tred:! [rejected] ${pushBranch} -> ${pushBranch} (non-fast-forward)`);
          log.push('\tred:error: failed to push some refs to origin');
          log.push("hint: Updates were rejected because the tip of your current branch is behind");
          log.push("hint: its remote counterpart. Integrate the remote changes (e.g. 'git pull ...')");
          break;
        }
      }

      nextState.remoteBranches[pushBranch] = localCommit;
      const remoteUrl = nextState.remotes?.[remoteName] || 'origin';
      log.push(`Enumerating objects: 3, done.`);
      log.push(`Counting objects: 100% (3/3), done.`);
      log.push(`Writing objects: 100% (3/3), 296 bytes | 296.00 KiB/s, done.`);
      log.push(`To ${remoteUrl}`);
      log.push(`\tgreen:   ${(remoteCommit || '0000000').substring(0, 7)}..${localCommit.substring(0, 7)}  ${pushBranch} -> ${pushBranch}`);

      if (setUpstream) {
        log.push(`\tgreen:Branch '${pushBranch}' set up to track remote branch '${pushBranch}' from '${remoteName}'.`);
      }
      break;
    }

    // ─────────────────────────── DEFAULT ───────────────────────────

    default:
      log.push(`\tred:git: '${sub}' is not a git command. See 'git --help'.`);
      log.push('');
      log.push('The most similar commands are:');
      const allCmds = ['init', 'config', 'clone', 'status', 'add', 'commit', 'log', 'diff', 'show',
        'branch', 'checkout', 'switch', 'merge', 'rebase', 'cherry-pick', 'reset', 'revert',
        'stash', 'tag', 'remote', 'fetch', 'pull', 'push', 'restore', 'rm', 'mv'];
      const similar = allCmds.filter(c => c.startsWith(sub[0]));
      similar.slice(0, 3).forEach(c => log.push(`        ${c}`));
      break;
  }

  return { state: nextState, log };
};
