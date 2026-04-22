# Parallel Worktree Strategy

Strategy for decomposing large features into parallelizable work units using git worktrees. Each work unit gets its own branch, worktree, and PR — enabling multiple Kiro instances to work simultaneously.

## Concepts

- **Base branch**: `{branch}` — the integration branch where all sub-PRs merge into (user provides the full name, e.g., `feature/x`, `refactor/y`, `fix/z`)
- **Sub-branch**: `{branch}-pr{n}` — an individual PR-able unit of work
- **Worktree root**: `../{repo}-worktrees/{feature-name}/` — all worktrees for a feature live under one folder, keeping the project directory clean
- **Worktree path**: `../{repo}-worktrees/{feature-name}/prN` — each sub-PR gets its own subfolder
- **Foundation phase**: Tasks that must complete before parallel work can begin (shared types, schemas, interfaces)
- **Parallel phase**: Tasks that don't touch the same files and can execute simultaneously
- **Execution phase**: A group of tasks at the same dependency level

### Folder Structure

```
Projects/
  {repo}/                                    ← main repo
  {repo}-worktrees/
    {feature-name}/                          ← one folder per feature/PBI
      pr1/                                   ← foundation
      pr2/                                   ← parallel
      pr3/                                   ← parallel
      pr4/                                   ← integration
    {another-feature}/
      pr1/
      pr2/
```

## Branch Naming Convention

The base branch name is whatever the user provides. Sub-branches append `-prN`.

```
{branch}              ← base branch (from main), e.g. feature/connector-redesign, refactor/cleanup-schemas
{branch}-pr1          ← foundation: shared types
{branch}-pr2          ← parallel: list component
{branch}-pr3          ← parallel: detail modal
{branch}-pr4          ← parallel: API client
{branch}-pr5          ← integration: wiring + tests
```

## Agent Responsibilities

After design.md and tasks.md are complete, the agent MUST:

1. Analyze tasks for file-level dependencies
2. Group tasks into execution phases (foundation → parallel → integration)
3. Produce a `worktree-plan.md` in the spec folder
4. Ask the user: "What should the base branch name be?" (e.g., `feature/connector-redesign`, `refactor/cleanup-schemas`, `fix/auth-flow`)
5. Use the user's answer as `{branch}` in all subsequent git commands
6. Save the branch name in `.kiro/specs/{feature}/.config.kiro` so future sessions can read it
7. Execute all git commands directly — do NOT just present them to the user

## Branch Name Persistence

The branch name MUST be saved in the spec's config file so any future session can read it
without asking the user again.

After the user provides the branch name, add it to `.kiro/specs/{feature}/.config.kiro`:

```json
{
  "specType": "feature",
  "workflowType": "requirements-first",
  "branch": "feature/connector-redesign"
}
```

On any subsequent session, read `.config.kiro` first. If `branch` exists, use it — don't ask again.

## Workflow

### Step 1: Analyze & Plan (agent does this)

After tasks.md is finalized, analyze each task and determine:
- Which files/modules it touches
- Which tasks depend on other tasks' output
- Which tasks can run independently

Produce `.kiro/specs/{feature}/worktree-plan.md` with the format below.

### Step 2: Create base branch (agent runs this)

```bash
git checkout -b {branch} main
git push -u origin {branch}
```

### Step 3: Create worktrees (agent runs this)

For each sub-branch in the plan:

```bash
mkdir -p ../{repo}-worktrees/{feature-name}
git worktree add ../{repo}-worktrees/{feature-name}/pr1 -b {branch}-pr1 {branch}
git worktree add ../{repo}-worktrees/{feature-name}/pr2 -b {branch}-pr2 {branch}
git worktree add ../{repo}-worktrees/{feature-name}/pr3 -b {branch}-pr3 {branch}
```

Since `.kiro/` is gitignored, it won't exist in the new worktrees.
Symlink `.kiro/` from the main repo into each worktree so all instances share the same guides, steering, knowledge, and agents:

```bash
ln -s "$(pwd)/.kiro" ../{repo}-worktrees/{feature-name}/pr1/.kiro
ln -s "$(pwd)/.kiro" ../{repo}-worktrees/{feature-name}/pr2/.kiro
ln -s "$(pwd)/.kiro" ../{repo}-worktrees/{feature-name}/pr3/.kiro
# Repeat for each worktree
```

This means:
- All worktrees read the same guides, steering, knowledge, and agents — updates in the main repo are instantly visible
- Spec files (`.kiro/specs/{feature}/`) are also shared — no need to copy them separately

**Per-worktree config:** Since `.kiro/` is now shared, each worktree can't have its own `.config.kiro` at the same path. Instead, store per-worktree configs as `.config.{subPrId}.kiro`:

```
.kiro/specs/{feature}/.config.kiro          ← main/shared config (branch, notionPageId, pbiId)
.kiro/specs/{feature}/.config.pr1.kiro      ← pr1: assignedTasks, dependsOn
.kiro/specs/{feature}/.config.pr2.kiro      ← pr2: assignedTasks, dependsOn
```

Each worktree agent reads `.config.kiro` for shared fields, then `.config.{subPrId}.kiro` for its own assignments. The agent identifies its `subPrId` from `git branch --show-current` (strip the `-prN` suffix pattern).

Each worktree lives under `../{repo}-worktrees/{feature-name}/`, keeping the project directory clean.

#### Generate `start-execution.md` for each worktree

After copying the spec folder, generate a `start-execution.md` steering file in each worktree's `.kiro/steering/` directory. This file gives the agent everything it needs to execute autonomously when the user types `#start-execution` in chat.

**File location:** `../{repo}-worktrees/{feature-name}/{subPrId}/.kiro/steering/start-execution.md`
**Inclusion:** `manual` (user triggers it via `#start-execution`)

**Template  populate per worktree from worktree-plan.md and .config.kiro:**

```markdown
---
inclusion: manual
---

# Start Execution  {subPrId} ({phase description})

## What This Is
This is worktree {subPrId} for the **{feature name}** feature (PBI #{pbiId}).
Branch: `{branch}-{subPrId}`
Parent branch: `{branch}`
Repo: {repo}

## Assigned Tasks
Execute tasks **{task numbers}** from `.kiro/specs/{feature}/tasks.md`.

{Brief description of what these tasks do and why they matter.}

## Agent Workflow
- Read `.kiro/specs/{feature}/.config.kiro` for shared metadata (notionPageId, branch, PBI info) and `.config.{subPrId}.kiro` for assigned tasks and dependencies
- Run dependency check (see Dependency Check section) — this includes automatic Notion reconciliation of stale Sub-PR Status rows
- Match tasks to the correct workflow from agent-workflow.md and read the corresponding guide
- If tasks are backend (C#): follow `@backend` -> `@quality-assurance` -> fix if needed
- If tasks are frontend (JS/ASPX): follow `@frontend` -> `@quality-assurance` -> fix if needed
- If tasks are mixed: use the appropriate agent per sub-task

## Files to Create
{List new files from worktree-plan.md}

## Files to Modify
{List modified files from worktree-plan.md}

## Naming Conventions
- Follow existing patterns in the codebase
- C#: PascalCase for classes/properties, I-prefix for interfaces
- JavaScript: camelCase for functions/variables
- Commit messages: conventional commit format `type(scope): description`

## After Completion
- Ensure all code compiles/works cleanly
- Commit with conventional commit format
- Push to `{branch}-{subPrId}`
- Update Notion page (notionPageId in .config.kiro)  mark this PR's tasks as completed
- Tell the user: "Done. Create a PR from `{branch}-{subPrId}` -> `{branch}` and merge it."

## Dependencies
{List dependency PRs from .config.kiro dependsOn field, or "None" for foundation.}
{If dependencies exist: "Before starting, verify these PRs are merged into {branch} via GitHub MCP. If not merged, do NOT start."}
```

The agent MUST generate this file for each worktree during Step 3, populated with real values from the worktree-plan.md and .config.kiro.

Tell the user: "Open each folder in its own Kiro window. Type #start-execution to begin."

### Step 4: Foundation phase (tell user)

Tell the user:
1. "Open `../{repo}-worktrees/{feature-name}/pr1` in Kiro"
2. "Run the foundation tasks (tasks X, Y)"
3. "When done, create a PR from `{branch}-pr1` → `{branch}` and merge it"

### Step 5: Sync parallel worktrees (agent runs this when user confirms foundation is merged)

After foundation PR is merged, run this in EACH parallel worktree:

```bash
git fetch origin
git merge origin/{branch}
```

If the user is in a different IDE per worktree, tell them to run the sync
command in each worktree, OR run it yourself if you have access.

### Step 6: Parallel execution (tell user)

Tell the user:
1. "Open each parallel worktree in its own Kiro window (or use kiro-cli) — they're under `../{repo}-worktrees/{feature-name}/`"
2. "Each instance executes its assigned tasks from the worktree-plan"
3. "When done, create a PR from each `{branch}-prN` → `{branch}`"
4. "Merge PRs as they complete — order doesn't matter for parallel tasks"

### Step 7: Integration phase (agent runs this if needed)

If there's a final integration phase:

```bash
# Option A: Work directly on the base branch
git checkout {branch}
git pull origin {branch}

# Option B: Create a new worktree for integration
git worktree add ../{repo}-worktrees/{feature-name}/integration -b {branch}-integration {branch}
```

### Step 7.5: QA Consolidation Review (MANDATORY — before merging to main)

After all sub-PRs are merged into `{branch}` and before creating the final PR to `main`:

1. Generate the full diff: `git diff main...{branch}`
2. Run `@quality-assurance` on the entire diff with this focus:
   - **Duplicate code** — functions, helpers, types, or abstractions that multiple sub-PRs independently created
   - **Inconsistent patterns** — same problem solved differently across sub-PRs (error handling, naming, data fetching)
   - **Dead or orphaned code** — imports, types, or functions added by one sub-PR that another sub-PR made redundant
   - **Integration gaps** — components wired together but with mismatched props, types, or contracts
   - **Shared code candidates** — logic that should be extracted to a shared utility or package
3. If issues found:
   - Route fixes through the standard agent workflow (match to `agent-workflow.md`):
     - Frontend duplication/cleanup → `@frontend` → `@quality-assurance`
     - Backend duplication/cleanup → `@backend` → `@quality-assurance`
     - Proto/gRPC cleanup → `@protobuf-engineer` → `@quality-assurance`
     - Mixed → run each domain's agent, then `@quality-assurance` on the combined result
   - Fix directly on `{branch}` (or create a cleanup sub-branch if changes are large)
   - Commit with `refactor: consolidate duplicates from parallel implementation`
4. Re-run `@quality-assurance` on the full diff again to confirm consolidation is clean
5. Only after QA passes with no remaining issues → create the PR from `{branch}` → `main`

This step exists because parallel worktrees develop in isolation — each sub-PR passes QA individually, but the combined result can have semantic duplication that no single sub-PR review would catch.

### Step 8: Cleanup (agent runs this after feature merges to main)

```bash
git worktree remove ../{repo}-worktrees/{feature-name}/pr1
git worktree remove ../{repo}-worktrees/{feature-name}/pr2
git worktree remove ../{repo}-worktrees/{feature-name}/pr3
rm -rf ../{repo}-worktrees/{feature-name}

git branch -d {branch}-pr1 {branch}-pr2 {branch}-pr3
git branch -d {branch}
```

## Worktree-Plan Format

The agent produces this in `.kiro/specs/{feature}/worktree-plan.md`:

```markdown
# Worktree Plan: {feature-name}

## Base Branch
{branch}

## Execution Phases

### Phase 1: Foundation [sequential]
Branch: {branch}-pr1
Worktree: ../{repo}-worktrees/{feature-name}/pr1
Tasks: 1, 2
Must complete and merge before Phase 2.

### Phase 2: Parallel [parallel]
Branch: {branch}-pr2
Worktree: ../{repo}-worktrees/{feature-name}/pr2
Tasks: 3, 4

Branch: {branch}-pr3
Worktree: ../{repo}-worktrees/{feature-name}/pr3
Tasks: 5, 6

Branch: {branch}-pr4
Worktree: ../{repo}-worktrees/{feature-name}/pr4
Tasks: 7

### Phase 3: Integration [sequential]
Branch: {branch}-pr5
Worktree: ../{repo}-worktrees/{feature-name}/pr5
Tasks: 8, 9
Depends on: All Phase 2 PRs merged.

## Merge Order
1. pr1 → {branch} (then sync all parallel worktrees)
2. pr2, pr3, pr4 → {branch} (any order)
3. pr5 → {branch}
4. QA consolidation review on full {branch} diff vs main
5. {branch} → main

## Setup Commands
git checkout -b {branch} main
git push -u origin {branch}
mkdir -p ../{repo}-worktrees/{feature-name}
git worktree add ../{repo}-worktrees/{feature-name}/pr1 -b {branch}-pr1 {branch}
git worktree add ../{repo}-worktrees/{feature-name}/pr2 -b {branch}-pr2 {branch}
git worktree add ../{repo}-worktrees/{feature-name}/pr3 -b {branch}-pr3 {branch}
git worktree add ../{repo}-worktrees/{feature-name}/pr4 -b {branch}-pr4 {branch}
git worktree add ../{repo}-worktrees/{feature-name}/pr5 -b {branch}-pr5 {branch}

## Sync Commands (run after foundation merges)
# In each parallel worktree:
git fetch origin
git merge origin/{branch}

## Cleanup Commands
git worktree remove ../{repo}-worktrees/{feature-name}/pr1
git worktree remove ../{repo}-worktrees/{feature-name}/pr2
git worktree remove ../{repo}-worktrees/{feature-name}/pr3
git worktree remove ../{repo}-worktrees/{feature-name}/pr4
git worktree remove ../{repo}-worktrees/{feature-name}/pr5
rm -rf ../{repo}-worktrees/{feature-name}
git branch -d {branch}-pr1 {branch}-pr2 {branch}-pr3 {branch}-pr4 {branch}-pr5
```

## Dependency Check (preTaskExecution)

Before starting tasks in any worktree, the agent MUST check if prerequisite PRs
have been merged using the GitHub MCP tools:

1. Read `worktree-plan.md` to find which phase this worktree belongs to and what it depends on
2. Use `mcp_github_list_pull_requests` to check if the dependency PRs are merged into `{branch}`
3. **Reconcile Notion** — compare GitHub merge results against the Notion Sub-PR Status table:
   a. Read `notionPageId` from `.config.kiro` → retrieve the Feature_Page
   b. Read the "Sub-PR Status" section
   c. For any sub-PR that GitHub says is merged but Notion says Pending/In Progress:
      - Update that row: Status → "Merged", Merge Date → merge date from GitHub, Completed Tasks → all assigned tasks
   d. If ALL sub-PRs in the table are now Merged → update the Feature_Page Status property to "Completed"
   e. Write updated Sub-PR Status back via `patch_block_children`
4. If all dependency PRs are merged:
   - Run `git fetch origin && git merge origin/{branch}` to pull in the merged code
   - Proceed with tasks
5. If dependency PRs are NOT merged:
   - Tell the user which PRs are still pending
   - Do NOT start any tasks

Example check for PR2 that depends on Phase 1 (PR1):
```
mcp_github_list_pull_requests(owner, repo, base={branch}, state="closed")
→ Look for {branch}-pr1 in the results with merged status
→ Reconcile Notion: update any stale rows to reflect actual GitHub state
→ If dependencies met: sync and go
→ If not met: "PR1 ({branch}-pr1) hasn't been merged into {branch} yet. Hold tight."
```

## Notion Status Tracking

The parent feature's Notion page serves as the high-level status view for worktree-based features.

### When to Update Notion

- **On worktree startup (automatic)**: During the dependency check, the agent compares GitHub merge status against the Notion Sub-PR Status table and updates any stale rows. This means every worktree instance that starts automatically reconciles the state — no user action needed.
- **After each task completion**: The working instance updates its own row with completed tasks and "In Progress" status.
- **All sub-PRs merged**: When reconciliation discovers all sub-PRs are merged, update the Feature_Page Status property to "Completed".

### Ground Truth

GitHub MCP remains the ground truth for "can I start working?" dependency checks. Notion is the display layer only — never block work based on Notion status.

### Sub-PR Status Format

The Feature_Page includes a "Sub-PR Status" section:

| Sub-PR Branch | Sub-PR ID | Tasks | Completed Tasks | Status | Merge Date |
|---|---|---|---|---|---|
| {branch}-pr1 | pr1 | 1, 2 | 1, 2 | Merged | 2025-01-15 |
| {branch}-pr2 | pr2 | 3, 4 | — | Pending | — |

## Worktree Self-Identification

When a Kiro instance starts inside a worktree, it identifies itself via git branch name, then reads the matching config files.

### Detection Steps (Priority Order)

1. Run `git branch --show-current` → extract `subPrId` via regex `^(.+)-pr(\d+)$`
2. Read `.kiro/specs/{feature-name}/.config.kiro` (shared fields)
3. Read `.kiro/specs/{feature-name}/.config.{subPrId}.kiro` (assigned tasks, dependencies)
4. If `dependsOn` is present → check dependency merge status via GitHub MCP before starting tasks
5. **Reconcile Notion** — after the GitHub check, compare merge results against the Notion Sub-PR Status table and update any stale rows (see Dependency Check step 3)
6. If configs are missing or incomplete → fall back to full git detection:
   a. Run `git branch --show-current` to get the current branch name
   b. Read the workspace folder name
   c. Test the branch against the pattern `{parent-branch}-prN`:
      - Regex: `^(.+)-pr(\d+)$`
      - If NO match → standard session, skip self-identification
      - If match → worktree session, continue
   d. Derive the parent branch: strip the `-prN` suffix
   e. Derive the repo: strip any `-prN` suffix from the folder name
   f. Use Branch-First Lookup Strategy to find the parent Feature_Page
   g. If found → read Sub-PR Status → extract assigned tasks → write `notionPageId` back to `.config.kiro`
   h. If not found → inform user, offer to create one

### Per-Instance Behavior

- Each instance reads `.config.kiro` at startup for its `assignedTasks` and `notionPageId`
- Each instance writes ONLY to its own row in Sub-PR Status when completing tasks
- Each instance updates its row status: Pending → In Progress as tasks complete
- Instances never modify other instances' rows

### Task Completion Updates

After completing each assigned task, the worktree instance MUST:
1. Read `notionPageId` from `.config.kiro`
2. Retrieve the parent Feature_Page from Notion
3. Read the "Sub-PR Status" section
4. Mark the completed task in the "Completed Tasks" column of its row
5. Update its row status to "In Progress" (if not already)
6. Write the updated section back via `patch_block_children`

## Worktree Config Schema (.config.kiro)

Since `.kiro/` is symlinked, all worktrees share the same config directory. Configs are split into shared and per-worktree files:

```
.kiro/specs/{feature}/.config.kiro          ← shared (branch, notionPageId, pbiId, repo)
.kiro/specs/{feature}/.config.pr1.kiro      ← pr1-specific (assignedTasks, dependsOn)
.kiro/specs/{feature}/.config.pr2.kiro      ← pr2-specific
```

### Shared Config (.config.kiro)

Generated when the base branch and initial Notion Feature_Page are created:

```json
{
  "specType": "feature",
  "workflowType": "requirements-first",
  "branch": "feature/searchbar",
  "notionPageId": "abc123-def456",
  "repo": "Ubiquity-WebApps",
  "pbiId": "PBI-1234",
  "pbiName": "Add searchbar to connector list",
  "pbiLink": "https://dev.azure.com/org/project/_workitems/edit/1234"
}
```

PBI fields are omitted when no PBI is provided.

### Per-Worktree Config (.config.{subPrId}.kiro)

Generated during worktree setup. Contains only the sub-PR specific fields:

```json
{
  "subPrId": "pr2",
  "assignedTasks": [3, 4],
  "dependsOn": ["pr1"]
}
```

Each worktree agent identifies its `subPrId` from `git branch --show-current` (regex: `^(.+)-pr(\d+)$`), then reads `.config.kiro` for shared fields + `.config.{subPrId}.kiro` for its assignments.

### Field Reference

| Field | Shared | Per-Worktree | Description |
|---|---|---|---|
| specType | ✓ | — | Spec type: feature, task, bugfix, refactor |
| workflowType | ✓ | — | Workflow: requirements-first, design-first |
| branch | ✓ | — | Parent/integration branch name |
| notionPageId | ✓ | — | Notion Feature_Page ID for direct lookup |
| repo | ✓ | — | Repository name (e.g., Ubiquity-WebApps) |
| pbiId | ✓* | — | Azure DevOps PBI identifier (*if PBI provided) |
| pbiName | ✓* | — | PBI human-readable name (*if PBI provided) |
| pbiLink | ✓* | — | Azure DevOps work item URL (*if PBI provided) |
| subPrId | — | ✓ | Sub-PR identifier (e.g., "pr1", "pr2") |
| assignedTasks | — | ✓ | Array of task numbers for this worktree |
| dependsOn | — | ✓ | Array of sub-PR IDs that must merge first |

### Generation Timing

- **Shared config**: Written when the parallel-worktree-strategy creates the base branch and initial Notion Feature_Page
- **Per-worktree configs**: Generated during worktree setup step, one `.config.{subPrId}.kiro` per sub-PR, populated from `worktree-plan.md`
- **notionPageId backfill**: Written back to `.config.kiro` (shared) whenever the Branch-First Lookup Strategy successfully locates or creates a Feature_Page

## Git Worktree Key Facts

- All worktrees share the same `.git` object store — they know about all branches
- Each worktree has its own isolated working directory and checked-out branch
- Changes on other branches do NOT appear in your worktree until you explicitly merge/rebase
- You can read any branch's files without switching: `git show feature/name:path/to/file`
- Worktrees are cheap — they're just directories, not full clones
- `.kiro/` is symlinked from the main repo — all worktrees share the same guides, steering, knowledge, and agents. Per-worktree config is split via `.config.{subPrId}.kiro` files

## Rules

- Foundation tasks MUST merge before parallel tasks start
- Each sub-branch should only touch files assigned to it — minimize overlap
- If two tasks must touch the same file, they go in the same sub-branch or sequential phases
- Always sync from base branch before starting dependent work
- The base branch is the integration point — never merge sub-branches into each other
- Each sub-branch PR should be independently reviewable and not break the base branch
- The agent MUST execute git commands directly when it has shell access — don't make the user copy-paste
- Only tell the user to run commands when the agent can't (e.g., commands in a different worktree/IDE)
- NEVER create the final PR from {branch} → main without running @quality-assurance on the full consolidated diff first (Step 7.5)
