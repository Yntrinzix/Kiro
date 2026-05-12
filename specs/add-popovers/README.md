# Spec: Add Help Popovers to Connector Wizard

**Repo:** Ubiquity-WebApps
**Base Branch:** `feat/add-popovers`
**Status:** Completed (PRs shipped)

## Sub-PRs

| Branch | Content | Commits |
|--------|---------|---------|
| `feat/add-popovers-help-popover-component` | HelpPopover + WarningBlock shared UI components | 3 commits |
| `feat/add-popovers-wizard-integration` | Integrate popovers into all connector wizard steps | 6 commits |

## What Was Delivered

- `HelpPopover` component in shared UI (`packages/ui`) — ubiquity-teal background, QuestionMark icon trigger, wider panel per Figma
- `WarningBlock` component in shared UI
- Design tokens for popover styling
- HelpPopovers added to all connector wizard steps in the database app
- Auth popover label refactored (removed duplication)
- File Naming section deferred to Task 13
