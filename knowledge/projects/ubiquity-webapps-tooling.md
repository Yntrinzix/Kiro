---
sync: draft
notionPageId:
lastLocalEdit: 2026-05-12T15:51:00+12:00
lastPublished:
---

# Ubiquity-WebApps — Pre-Push Tooling & CI

## Git Hooks (lefthook v2.1.3)

| Hook | Command | What it does |
|------|---------|--------------|
| commit-msg | `npx commitlint --edit {1}` | Validates conventional commit format |
| pre-commit | `bunx --bun lint-staged` | Runs biome on staged .ts/.tsx files |
| pre-push | `bun run typecheck` | Full turbo typecheck across all apps |

## lint-staged

Runs on `*.{ts,tsx}` files:
```
biome check --write --no-errors-on-unmatched
```
Auto-fixes formatting and lint issues on staged files before commit.

## Commitlint (.commitlintrc.json)

- Extends: `@commitlint/config-conventional`
- Rules: `header-max-length: 100`
- Format: `type(scope): description`

## Biome (v2.3.13, biome.json)

Formatter:
- Line ending: LF
- Line width: 100
- Semicolons: always
- Trailing commas: ES5
- Quote style: double
- Arrow parens: always
- Bracket same line: true

Key lint rules:
- `noUnusedImports`: error
- `noUnusedVariables`: error
- `noExplicitAny`: error
- `noConsole`: error
- `noEnum`: error
- `noCommonJs`: error
- `useArrowFunction`: error
- `useSortedClasses`: error (with `cn` function)
- `useExhaustiveDependencies`: error
- `noNonNullAssertion`: error
- `useAwait`: error

## Sherif

Dependency consistency checker across monorepo workspaces. Runs via `bun run check:sherif`.

## Package Scripts (root)

| Script | Command |
|--------|---------|
| `dev` | `turbo run dev` |
| `build` | `turbo run build` |
| `typecheck` | `turbo run typecheck` |
| `test:unit` | `turbo run test:unit` |
| `check:biome` | `bunx --bun biome check` |
| `check:sherif` | `bunx --bun sherif` |
| `fix:biome` | `bunx --bun biome check --write` |
| `fix:sherif` | `bunx --bun sherif --fix` |
| `doctor` | `bun run fix:biome && bun run fix:sherif` |
| `postinstall` | Runs doctor (biome + sherif fix) after install |

## CI Pipeline (pr.yml)

Triggers on PR to `main` or `support/**` (non-draft only).

### Validate job:
1. Checkout (shallow: commits + 1)
2. Setup Bun (latest)
3. `bun install --frozen-lockfile`
4. Commitlint (from base SHA to head SHA)
5. Typecheck (`bun turbo typecheck`)
6. Lint (`bun run check:biome`)
7. Sherif (`bun run check:sherif`)
8. Terraform fmt check (`terraform fmt -check -recursive tf`)
9. Unit tests (`bun turbo test:unit` with JUnit reporter)
10. Convert to CTRF + report results

### Detect apps job:
- Discovers all apps in `monorepo/apps/*/`
- Discovers all Terraform stacks in `tf/*/`

### Terraform validate job (per stack):
- `terraform init -backend=false`
- `terraform validate`

## Known Issue (2026-05-12)

`bunx --bun` segfaults on Windows (exit code -1073741819 / 0xC0000005). Affects:
- Pre-commit hook (lint-staged)
- Postinstall (doctor script)
- `check:biome` and `check:sherif` scripts

Workaround: run `node_modules/.bin/lint-staged` directly, or commit from a terminal where bunx works. CI is unaffected (runs on Ubuntu).
