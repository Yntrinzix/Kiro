---
inclusion: manual
---

# Worktree Phase 2: Setup

Create branches, worktrees, and configs. Run after user approves the worktree-plan.

## Step 1: Create Base Branch

```bash
git checkout -b {branch} main
git push -u origin {branch}
```

## Step 2: Create -local Worktree (development target)

```bash
mkdir -p ../{repo}-worktrees/{feature-name}
git worktree add ../{repo}-worktrees/{feature-name}/local -b {branch}-local {branch}
ln -s "$(pwd)/.kiro" ../{repo}-worktrees/{feature-name}/local/.kiro
```

This is where ALL development happens. Fully integrated, never blocked.

## Step 3: Create PR Worktrees (review targets)

One per PR branch from the worktree-plan:

```bash
git worktree add ../{repo}-worktrees/{feature-name}/{name1} -b {branch}/{name1} {branch}
git worktree add ../{repo}-worktrees/{feature-name}/{name2} -b {branch}/{name2} {branch}
ln -s "$(pwd)/.kiro" ../{repo}-worktrees/{feature-name}/{name1}/.kiro
ln -s "$(pwd)/.kiro" ../{repo}-worktrees/{feature-name}/{name2}/.kiro
```

These worktrees receive files during shipping. No development happens here.

## Step 4: Config

Write `.kiro/specs/{feature}/.config.kiro`:

```json
{
  "specType": "feature",
  "branch": "{branch}",
  "repo": "{repo}",
  "pbiId": "{pbiId}",
  "pbiName": "{pbiName}"
}
```

## Step 5: Tell User

"Setup complete. Open `../{repo}-worktrees/{feature-name}/local` in Kiro and start coding. When ready to ship, use Phase 3."

## Step 6: Copy .env Files

`.env` files are gitignored and won't exist in new worktrees. Copy them from the main repo:

```bash
# For WebApps monorepo — copy all app .env files
cp {main-repo}/monorepo/apps/database/.env ../{repo}-worktrees/{feature-name}/local/monorepo/apps/database/.env
cp {main-repo}/monorepo/apps/journey-builder/.env ../{repo}-worktrees/{feature-name}/local/monorepo/apps/journey-builder/.env
```

Check `apps/*/.env.template` for which apps need `.env` files. Without them, the app falls back to placeholder defaults and fails at runtime with DNS errors.

## Gate: Before Proceeding

- [ ] Base branch created and pushed
- [ ] -local worktree created (development target)
- [ ] PR worktrees created (review targets)
- [ ] .kiro symlinked into all worktrees
- [ ] .config.kiro written
- [ ] .env files copied to worktree apps

**Next:** `.kiro/guides/workflow/worktree-3-execute.md`
