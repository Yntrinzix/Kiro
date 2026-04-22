---
inclusion: always
---

# Agent Workflow Guide

This document defines when and how to use specialized agents in your development workflow.

## Available Agents

- **@architect**: Web application architecture and system design
- **@backend**: C#/.NET 8 backend development, gRPC endpoints, NUnit testing, XML config (QT-Ubi-UbiquityBackend)
- **@github-agent**: GitHub operations and PR creation
- **@frontend**: TypeScript/Next.js/React development, Biome compliance, and formatting
- **@quality-assurance**: Critical code review and edge case analysis
- **@tester**: High-value test writing focused on critical paths, negative scenarios, and property-based testing
- **@protobuf-engineer**: Proto schema design, buf tooling, codegen, breaking change detection
- **@ticket-triage**: Ticket readiness gatekeeper — blocker analysis, completeness checks, dependency verification

## Workflow Guides (Table of Contents)

MANDATORY: Do NOT read these guides upfront. Only read the ONE guide that matches the current task.

### Any Ticket Readiness Check (before planning)
**Read** (only when needed): `.kiro/guides/ticket-triage/readiness-checklist.md`
Agents: @ticket-triage → verdict → proceed or stop

### Any Requirements, Planning & Design
**Read** (only when needed): `.kiro/guides/agent-workflow/planning-design.md`
Agents: @architect → present to user → iterate if needed

### Any Frontend Implementation or Task runs
**Read** (only when needed): `.kiro/guides/agent-workflow/frontend-implementation.md`
Agents: @frontend → @quality-assurance → @frontend

### Any Backend or C# Implementation or Task runs
**Read** (only when needed): `.kiro/guides/agent-workflow/backend-implementation.md`
Agents: @backend → @quality-assurance → @backend

### Any Testing
**Read** (only when needed): `.kiro/guides/agent-workflow/testing.md`
Agents: @tester → @quality-assurance → @tester

### Any Pull Request Creation
**Read** (only when needed): `.kiro/guides/agent-workflow/pr-creation.md`
Agents: @github-agent

### Any Proto/gRPC Schema Work
**Read** (only when needed): `.kiro/guides/agent-workflow/proto-implementation.md`
Agents: @protobuf-engineer → @quality-assurance → fix if needed

### After Design Phase (Large Features) — MANDATORY CHECKPOINT
**MUST evaluate** after tasks.md is created: `.kiro/guides/workflow/parallel-worktree-strategy.md`
When: After design.md and tasks.md are complete — ALWAYS evaluate the condition below before proceeding to task execution.
Condition: Does the feature have 5+ tasks touching different files/domains?
- If YES → Read the guide and produce a worktree-plan.md. Present the plan to the user before executing any tasks.
- If NO → Note in your response: "Worktree strategy evaluated — not applicable (reason)." Then proceed normally.
Purpose: Decompose tasks into parallel worktrees with foundation/parallel/integration phases.

## Pre-Task Checks

### Azure DevOps Work Items
When the user provides Azure DevOps PBI links or work item IDs, ALWAYS attempt to fetch them via `mcp_azure_devops_wit_get_work_item` before asking the user to paste details manually. Use `expand: relations` to get the full picture including dependencies and child items.

## Quick Reference

| Task | Agent Order |
|------|-------------|
| Ticket Triage | @ticket-triage → verdict → proceed or stop |
| Planning | @architect → present to user → iterate if needed |
| Frontend Code | @frontend → @quality-assurance → fix if needed |
| Backend Code | @backend → @quality-assurance → fix if needed |
| Writing Tests | @tester → @quality-assurance → refine if needed |
| Proto/gRPC | @protobuf-engineer → @quality-assurance → fix if needed |
| Create PR | @github-agent |

## Don't Do This

- **Don't skip the workflow guide lookup.** Before starting ANY task, match it to a Workflow Guide section above and read the corresponding .md file. If the guide file doesn't exist, flag it to the user  don't silently proceed without it.
- **Don't do planning/design work without @architect.** Requirements docs, design docs, and spec reviews MUST go through @architect. Never produce these directly.
- **Don't ask the user to paste info that MCP tools can fetch.** Azure DevOps PBIs, GitHub PRs, Notion pages  always try the tool first.
- **Don't apologize for missing a workflow step without adding a guard.** If you catch yourself skipping a steering rule, add an anti-pattern entry or knowledge base note so it doesn't repeat.
- **Don't skip QA review in batch/run-all-tasks mode.** The `@quality-assurance` step applies per-task, not per-session. Even when executing multiple tasks sequentially, each `@backend` or `@frontend` subagent output must go through `@quality-assurance` before marking the task complete.