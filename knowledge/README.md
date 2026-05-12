# Knowledge Base

Codebase discoveries, gotchas, and important details that are easily forgotten.
These are facts about how the code works — not instructions on how to do things (that's what guides are for).

## How to Use (Agent Instructions)

MANDATORY: Do NOT read all knowledge entries. Only scan this table of contents.
1. Check the index below for entries matching the current domain/repo/topic
2. If a matching entry exists, read ONLY that file
3. If no match, move on — don't waste context

## Structure

```
knowledge/
├── projects/ubiquity/   ← Ubiquity platform discoveries
├── projects/zespri/     ← Zespri MCS discoveries
├── workflow/            ← cross-project workflow patterns
├── sessions/            ← session continuity notes
├── parked-ideas/        ← deferred concepts
└── (root)               ← meta files only
```

## Index

### projects/ubiquity/

- `backend-connector-field-usage-api.md` — Backend connector field usage API patterns | Tags: QT-Ubi-UbiquityBackend, connectors, api
- `backend-mvc-architecture.md` — Full MVC project architecture: controllers, infrastructure, routing, viewmodels, caching, auth, migration pattern | Tags: QT-Ubi-UbiquityBackend, mvc, architecture, legacy, strangler-fig
- `ubiquity-backend-build-order.md` — Build order for u3.sln: service DLLs must build before mvc project | Tags: QT-Ubi-UbiquityBackend, build, mvc, dependencies
- `ubiquity-backend-columninfo-no-ispk.md` — ColumnInfo has no IsPK property; key field detection only at DTE layer | Tags: QT-Ubi-UbiquityBackend, list, schema, columninfo
- `ubiquity-backend-namespace-services-collision.md` — Services namespace collides with Services.cs ViewModel class, causes CS0118 | Tags: QT-Ubi-UbiquityBackend, namespace, csharp, gotcha
- `ubiquity-backend-worktree-file-overlap.md` — Parallel worktrees creating the same file causes merge conflicts | Tags: worktree, git, merge-conflict, gotcha
- `ubiquity-dialog-escape-gotcha.md` — MVC jQuery gotchas: Escape keypress broken, disabled class not preventing clicks, XSS via .html() | Tags: QT-Ubi-UbiquityBackend, mvc, jquery, gotcha
- `webapps-check-origin-main-deps.md` — Always diff package.json against origin/main before committing | Tags: Ubiquity-WebApps, package-json, deps
- `webapps-figma-check-layout-structure.md` — Check layout structure in Figma, not just styles | Tags: Ubiquity-WebApps, figma, ui, gotcha
- `webapps-figma-structural-changes.md` — Figma designs may require structural changes beyond ticket scope | Tags: Ubiquity-WebApps, figma, scope, gotcha
- `webapps-package-json-drift.md` — Package.json drift detection patterns | Tags: Ubiquity-WebApps, package-json, drift
- `webapps-ui-test-framework-bun.md` — Test framework is bun:test, not Vitest | Tags: Ubiquity-WebApps, testing, bun

### projects/zespri/

_(Empty — pending Confluence access)_

### workflow/

- `hook-steering-split-rationale.md` — Steering = doctrine, Hooks = enforcement. The line between them. | Tags: steering, hooks, architecture
- `notion-subpr-status-block-pattern.md` — Update existing Notion table blocks in place during sub-PR reconciliation | Tags: notion, worktree, sub-pr-status, gotcha
- `worktree-distribute-from-local.md` — Distribute changes from local/feature branch to individual PR branches | Tags: worktree, git, distribute, workflow

## File Naming

Each entry: `{repo-or-domain}-{topic}.md` (e.g., `webapps-grpc-session-interceptor.md`)

## What Belongs Here

- Non-obvious behavior discovered while working in the code
- Gotchas that caused bugs or confusion
- Important relationships between components that aren't obvious from the code
- Environment-specific quirks
- Data flow details that took time to trace
- Undocumented API contracts or conventions

## What Does NOT Belong Here

- How-to instructions (use guides instead)
- Coding standards (use steering instead)
- Feature specs (use specs instead)
