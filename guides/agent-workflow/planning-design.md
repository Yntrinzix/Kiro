# Planning & Design Workflow

## When This Guide Applies
- Requirements gathering and documentation
- Feature design and architecture decisions
- Spec creation (requirements.md, design.md)
- Technical design reviews

## Workflow

### Step 0: Ticket Readiness Check (MANDATORY — before any design work)

When the user provides a ticket link or work item ID:

1. Fetch the work item via `wit_get_work_item` with `expand: relations`
2. Analyze for blockers:
   - **Predecessor links** — work items that must complete first (state != Done/Closed)
   - **Parent state** — is the parent PBI in New/Proposed/Removed?
   - **Related/dependency items** — any linked items tagged or stated as blocking?
   - **Item state** — is the item itself Blocked or Removed?
   - **Tags** — any "blocked", "dependency", "waiting" tags?
3. For each blocker found, report:
   - What: title + ID of the blocking item
   - Why: the relationship (predecessor, parent not approved, etc.)
   - Who: assigned to
   - What's needed: what must happen to unblock
4. Verdict:
   - ✅ **Ready** — no blockers, proceed to @architect
   - ⚠️ **Partially ready** — some work can start (specify what), but full implementation is blocked (specify why). Ask user: "Want to proceed with the unblocked scope, or wait?"
   - 🛑 **Blocked** — cannot meaningfully start. Present the blocker summary and STOP. Do not proceed to @architect.

Only proceed past this step on ✅ or user-approved ⚠️.

---

1. **@architect** produces the document (requirements, design, or both)
2. **Dependency impact analysis (MANDATORY)** — before finalizing design, identify which repos/components are affected. Read `/mnt/c/Users/T828819/.kiro/steering/ubiquity-architecture.md` for the dependency graph, then:
   - List all repos that consume or are consumed by the components being changed
   - For each downstream consumer: what breaks, what needs regeneration
   - Include cross-repo impact in the design doc so tasks account for it
   - If the feature touches protos: explicitly plan regeneration steps for WebApps and Backend
3. Present the output to the user for review
4. Iterate based on user feedback
5. Only proceed to the next phase when the user approves

## Rules

- Always use @architect for planning and design work
- Never skip user review between phases (requirements → design → tasks)
- When Azure DevOps PBI links are provided, fetch them via `wit_get_work_item` with `expand: relations` before starting
- Include PBI acceptance criteria and testing criteria as inputs to the requirements doc
- If a dependency PBI exists, document it and plan for phased implementation where possible

## Notion Sync Checkpoints (MANDATORY)

After EACH spec document is created or updated, check guide-evolution steering for Notion sync triggers:

- **After requirements.md created**: Create a Notion Feature_Page with feature name, repo, spec type, PBI fields. Set Status to "Spec". Save `notionPageId` to `.config.kiro`.
- **After design.md created**: Update the Notion Feature_Page with a design summary.
- **After tasks.md created**: Update the Notion Feature_Page with task breakdown and sub-PR status (if using worktree strategy). Set Status to "Todo".

Do NOT defer Notion sync to the end of the session. Do it immediately after each document is created.

## Don't Do This

- **Don't defer Notion page creation.** The Feature_Page must be created when requirements.md is created, not at the end of the session when someone reminds you.
- **Don't skip @architect for planning/design work.** This was already caught and documented — don't regress.
- **Don't skip the readiness check.** When a ticket is provided, Step 0 MUST run before @architect starts. A blocked ticket should not produce a design doc.
