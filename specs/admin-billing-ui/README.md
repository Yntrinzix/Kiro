# Spec: Connectors Billing Report UI

**PBI:** [#3497804](https://dev.azure.com/sparknz/Spark/_workitems/edit/3497804)
**Status:** Approved — Ready for execution
**Approved:** 2026-05-06

---

## Documents

| File | Purpose |
|------|---------|
| `requirements.md` | Design document — architecture, requirements (AC + additional), dependencies, ADRs, page architecture, data flow, infra, proto contracts |
| `tasks.md` | Task breakdown — 7 tasks with file lists, agent assignments, acceptance criteria |
| `battle-plan.md` | Execution strategy — parallelism, phases, gates, branch strategy, PR strategy, QA loops, timeline |

---

## Quick Reference

### Repos & Branches

| Repo | Source Branch | Feature Branch |
|------|-------------|----------------|
| `Ubiquity-WebApps` | `main` | `feature/admin-billing-ui` |
| `QT-Ubi-UbiquityBackend` | `release/1.178.0` | `feature/admin-proxy-config` |
| `qt-ubi-platform-api` | `master` | `feature/connector-pricing-seed` |

### PRs

| PR | Repo | Tasks | Size |
|----|------|-------|------|
| PR1 | QT-Ubi-UbiquityBackend | Task 5 | XS |
| PR2 | qt-ubi-platform-api | Task 6 | S |
| PR3 | Ubiquity-WebApps | Tasks 1, 2, 3, 4, 7 | L |

### Phases

1. **Foundation** (parallel): Tasks 1, 5, 6
2. **Core + Infra** (parallel): Tasks 2, 7
3. **UI Build** (parallel): Tasks 3, 4
4. **Ship**: Integration verify + PRs
