---
inclusion: always
---

# git add, commit and push Protocol

Commit messages should explain the resulting state of the code, not the reason why you're changing it

## Conventional Commits (commitlint)

All commits must follow conventional commit format: `type(scope): description`
- Subject line max 100 characters (enforced by commitlint)
- Body lines max 100 characters each
- Common types: `feat`, `fix`, `chore`, `refactor`, `docs`, `ci`, `test`

## Squash Merge on GitHub

When squash merging a PR on GitHub, always:
1. Ensure the PR title follows conventional commit format — GitHub uses it as the squash commit subject
2. Clear or trim the commit body in the merge dialog — GitHub dumps the full PR description into the body by default, which causes `body-max-line-length` violations
3. Recommended repo setting: Settings → General → Pull Requests → set default squash commit message to "Pull request title only"

## Pre-Commit Verification

Before every `git commit`, run `git diff --staged` to verify file content is actually present. Don't trust tool reads  verify what git will actually commit. Empty files or missing content won't be caught by `readFile` or `getDiagnostics` if they read from a buffered state.

## Post-Push Retrospective

After every `git push`, the agent MUST do a brief self-assessment:

1. **What went well** — Did we follow the guides? Was the approach clean?
2. **What could be better** — Did we hit any friction? Did we improvise where a guide should exist?
3. **Guide updates needed?** — Propose any updates to steering, guides, or knowledge base entries
4. **Knowledge discoveries** — Did we learn anything non-obvious about the codebase worth adding to `.kiro/knowledge/`?
5. **Notion sync** — Use the Branch-First Lookup Strategy to find or create the Feature_Page for the current feature. Append retrospective findings. If `.config.kiro` has a `notionPageId`, use it directly. Otherwise, read the database ID from `.kiro/knowledge/notion-database-id.md` and search by branch+repo first.

Keep it short — 2-4 bullet points max. This is a quick pulse check, not a full report.
Wait for user approval before making any changes to guides/knowledge.