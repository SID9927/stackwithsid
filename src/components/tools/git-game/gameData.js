import { createInitialState } from '@/lib/gitEngine'

export const XP_PER_LEVEL = 50

export const TIERS = [
  { id: 1, name: 'Foundation', emoji: '🌱', color: '#10b981', levels: [1, 2, 3, 4, 5, 6] },
  { id: 2, name: 'Branching',  emoji: '🌿', color: '#06b6d4', levels: [7, 8, 9, 10, 11, 12, 13] },
  { id: 3, name: 'Advanced',   emoji: '🚀', color: '#f59e0b', levels: [14, 15, 16, 17, 18] }
]

export const CHEATSHEET = [
  {
    id: 'setup', label: '🔧 Setup',
    commands: [
      { cmd: 'git init',                                    desc: 'Initialize repository' },
      { cmd: 'git config --global user.name "Name"',       desc: 'Set author name' },
      { cmd: 'git config --global user.email "e@mail.com"',desc: 'Set author email' },
      { cmd: 'git config --list',                           desc: 'Show all config' },
      { cmd: 'git clone <url>',                             desc: 'Clone remote repo' },
    ]
  },
  {
    id: 'daily', label: '📋 Daily Use',
    commands: [
      { cmd: 'git status',              desc: 'Check working tree' },
      { cmd: 'git add <file>',          desc: 'Stage a file' },
      { cmd: 'git add .',               desc: 'Stage all changes' },
      { cmd: 'git diff',                desc: 'Show unstaged changes' },
      { cmd: 'git diff --staged',       desc: 'Show staged changes' },
      { cmd: 'git commit -m "msg"',     desc: 'Create commit' },
      { cmd: 'git commit --amend',      desc: 'Fix last commit message' },
      { cmd: 'git log',                 desc: 'View full history' },
      { cmd: 'git log --oneline',       desc: 'Compact history' },
      { cmd: 'git show <id>',           desc: 'Inspect a commit' },
      { cmd: 'git restore <file>',      desc: 'Discard working changes' },
      { cmd: 'git restore --staged <file>', desc: 'Unstage a file' },
      { cmd: 'git rm <file>',           desc: 'Remove tracked file' },
    ]
  },
  {
    id: 'branching', label: '🌿 Branches',
    commands: [
      { cmd: 'git branch',              desc: 'List branches' },
      { cmd: 'git branch <name>',       desc: 'Create branch' },
      { cmd: 'git branch -d <name>',    desc: 'Delete branch' },
      { cmd: 'git branch -m <old> <new>',desc: 'Rename branch' },
      { cmd: 'git switch <name>',       desc: 'Switch branch (modern)' },
      { cmd: 'git switch -c <name>',    desc: 'Create & switch' },
      { cmd: 'git checkout <name>',     desc: 'Switch branch (classic)' },
      { cmd: 'git checkout -b <name>',  desc: 'Create & checkout' },
    ]
  },
  {
    id: 'merging', label: '🔀 Merge & Rebase',
    commands: [
      { cmd: 'git merge <branch>',      desc: 'Merge a branch in' },
      { cmd: 'git merge --no-ff <branch>', desc: 'Force merge commit' },
      { cmd: 'git rebase <branch>',     desc: 'Replay commits onto base' },
      { cmd: 'git rebase -i <branch>',  desc: 'Interactive rebase' },
      { cmd: 'git cherry-pick <id>',    desc: 'Copy a specific commit' },
    ]
  },
  {
    id: 'undo', label: '↩️ Undoing',
    commands: [
      { cmd: 'git reset --soft HEAD~1',  desc: 'Undo commit, keep staged' },
      { cmd: 'git reset --mixed HEAD~1', desc: 'Undo commit + unstage' },
      { cmd: 'git reset --hard HEAD~1',  desc: 'Discard last commit entirely' },
      { cmd: 'git revert HEAD',          desc: 'Safe undo — new commit' },
      { cmd: 'git revert <id>',          desc: 'Revert a specific commit' },
    ]
  },
  {
    id: 'stash', label: '📦 Stash',
    commands: [
      { cmd: 'git stash',         desc: 'Save dirty working dir' },
      { cmd: 'git stash pop',     desc: 'Restore last stash' },
      { cmd: 'git stash list',    desc: 'List all stashes' },
      { cmd: 'git stash apply',   desc: 'Apply without removing' },
      { cmd: 'git stash drop',    desc: 'Delete a stash entry' },
      { cmd: 'git stash clear',   desc: 'Remove all stashes' },
      { cmd: 'git stash show',    desc: 'Inspect stash contents' },
    ]
  },
  {
    id: 'tags', label: '🏷️ Tags',
    commands: [
      { cmd: 'git tag',                         desc: 'List all tags' },
      { cmd: 'git tag v1.0.0',                  desc: 'Lightweight tag' },
      { cmd: 'git tag -a v1.0.0 -m "msg"',      desc: 'Annotated tag' },
      { cmd: 'git tag -d <tag>',                desc: 'Delete a tag' },
    ]
  },
  {
    id: 'remote', label: '🌐 Remote',
    commands: [
      { cmd: 'git remote -v',                   desc: 'List remotes' },
      { cmd: 'git remote add origin <url>',     desc: 'Add remote' },
      { cmd: 'git remote remove <name>',        desc: 'Remove remote' },
      { cmd: 'git fetch',                       desc: 'Download remote refs' },
      { cmd: 'git pull',                        desc: 'Fetch + merge' },
      { cmd: 'git pull --rebase',               desc: 'Fetch + rebase' },
      { cmd: 'git push',                        desc: 'Upload commits' },
      { cmd: 'git push -u origin main',         desc: 'Push + set upstream' },
    ]
  },
]

export const QUICK_ACTIONS = {
  1:       ['git init', 'git status'],
  2:       ['git config --global user.name "Dev"', 'git config --global user.email "dev@example.com"', 'git config --list'],
  3:       ['git status', 'git add index.html', 'git add .'],
  4:       ['git status', 'git commit -m "Initial commit"'],
  5:       ['git log', 'git log --oneline', 'git show C1', 'git show C2'],
  6:       ['git diff', 'git diff --staged', 'git status', 'git add index.html'],
  7:       ['git branch dev', 'git switch dev', 'git checkout -b dev', 'git branch'],
  8:       ['git merge feature', 'git log --oneline'],
  9:       ['git merge dev', 'git log --oneline'],
  10:      ['git checkout feature', 'git rebase main', 'git log --oneline'],
  11:      ['git cherry-pick C2', 'git log --oneline'],
  12:      ['git stash', 'git stash list', 'git stash pop', 'git stash show'],
  13:      ['git tag v1.0.0', 'git tag -a v1.0.0 -m "First release"', 'git tag'],
  14:      ['git remote add origin https://github.com/user/repo.git', 'git remote -v'],
  15:      ['git status', 'git push -u origin main', 'git push'],
  16:      ['git fetch', 'git pull', 'git status'],
  17:      ['git log --oneline', 'git reset --hard HEAD~1', 'git log'],
  18:      ['git log --oneline', 'git revert HEAD', 'git log'],
  sandbox: ['git status', 'git add .', 'git commit -m "work"', 'git branch feature', 'git switch feature', 'git merge main', 'git stash', 'git tag v1.0', 'git log --oneline'],
}

export const GAME_LEVELS = [
  // ── TIER 1: Foundation ──────────────────────────────────────────────────
  {
    id: 1, tier: 1,
    title: '1. Initialize Repository',
    description: 'Before Git can track anything, you must create a repository. This sets up the hidden `.git/` database inside your project folder — all history, branches, and config live there.',
    objective: 'Initialize a new Git repository.',
    instructions: 'Run `git init` to create a new repository. The `.git/` folder will be created automatically.',
    hint: '`git init` works on any folder. It creates a `.git/` directory with all the plumbing. Your files aren\'t tracked yet — you still need to `add` and `commit` them.',
    initialState: {
      initialized: false,
      commits: {}, branches: {}, head: null,
      workingDirectory: { 'index.html': 'untracked', 'styles.css': 'untracked' },
      stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    },
    goalCondition: (state) => state.initialized === true
  },
  {
    id: 2, tier: 1,
    title: '2. Identity Setup (git config)',
    description: 'Every commit permanently records who made it. Before your first commit, you must tell Git your name and email — these are baked into every commit you\'ll ever make.',
    objective: 'Set your name and email with `git config`.',
    instructions: 'Run `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`. Verify with `git config --list`.',
    hint: '`--global` applies to all repos on your machine. Omit it to set config per-repo only. Your identity is stored in `~/.gitconfig` and stamped on every commit forever.',
    initialState: createInitialState({
      initialized: true,
      commits: {}, branches: { 'main': null }, head: 'main',
      workingDirectory: { 'index.html': 'untracked' },
      stagingArea: [], remoteBranches: {},
      config: {}, stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => !!(state.config?.['user.name'] || state.config?.['user.email'])
  },
  {
    id: 3, tier: 1,
    title: '3. Staging Changes (git add)',
    description: 'Git uses a two-step commit process. First you STAGE the files you want to include, then you commit. The staging area (Index) lets you craft each snapshot precisely — even choosing which lines to include.',
    objective: 'Stage `index.html` for your first commit.',
    instructions: 'Run `git status` to see your working directory. Run `git add index.html` to stage it. Use `git add .` to stage everything at once.',
    hint: 'After `git add`, run `git status` — staged files appear green under "Changes to be committed". Unstaged files remain red. Only staged files go into the next commit.',
    initialState: createInitialState({
      initialized: true,
      commits: {}, branches: { 'main': null }, head: 'main',
      workingDirectory: { 'index.html': 'untracked', 'styles.css': 'untracked' },
      stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => !!(state.stagingArea?.includes('index.html'))
  },
  {
    id: 4, tier: 1,
    title: '4. Recording Snapshots (git commit)',
    description: 'A commit permanently saves your staged changes as a node in the project\'s history graph (DAG). Each commit has a unique hash, a message, author info, a timestamp, and a pointer to its parent.',
    objective: 'Commit your staged changes with a descriptive message.',
    instructions: 'Run `git commit -m "Initial commit"`. All staged files (index.html, app.js) will be recorded as the first commit.',
    hint: 'Write commit messages in imperative mood: "Add feature", not "Added feature". The staging area clears after each commit. Run `git log` afterward to see your commit in history.',
    initialState: createInitialState({
      initialized: true,
      commits: {}, branches: { 'main': null }, head: 'main',
      workingDirectory: { 'index.html': 'untracked', 'app.js': 'untracked' },
      stagingArea: ['index.html', 'app.js'],
      remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => Object.keys(state.commits || {}).length >= 1
  },
  {
    id: 5, tier: 1,
    title: '5. Inspecting History (git log)',
    description: 'Understanding your project history is essential. `git log` shows the chain of commits — who changed what, when, and why. `git show` lets you inspect a single commit\'s full diff.',
    objective: 'Use `git log` or `git show` to explore the commit history.',
    instructions: 'Run `git log` to see all commits. Try `git log --oneline` for a compact view. Then run `git show C1` to inspect a specific commit\'s diff.',
    hint: '`git log` follows the parent chain backward from HEAD. Use `--oneline` for a quick overview and `--all` to include all branches. `git show C1` prints the commit diff.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial project setup',       branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add homepage layout',         branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Fix mobile responsiveness',   branch: 'main' }
      },
      branches: { 'main': 'C2' }, head: 'main',
      workingDirectory: {}, stagingArea: [],
      remoteBranches: { 'main': 'C2' },
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: { 'origin': 'https://github.com/user/repo.git' }
    }),
    goalCondition: (_, cmds) => cmds.has('log') || cmds.has('show')
  },
  {
    id: 6, tier: 1,
    title: '6. Viewing Differences (git diff)',
    description: '`git diff` shows exactly what changed line-by-line. Red lines (-) were removed, green lines (+) were added. It\'s your most powerful pre-commit review tool.',
    objective: 'Use `git diff` to inspect changes in the working directory.',
    instructions: 'Run `git diff` to see unstaged changes. Run `git diff --staged` to see what\'s already staged. Then stage the files with `git add index.html`.',
    hint: '`git diff` compares working directory vs staging area. `git diff --staged` compares staging area vs last commit. `git diff C0 C1` compares two specific commits.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',   branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add navigation',   branch: 'main' }
      },
      branches: { 'main': 'C1' }, head: 'main',
      workingDirectory: { 'index.html': 'modified', 'styles.css': 'modified' },
      stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (_, cmds) => cmds.has('diff')
  },

  // ── TIER 2: Branching ────────────────────────────────────────────────────
  {
    id: 7, tier: 2,
    title: '7. Creating Branches (git branch)',
    description: 'Branches are lightweight movable pointers to commits. They allow you to work on features, fixes, or experiments in isolation without affecting the main codebase. Creating a branch is essentially free.',
    objective: 'Create a new `dev` branch and switch to it.',
    instructions: 'Run `git branch dev` to create the branch, then `git switch dev` to switch. Or use `git switch -c dev` (or `git checkout -b dev`) to do both at once.',
    hint: 'A branch is just a file containing a commit hash — it\'s O(1) to create. HEAD is a pointer that moves with you as you switch branches. `git branch` lists all branches.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',          branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Base structure ready',    branch: 'main' }
      },
      branches: { 'main': 'C1' }, head: 'main',
      workingDirectory: {}, stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => state.head === 'dev' && state.branches?.['dev'] !== undefined
  },
  {
    id: 8, tier: 2,
    title: '8. Fast-Forward Merge',
    description: 'When the branch you\'re merging is directly ahead of your current branch (no divergence), Git can fast-forward: it simply moves your branch pointer forward. No merge commit is created — history stays linear.',
    objective: 'Merge the `feature` branch into `main` (fast-forward).',
    instructions: 'You\'re already on `main`. Run `git merge feature` to fast-forward `main` to C2.',
    hint: 'Fast-forward is possible because `feature` is a direct descendant of `main` — there\'s a straight line from C1 to C2. Git just advances the `main` pointer. Use `--no-ff` to force a merge commit.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',       branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add navbar component', branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Add hero section',     branch: 'feature' }
      },
      branches: { 'main': 'C1', 'feature': 'C2' }, head: 'main',
      workingDirectory: {}, stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => state.branches?.['main'] === 'C2' && state.head === 'main'
  },
  {
    id: 9, tier: 2,
    title: '9. Three-Way Merge',
    description: 'When both branches have diverged (each has unique commits since splitting), Git performs a three-way merge using the common ancestor. This creates a new merge commit with TWO parents.',
    objective: 'Merge the `dev` branch into `main` (creates a merge commit).',
    instructions: 'You\'re on `main`. Both branches diverged from C0. Run `git merge dev` to create a merge commit that combines both histories.',
    hint: 'Git finds common ancestor C0, then combines the changes from C1 (main) and C2 (dev) into a new merge commit C3 with two parents. The graph will show a diamond shape.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',       branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Hotfix on main',        branch: 'main' },
        'C2': { id: 'C2', parents: ['C0'], message: 'New feature on dev',    branch: 'dev' }
      },
      branches: { 'main': 'C1', 'dev': 'C2' }, head: 'main',
      workingDirectory: {}, stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => {
      const mainCommit = state.commits?.[state.branches?.['main']]
      return mainCommit?.parents?.includes('C1') && mainCommit?.parents?.includes('C2')
    }
  },
  {
    id: 10, tier: 2,
    title: '10. Rebase for Linear History',
    description: 'Rebasing moves commits to a new base, replaying them one-by-one. The result is a clean linear history — as if you\'d always branched from the latest commit. Commits are recreated with new hashes.',
    objective: 'Rebase the `feature` branch onto `main`.',
    instructions: 'You\'re already on `feature`. Run `git rebase main` to replay the feature commits on top of C1.',
    hint: 'Rebase creates NEW commits (new hashes) with the same changes. The old commits become unreachable. Golden rule: NEVER rebase commits that are already on a shared remote branch.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',           branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Core update on main',      branch: 'main' },
        'C2': { id: 'C2', parents: ['C0'], message: 'Draft UI on feature',      branch: 'feature' }
      },
      branches: { 'main': 'C1', 'feature': 'C2' }, head: 'feature',
      workingDirectory: {}, stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => {
      const featureCommit = state.commits?.[state.branches?.['feature']]
      return featureCommit?.parents?.includes('C1') && state.head === 'feature'
    }
  },
  {
    id: 11, tier: 2,
    title: '11. Cherry-Picking Commits',
    description: 'Cherry-pick copies a specific commit from anywhere in the history and applies it on top of your current branch. A new commit is created with the same changes but a different hash and new parent.',
    objective: 'Cherry-pick the bugfix commit `C2` from `dev` onto `main`.',
    instructions: 'You\'re on `main`. Run `git cherry-pick C2` to copy the critical bugfix commit from the dev branch directly onto main.',
    hint: 'Cherry-picking is useful when you need one specific fix from another branch without merging everything. The new commit\'s message will include "(cherry-picked)" in this simulator.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',               branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add new features',              branch: 'dev' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Fix critical Bugfix in auth',   branch: 'dev' }
      },
      branches: { 'main': 'C0', 'dev': 'C2' }, head: 'main',
      workingDirectory: {}, stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => {
      const mainCommit = state.commits?.[state.branches?.['main']]
      return mainCommit?.message?.includes('Bugfix') && mainCommit?.parents?.includes('C0')
    }
  },
  {
    id: 12, tier: 2,
    title: '12. Stashing Work in Progress',
    description: '`git stash` temporarily shelves your uncommitted changes so you can switch context. Your working directory becomes clean, and you can restore everything exactly as it was later.',
    objective: 'Stash your current work-in-progress, then restore it with `git stash pop`.',
    instructions: 'Run `git stash` to save changes. Run `git stash list` to see the stash stack. Run `git stash pop` to restore and remove the latest stash entry.',
    hint: 'Stash is a stack — you can push multiple entries. `pop` restores and removes the top entry; `apply` restores without removing. Use `stash show` to inspect what\'s stashed.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',   branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add login page',   branch: 'main' }
      },
      branches: { 'main': 'C1' }, head: 'main',
      workingDirectory: { 'dashboard.js': 'modified', 'api.js': 'untracked' },
      stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state, cmds) => cmds.has('stash-push') && cmds.has('stash-pop')
  },
  {
    id: 13, tier: 2,
    title: '13. Tagging Releases (git tag)',
    description: 'Tags are permanent markers in history — used for release versions (v1.0.0, v2.1.3). Unlike branches, tags never move. Annotated tags store a message, tagger, and timestamp; lightweight tags are just a name → commit pointer.',
    objective: 'Create an annotated tag `v1.0.0` marking this commit as a stable release.',
    instructions: 'Run `git tag -a v1.0.0 -m "First stable release"` to create an annotated tag. Run `git tag` to list all tags.',
    hint: 'Lightweight tag: `git tag v1.0.0`. Annotated tag: `git tag -a v1.0.0 -m "message"`. Always use annotated tags for releases — they carry full metadata and can be GPG-signed.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',     branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Complete feature set',branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Final QA fixes',      branch: 'main' }
      },
      branches: { 'main': 'C2' }, head: 'main',
      workingDirectory: {}, stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => Object.keys(state.tags || {}).length >= 1
  },

  // ── TIER 3: Advanced & Remote ────────────────────────────────────────────
  {
    id: 14, tier: 3,
    title: '14. Managing Remotes (git remote)',
    description: 'A "remote" is a named reference to another Git repository — typically on GitHub or GitLab. By convention the primary remote is called `origin`. Remotes tell Git where to push to and pull from.',
    objective: 'Add a remote named `origin` pointing to a GitHub repository.',
    instructions: 'Run `git remote add origin https://github.com/your-user/repo.git`. Verify with `git remote -v`.',
    hint: 'You can have multiple remotes (e.g., `origin` for your fork, `upstream` for the original). Each remote tracks its own branches as `remote/branch` refs in your local repo.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',          branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add project structure',   branch: 'main' }
      },
      branches: { 'main': 'C1' }, head: 'main',
      workingDirectory: {}, stagingArea: {}, remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => Object.keys(state.remotes || {}).length > 0
  },
  {
    id: 15, tier: 3,
    title: '15. Pushing to GitHub (git push)',
    description: 'Pushing uploads your local commits to the remote repository. The first push to a new remote uses `-u` to set the upstream tracking branch. After that, `git push` alone is enough.',
    objective: 'Push your local `main` branch to the remote origin.',
    instructions: 'Check status with `git status`, then run `git push -u origin main` to push all commits and set the upstream tracking branch.',
    hint: '`-u` (or `--set-upstream`) permanently links your local branch to `origin/main`. After that, Git remembers where to push/pull without specifying the remote each time.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',            branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add landing page',          branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Implement contact form',    branch: 'main' }
      },
      branches: { 'main': 'C2' }, head: 'main',
      workingDirectory: {}, stagingArea: [],
      remoteBranches: { 'main': 'C0' },
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {},
      remotes: { 'origin': 'https://github.com/SID9927/stackwithsid.git' }
    }),
    goalCondition: (state) => state.remoteBranches?.['main'] === 'C2'
  },
  {
    id: 16, tier: 3,
    title: '16. Fetching & Pulling Updates',
    description: '`git fetch` downloads new commits from the remote but does NOT merge them — safe to inspect first. `git pull` does fetch + merge in one step. In team environments, prefer fetch → review → merge.',
    objective: 'Pull the latest changes from the remote to update your local `main` branch.',
    instructions: 'The remote is ahead by 1 commit (C1). Run `git fetch` to download the refs, then `git pull` to integrate. Or just `git pull` directly.',
    hint: '`git fetch` updates `origin/main` but leaves your local `main` unchanged. `git pull` is `git fetch` + `git merge`. Use `git pull --rebase` to avoid a merge commit in your local history.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',                       branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Remote: New feature from teammate',    branch: 'main' }
      },
      branches: { 'main': 'C0' }, head: 'main',
      workingDirectory: {}, stagingArea: [],
      remoteBranches: { 'main': 'C1' },
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {},
      remotes: { 'origin': 'https://github.com/SID9927/stackwithsid.git' }
    }),
    goalCondition: (state) => state.branches?.['main'] === 'C1'
  },
  {
    id: 17, tier: 3,
    title: '17. Undoing with Reset',
    description: '`git reset` moves the branch pointer backward, "undoing" commits. The three modes differ in what happens to the changes: `--soft` keeps them staged, `--mixed` unstages them, `--hard` discards them permanently.',
    objective: 'Discard the broken commit C2 and reset `main` back to C1.',
    instructions: 'Run `git log --oneline` to see history. Then run `git reset --hard HEAD~1` to discard the last commit and all its changes.',
    hint: '`HEAD~1` = one commit before HEAD. `--hard` discards both the commit AND its working directory changes. Only use `reset` on LOCAL commits — never on commits already pushed to a shared remote.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',           branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Good stable code',         branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Oops: broken experiment',  branch: 'main' }
      },
      branches: { 'main': 'C2' }, head: 'main',
      workingDirectory: {}, stagingArea: [], remoteBranches: {},
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {}, remotes: {}
    }),
    goalCondition: (state) => state.branches?.['main'] === 'C1'
  },
  {
    id: 18, tier: 3,
    title: '18. Safe Undo with Revert',
    description: '`git revert` is the SAFE way to undo changes on shared branches. It creates a NEW commit that reverses the changes of a previous commit, preserving history completely — making it safe for team use.',
    objective: 'Safely undo the last commit using `git revert HEAD`.',
    instructions: 'Run `git log --oneline` to see the history. Then run `git revert HEAD` to create a new commit that undoes the last one.',
    hint: '`git revert` never deletes history — it adds an "undo" commit. `git reset --hard` rewrites history. Rule: if the commits are already pushed/shared → use `revert`. Local only → `reset` is fine.',
    initialState: createInitialState({
      initialized: true,
      commits: {
        'C0': { id: 'C0', parents: [],     message: 'Initial commit',                  branch: 'main' },
        'C1': { id: 'C1', parents: ['C0'], message: 'Add dark mode feature',           branch: 'main' },
        'C2': { id: 'C2', parents: ['C1'], message: 'Accidentally broke sidebar',      branch: 'main' }
      },
      branches: { 'main': 'C2' }, head: 'main',
      workingDirectory: {}, stagingArea: [],
      remoteBranches: { 'main': 'C2' },
      config: { 'user.name': 'Dev', 'user.email': 'dev@example.com' },
      stash: [], tags: {},
      remotes: { 'origin': 'https://github.com/SID9927/stackwithsid.git' }
    }),
    goalCondition: (state) => {
      const mainCommit = state.commits?.[state.branches?.['main']]
      return mainCommit?.message?.startsWith('Revert')
    }
  }
]
