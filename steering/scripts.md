---
inclusion: manual
---

# Scripts

Shortcut keywords that trigger specific actions. When the user says one of these words, execute the corresponding action immediately — no confirmation needed.

## Staleness Checks

At the start of each session, silently check:
- Read `/mnt/c/Users/T828819/.kiro/knowledge/last-upskill.md` — if the date is older than 3 months (or the file doesn't exist), suggest: "It's been over 3 months since your last upskill. Want me to run it?"
- Do NOT block the session or auto-run. Just mention it once.

| Keyword | Action |
|---------|--------|
| `synthesis` | `/spawn` with prompt: "Read `/mnt/c/Users/T828819/.kiro/guides/workflow/learning-synthesis.md` and execute the synthesis prompt inside it." After completion, update `/mnt/c/Users/T828819/.kiro/knowledge/last-synthesis.md` with today's date. |
| `guide cleanup` | `/spawn` with prompt: "Scan all guides in `/mnt/c/Users/T828819/.kiro/guides/`. Find duplicate content across guides, stale entries, conflicting recommendations, and overly verbose sections. Propose consolidations and removals." |
| `pr status` | Check all open PRs across Ubiquity repos (WebApps, Backend, Protos, Connectors) and summarize: branch, title, review status, CI status. |
| `dep check` | For the current worktree: read `.config.kiro`, check if dependency PRs are merged via GitHub, report which are ready and which are blocking. |
| `post-merge retro` | After user reports a PR merge: verify via GitHub MCP, diff planned tasks (tasks.md) vs what shipped, note scope changes or workarounds, write a 3-line retro to the Notion Feature_Page, flag if any guide would have prevented issues found during review. For worktree features, merge status is already discovered automatically during dependency check reconciliation — this script adds the retrospective content on top. |
| `parallel qa` | (CLI only) While implementing the current task, `/spawn` a QA review of the previously completed task. Usage: "parallel qa [task number or file path just completed]". Spawns `@quality-assurance` to review while you keep working. |
| `drift check` | `/spawn` with prompt: "Read `/mnt/c/Users/T828819/.kiro/steering/ubiquity-architecture.md`. Then scan actual repo structures, package.json files, and proto definitions across Ubiquity repos. Flag any mismatches where the architecture doc says X but the codebase shows Y. Output a list of proposed corrections to the architecture doc." |
| `smart split` | Before splitting tasks, query Notion Engineering Decisions database for past features in the same domain. Summarize which task splits worked well (small PRs, clean merges) vs poorly (merge conflicts, scope creep). Feed this context to @taskmaster before it produces the task breakdown. |
| `deps` | Given a repo or component name, show all downstream consumers and upstream dependencies. Lists which repos import/reference it, what breaks if it changes, and what regeneration steps are needed. Auto-triggered during planning/design — can also be called manually. |
| `cleanup` | After a feature merges to main: read `.config.kiro` for branch and repo, remove all worktrees under `../{repo}-worktrees/{feature-name}/`, delete the feature folder, delete all sub-branches and the base branch locally and on origin, update Notion Feature_Page status to "Completed". |
| `upskill` | Check for new patterns, releases, and breaking changes in the project's stack. For each technology (Next.js, React, Tailwind, Bun, Biome, .NET, NUnit, gRPC, Buf, Connect, Prefect, FastAPI, Terraform), search official docs and changelogs for updates since the last upskill. Compare against current guides and propose updates. Also check skills.sh for vendor-provided skills (Vercel, Anthropic, GitHub only — skip community skills). Record the date in `/mnt/c/Users/T828819/.kiro/knowledge/last-upskill.md`. |
| `trace` | Given a file path, use LSP (get_document_symbols, find_references, goto_definition) to map: 1) What's inside the file (classes, methods, properties), 2) Who calls it (upstream consumers), 3) What it depends on (downstream dependencies). Output a Mermaid diagram of the relationships + a text summary. Usage: `trace path/to/file.cs` or `trace path/to/Component.tsx`. |
| `visualize` | Generate a full system Mermaid diagram from `/mnt/c/Users/T828819/.kiro/steering/ubiquity-architecture.md`. Output: 1) C4 context diagram (repos + external systems), 2) Data flow diagram (how data moves between services), 3) Dependency graph (what depends on what, including packages). Ready to paste into Notion, Miro, or any Mermaid renderer. |
| `review` | Switch to `@pr-reviewer` agent. Give it a PR URL or PR number + repo. It reads the PR description, linked issues, and code changes, then presents findings for your approval before posting any comments. |
| `rescan` | Given a knowledge entry name (e.g., `rescan backend-mvc-architecture`), re-read the source files and directories referenced in that `.kiro/knowledge/` entry, check `git log --since="30 days" --name-only` for recent changes in those areas, spawn @architect to compare current state against the knowledge file, and propose updates for anything that's changed, new, or stale. If no name given, list all knowledge entries from `.kiro/knowledge/README.md` and ask which to rescan. After updates are approved, re-index the entry via `knowledge update`. |
| `scripts` | List all available scripts from this table. |
