---
sync: draft
notionPageId:
lastLocalEdit: 2026-05-08T06:18:00+12:00
lastPublished:
---

# Hook vs Steering Split Rationale

## Principle

Steering files contain **doctrine** — principles, judgment calls, adaptive logic.
Hooks contain **enforcement** — mechanical gates that fire deterministically at boundaries.

## The Line

| Belongs in steering | Belongs in hooks |
|---------------------|-----------------|
| *Why* to do something | *When* to do something |
| Agent behavior guidelines | Mandatory pre/post actions |
| Workflow templates & proposals | "Never skip" enforcement gates |
| Tone, composition rules | Post-push retro trigger |
| Invariant checks (require context) | Pre-commit verification |
| Template selection logic | Block dangerous flags |

## Decision Rule

Ask: "Does this need judgment or context to execute correctly?"
- **Yes** → steering (adaptive)
- **No** → hook (mechanical)

## Current Hook Inventory (Mechanical Enforcement)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `pre-commit-verify-staged` | preToolUse/shell (git commit) | Verify staged content is real |
| `block-no-verify` | preToolUse/shell (--no-verify) | Force root cause diagnosis |
| `post-push-retro-trigger` | postToolUse/shell (git push) | Guarantee retro fires |
| `knowledge-frontmatter-sync` | postToolUse/write (.kiro/knowledge/) | Auto-flip sync status |
| `enforce-agent-workflow` | preToolUse/write | Prevent orchestrator from writing code |
| `lazy-load-guides` | promptSubmit | Prevent eager guide loading |
| `guide-evolution-pr-review` | postToolUse (PR comments read) | Trigger guide update check |
| `worktree-checkpoint` | fileCreated (tasks.md) | Trigger worktree strategy eval |
| `code-standards-check` | postToolUse/write (.ts/.tsx) | Import order, logger, type assertions |
| `skeptic-review-new-files` | fileCreated (.ts/.tsx) | Code skeptic review on new files |

## Anti-Pattern: Over-Hooking

Do NOT hook:
- Workflow proposal format (needs context about task size)
- Agent selection (needs judgment about domain)
- Invariant skip conditions (needs to know file count, tech novelty)
- Session autosave timing (needs awareness of "meaningful moments")
- Notion sync content (needs to compose what to write)

These require adaptive reasoning. Hooking them would create rigid gates that fire inappropriately on simple tasks.

## Steering Files Reference Hooks

When a steering file has a rule that's now enforced by a hook, the steering keeps a 2-line reference:
```
**Enforced by hook:** `hook-name.kiro.hook`
Why: [one sentence explaining the principle]
```

This preserves the *why* in steering while the *enforcement* lives in the hook.
