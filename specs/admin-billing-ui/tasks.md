# Tasks: Connectors Billing Report UI

**PBI:** #3497804
**Design:** `requirements.md` (same folder)
**Battle Plan:** `battle-plan.md` (same folder)

---

## Task 1: App Scaffold + Configuration

**Agent:** C (@frontend)
**Phase:** 1 (parallel)
**Blocked by:** Nothing
**Repo:** `Ubiquity-WebApps`
**Estimate:** ~45 min

### Files

| File | Action |
|------|--------|
| `monorepo/apps/admin/package.json` | Create |
| `monorepo/apps/admin/next.config.js` | Create |
| `monorepo/apps/admin/tsconfig.json` | Create |
| `monorepo/apps/admin/tailwind.config.ts` | Create |
| `monorepo/apps/admin/postcss.config.cjs` | Create |
| `monorepo/apps/admin/.env.template` | Create |
| `monorepo/apps/admin/bunfig.toml` | Create |
| `monorepo/apps/admin/CHANGELOG.md` | Create |
| `monorepo/apps/admin/src/config/env.ts` | Create |
| `monorepo/apps/admin/src/lib/grpc-clients.ts` | Create |
| `monorepo/apps/admin/src/lib/grpc-session-interceptor.ts` | Create |
| `monorepo/apps/admin/src/app/layout.tsx` | Create |
| `monorepo/apps/admin/src/app/page.tsx` | Create |
| `monorepo/apps/admin/src/app/health/route.ts` | Create |
| `monorepo/apps/admin/src/app/providers.tsx` | Create |
| `monorepo/apps/admin/src/styles/globals.css` | Create |
| `monorepo/apps/admin/src/store/accountStore.ts` | Create |
| `monorepo/apps/admin/src/components/AccountProvider.tsx` | Create |
| `package.json` (root) | Update (add admin workspace) |

### Acceptance

- [ ] `bun install` succeeds from root
- [ ] `bun run --filter @monorepo/apps-admin dev` starts on port 3300
- [ ] `/admin/health` returns 200
- [ ] gRPC clients import without type errors
- [ ] `bun run --filter @monorepo/apps-admin typecheck` passes

---

## Task 2: Billing Report — Data Layer + Server Component

**Agent:** C (@frontend)
**Phase:** 2
**Blocked by:** Task 1
**Repo:** `Ubiquity-WebApps`
**Estimate:** ~1.5 hours

### Files

| File | Action |
|------|--------|
| `monorepo/apps/admin/src/domains/billing/types/index.ts` | Create |
| `monorepo/apps/admin/src/domains/billing/utils/billing-period.ts` | Create |
| `monorepo/apps/admin/src/domains/billing/utils/tree-builder.ts` | Create |
| `monorepo/apps/admin/src/domains/billing/actions/get-billing-data.ts` | Create |
| `monorepo/apps/admin/src/app/billing/page.tsx` | Create |
| `monorepo/apps/admin/src/app/billing/layout.tsx` | Create |

### Acceptance

- [ ] `/admin/billing` renders (even if UI is placeholder)
- [ ] Permission gate blocks non-admin users
- [ ] gRPC calls to BillingReportService compile correctly
- [ ] Period calculation derives from GetBillingSchedule
- [ ] Tree builder groups line items by account
- [ ] Typecheck passes

---

## Task 3: Billing Report — UI Components

**Agent:** C (@frontend)
**Phase:** 3 (parallel with Task 4)
**Blocked by:** Task 2
**Repo:** `Ubiquity-WebApps`
**Estimate:** ~2-3 hours

### Files

| File | Action |
|------|--------|
| `monorepo/apps/admin/src/domains/billing/components/BillingReportClient.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/DateRangePicker.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/AccountFilter.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/BillingTreeTable.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/AccountRow.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/LineItemRow.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/DownloadCSVButton.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/EmptyState.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/ErrorState.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/DraftIndicator.tsx` | Create |
| `monorepo/apps/admin/src/domains/billing/components/LoadingSkeleton.tsx` | Create |

### Acceptance

- [ ] AC1: Expandable account tree with rolled-up totals renders
- [ ] AC2: Date range picker defaults to current billing cycle with presets
- [ ] AC3: Account filter shows hierarchy, defaults to All
- [ ] AC4: Table shows Items, Unit Price, Total columns
- [ ] AC6: Empty state, zero-value blank cells, draft indicator all work
- [ ] Sortable columns function
- [ ] Typecheck passes

---

## Task 4: CSV Download

**Agent:** D (@frontend)
**Phase:** 3 (parallel with Task 3)
**Blocked by:** Task 2
**Repo:** `Ubiquity-WebApps`
**Estimate:** ~30 min

### Files

| File | Action |
|------|--------|
| `monorepo/apps/admin/src/domains/billing/actions/download-csv.ts` | Create |

### Acceptance

- [ ] AC5: Download CSV exports visible data with current prices
- [ ] CSV respects active filters (same params as table)
- [ ] Columns match table columns
- [ ] File downloads correctly in browser
- [ ] Typecheck passes

---

## Task 5: Backend — settings.xml

**Agent:** A (@backend)
**Phase:** 1 (parallel)
**Blocked by:** Nothing
**Repo:** `QT-Ubi-UbiquityBackend`
**Branch:** `release/1.178.0`
**Estimate:** ~5 min

### Files

| File | Action |
|------|--------|
| `mvc/settings.xml` | Update (add admin to FrontendProxyUrls × 5 environments) |

### Values

```xml
<!-- local -->
<item key="admin" value="http://localhost:3300" />
<!-- docker -->
<item key="admin" value="http://host.docker.internal:3300" />
<!-- dev -->
<item key="admin" value="https://admin-webapp.web.internal.ubiquity-dev.co.nz" />
<!-- test -->
<item key="admin" value="https://admin-webapp.web.internal.ubiquity-test.co.nz" />
<!-- prod -->
<item key="admin" value="https://admin-webapp.web.internal.ubiquity-prod.co.nz" />
```

### Acceptance

- [ ] All 5 environments have the admin entry
- [ ] Solution builds without errors
- [ ] FrontendAppProxy would route `/admin/*` to the configured URL

---

## Task 6: Backend — EF Core Pricing Migration

**Agent:** B (@backend)
**Phase:** 1 (parallel)
**Blocked by:** Nothing
**Repo:** `qt-ubi-platform-api`
**Estimate:** ~30 min

### Files

| File | Action |
|------|--------|
| `billing/Billing.Infrastructure/Configurations/PricingSeedConfiguration.cs` | Create or update |
| `billing/Billing.Infrastructure/Migrations/{timestamp}_SeedConnectorPricing.cs` | Create (generated) |

### Data to Seed

- **Charge:** name=`connector_subscription`, display_name=`Connector Subscription`, domain=`connectors`, billing_type=SUBSCRIPTION, billing_cycle=MONTHLY
- **Price:** charge_id=(above), retail=`250`, effective_from=now, account_id=null, account_level=null

### Acceptance

- [ ] Migration runs successfully against local Postgres
- [ ] `dotnet ef database update` applies without error
- [ ] Price row visible in `prices` table with retail=250
- [ ] Billing API's `GetDefaultPricing` returns the seeded price
- [ ] Solution builds

---

## Task 7: CI + Terraform

**Agent:** D (@infra)
**Phase:** 2 (parallel with Task 2)
**Blocked by:** Task 1
**Repo:** `Ubiquity-WebApps`
**Estimate:** ~45 min

### Files

| File | Action |
|------|--------|
| `.github/workflows/build.yml` | Update (add admin paths-filter) |
| `tf/admin/main.tf` | Create |
| `tf/admin/terragrunt.hcl` | Create |
| `tf/admin/variables.tf` | Create |
| `tf/admin/environments/dev.hcl` | Create |
| `tf/admin/environments/test.hcl` | Create |
| `tf/admin/environments/prod.hcl` | Create |

### Acceptance

- [ ] `build.yml` detects changes in `monorepo/apps/admin/**`
- [ ] Terraform validates (`terraform validate` in tf/admin/)
- [ ] Environment files have correct GRPC_BASE_URL and BILLING_GRPC_URL per env
- [ ] Listener rule priority = 210 (no conflict with database = 200)
- [ ] Health check path = `/admin/health`
