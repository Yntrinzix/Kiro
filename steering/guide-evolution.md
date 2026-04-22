---

inclusion: always

---



# Guide Evolution Protocol



Agents MUST improve their own guides over time. The guides are your persistent memory across sessions — they're how you get better at working with this codebase and this team.



## When to Propose Guide Updates



After completing a task, OR when any of the following occur during a session, propose a guide update:



### Corrections & Feedback



- The user corrected your approach and you agreed — the guide should reflect the better solution

- The user suggested an approach that's cleaner or more idiomatic than what the guide recommends — propose replacing the existing guidance

- The user reports a recurring agent mistake ("you always do X wrong") — add a "don't do this" entry to the relevant guide so future sessions avoid it

- The user expresses a workflow preference (e.g., "always show me the diff first") — capture it in the relevant guide



### PR Review Learning


**MANDATORY**: After addressing any PR review comment that required a code change, IMMEDIATELY check if the feedback reveals a missing or incorrect guide entry. Do not defer to end-of-session. The guide update is part of completing the PR review fix  not a separate step.



- A PR reviewer suggested a better approach — check if a guide covers that topic. If yes, update it. If no, propose creating one

- A PR reviewer flagged a convention or pattern your code didn't follow — document it so it's not missed again

- A PR review comment reveals a project norm that no guide mentions — propose adding it

- A PR reviewer suggested a better technical approach (e.g., different API pattern, cleaner abstraction) — propose updating the relevant guide to recommend that approach going forward



### Pattern Recognition



- A pattern you used successfully that isn't documented in your guides — propose adding it

- The user explicitly praises or reuses a pattern — if it's not documented, propose adding it

- You solved a non-obvious problem (tricky interop, subtle config, unexpected behavior) — propose documenting the solution so future sessions don't re-discover it

- You had to improvise because no guide covered the situation — flag the gap and propose filling it



### Codebase Discoveries (Knowledge Base)



When you discover something non-obvious about the codebase during a task, propose adding it to the knowledge base.



Two knowledge stores are available:



1. `.kiro/knowledge/` — Manual notes (works in IDE and CLI). Use the table-of-contents approach: scan `README.md` index, only read matching entries.

2. `kiro-cli /knowledge` — Semantic search over indexed codebase (CLI only, experimental). Supports natural language queries and finds related concepts without exact keyword matches. Enable with `kiro-cli settings chat.enableKnowledge true`.



Use `.kiro/knowledge/` for:

- Gotchas, anti-patterns, and "things that surprised us"

- Undocumented API contracts or conventions

- Hidden dependencies between components

- Environment-specific quirks



Use `kiro-cli /knowledge` for:

- Searching across large codebases semantically

- Finding related code patterns without knowing exact file locations

- Indexing documentation, configs, and code for natural language queries



Format for `.kiro/knowledge/`: `{repo}-{topic}.md` — short, factual, no fluff.

When adding a knowledge entry, ALWAYS also add a one-liner to the index in `.kiro/knowledge/README.md` with tags so future sessions can find it without reading every file.



### Notion Knowledge Base Sync



Agents have access to a Notion Engineering Decisions database for persistent cross-session knowledge.



#### Write Triggers



- **Post-Push Retrospective**: After completing the retrospective (per `git-add-commit-push.md`), use the Branch-First Lookup Strategy (Req 14) to find or create the Feature_Page. Append retrospective findings to the relevant sections. If no page exists, create one with Status "In Progress".

- **PR Merge**: For worktree features, merge status is discovered automatically during the dependency check reconciliation (see `parallel-worktree-strategy.md` Dependency Check step 3). For non-worktree features, when the user reports a PR merge, verify via GitHub MCP `get_pull_request`, then update the Feature_Page Status to "Completed" and add the PR link. If no page exists, offer to create one.

- **Codebase Discovery**: When adding a discovery to `.kiro/knowledge/`, also append it to the relevant Feature_Page's Gotchas Discovered section in Notion. If the discovery is standalone (not tied to a feature), create a new page with Status "Completed".

- **Spec Tracking**: When a spec's `requirements.md` is created, create a Notion page with the feature name (or PBI name if available), repo, spec type, and PBI fields. When `design.md` or `tasks.md` are created, update the page with summaries. As tasks complete, update the Files Changed section.

#### Automatic Status Transitions (Kanban Flow)

The Notion Feature_Page Status property tracks the lifecycle of each feature. Agents MUST update the status at each transition:

| Trigger | Status | When |
|---------|--------|------|
| `requirements.md` created | **Spec** | Spec work has started |
| `tasks.md` created and approved | **Todo** | Spec complete, ready to code |
| First `git push` on any sub-PR branch | **In Progress** | Coding has started |
| PR created via GitHub (any sub-PR or main PR) | **In Review** | Code submitted for review |
| All sub-PRs merged into feature branch | **Merged** | Feature code complete |
| Feature branch merged into release branch | **Released** | Shipped |
| User explicitly abandons | **Abandoned** | Work stopped |

Rules:
- Status only moves forward (Spec -> Todo -> In Progress -> In Review -> Merged -> Released). Never move backward unless the user explicitly asks.
- For worktree features: "In Review" means at least one sub-PR has a PR open. "Merged" means ALL sub-PRs are merged into the feature branch.
- The agent performing the action (push, PR creation, merge) is responsible for updating the status. Don't defer to another session.
- If the current status is already ahead of the trigger (e.g., already "In Review" and another push happens), don't downgrade.
#### Read Triggers



- **Starting Domain Work**: Before beginning tasks in a domain, query the Engineering Decisions database filtered by that domain. Read the most recent page (max 5 results) and summarize prior decisions, trade-offs, and gotchas.

- **Designing New Feature**: When starting a new feature design, search Notion by feature name. Read up to 3 related pages and present relevant prior decisions to the user.



#### Lean Access Rules



- NEVER read all pages at session start

- ALWAYS filter queries by feature name or domain — no unfiltered queries

- Read the database ID from `.kiro/knowledge/notion-database-id.md` — don't search for the database

- Use `notionPageId` from `.config.kiro` when available — skip search entirely

- Limit to 5 results for domain queries, 3 pages for feature design searches

- Only query when a specific trigger fires



### Codebase & Tooling Drift



- A guide recommendation that contradicts what the codebase actually does

- A guide section that's outdated (deprecated API, old syntax, removed dependency)

- A CI/pipeline failure revealed a convention or constraint not captured in guides

- When touching a guide for any reason, scan that same guide for stale entries and propose removing them

- The architecture doc (`.kiro/steering/ubiquity-architecture.md`) doesn't match reality — new app, new service, new domain, changed connections → propose an update



### Anti-Patterns



Every guide SHOULD have a "Don't do this" section listing known bad patterns.

When the user or a PR reviewer flags a bad approach:

1. Identify which guide it belongs to

2. Add it to that guide's "Don't do this" section with a brief explanation of why

3. If no guide exists for that topic, propose creating one with the anti-pattern as the first entry



### Learning Synthesis (Batch Pattern Detection)

For periodic batch analysis of accumulated Notion gotchas, use the learning synthesis guide:
**Read**: `.kiro/guides/workflow/learning-synthesis.md`

This harvests repeated patterns from Notion and proposes guide updates for anything appearing 3+ times. Run it after sprints, big features, or when agents keep making the same mistakes.

### Periodic Cleanup



When the user asks for a cleanup pass, or roughly every 5th push:

- Scan all guides for entries that haven't been relevant in recent work — propose pruning

- Check if any guide recommendations conflict with each other

- Look for duplicate content across guides that should be consolidated

- Check the knowledge base index for entries that may be stale



### Structural Hygiene



- A guide that's too verbose and could be condensed

- Duplicate information across guides that should be consolidated

- A steering rule that was ineffective and needed to be moved or restructured

- A topic that keeps coming up but has no guide — propose creating one



## Web Verification



When you suspect a guide recommendation may be outdated or contradicts current official documentation:



1. Use web search to check the latest official docs for the relevant library/framework

2. Compare what the guide says vs what the current docs recommend

3. If there's a mismatch, include the source URL in your proposal so the user can verify

4. Only propose changes backed by official documentation — not blog posts or opinions

5. Focus on the project's key dependencies: Next.js, React, Tailwind, Bun, Biome, gRPC/Connect



## How to Apply Updates

Steering and guide files may live outside the current workspace (user-level at `~/.kiro/steering/`, or in a different worktree). When you need to edit them:

1. Use `git worktree list` to find the main worktree path
2. Check `~/.kiro/steering/` for user-level steering files
3. Check `<main-worktree>/.kiro/steering/` and `<main-worktree>/.kiro/guides/` for workspace-level files
4. Edit them directly via terminal (`Set-Content`, `sed`, or similar)  don't claim you can't reach them
5. If the file is in a different worktree, use the absolute path

This applies to all worktrees in a parallel worktree setup. Steering files are shared context  any worktree agent can and should update them when approved.

## How to Propose



1. Finish the current task first — never interrupt work to update guides

2. At the end of your response, state clearly:

   - Which guide file to update (or "new guide" if creating one)

   - What to add, change, or remove

   - Why (one sentence — the trigger that caused this proposal)

3. Wait for the user to approve before making any edits

4. Keep proposals short — one or two sentences per change



## What You Can Propose



- Adding new patterns or examples to existing guides

- Adding "don't do this" entries to prevent known bad habits

- Removing outdated or incorrect guidance

- Consolidating duplicate content across guides

- Creating a new guide when a topic keeps coming up but has no documentation

- Updating code examples to match current project conventions

- Capturing user workflow preferences

- Adding knowledge base entries for codebase discoveries (`.kiro/knowledge/`)



## What You Must NOT Do



- Never silently edit guides without user approval

- Never remove guides without explaining why

- Never add speculative guidance — only document patterns actually used in the project

- Never bloat guides with edge cases that haven't come up

- Never update guides mid-task — finish the work first

- Never claim to remember things from past sessions — the guides are your memory, not your context window

