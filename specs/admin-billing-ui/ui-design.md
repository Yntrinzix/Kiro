# Billing Report — UI Design Reference

> **Source:** Visual prototype at `https://ubiquity-2-0.vercel.app/admin/billing`
> **Purpose:** Layout and behavior reference only. Implementation uses our own stack (Radix UI, Tailwind 4, `@monorepo/packages-ui`).

## Screenshots

| State | File |
|-------|------|
| Default (collapsed) | `billing-collapsed.png` |
| Expanded tree | `billing-expanded.png` |
| Account filter dropdown | `billing-account-filter.png` |

---

## 1. Page Layout

| Element | Position | Details |
|---------|----------|---------|
| Title | Top-left, below nav | `h1` — "Billing Report" |
| Subtitle | Directly below title | `p` — "Cross-account billing data for the current period" (muted text) |
| Primary action | Top-right, aligned with title | Green button: download icon + "Download CSV" |

The page has no sidebar — it uses the full content width below the global navigation bar.

---

## 2. Filter Bar

Sits between the title/subtitle and the table. Two controls arranged horizontally, left-aligned:

### Date Range Picker
- **Label:** "Date Range" (above the input)
- **Display format:** `DD MMM YYYY — DD MMM YYYY` (e.g., "26 Apr 2026 — 25 May 2026")
- **Icon:** Calendar icon to the left of the date text
- **Default:** Current billing period (rolling 30-day window)
- **Behavior:** Clicking opens a date range picker (start + end date selection)

### Account Dropdown
- **Label:** "Account" (above the select)
- **Default value:** "All Accounts"
- **Options:** Hierarchical account list using dash-prefix indentation:
  - Top-level accounts (no prefix): "Serenity Spa Group", "Christchurch City Council", "Save the Children NZ"
  - First-level children (— prefix): "— Serenity Spa Auckland", "— Serenity Spa Wellington"
  - Second-level children (—— prefix): "—— Serenity Spa Auckland CBD"
- **Behavior:** Selecting an account filters the table to show only that account and its descendants

---

## 3. Table Structure

### Column Order (left to right)

| # | Column Name | Alignment | Content |
|---|-------------|-----------|---------|
| 1 | Account | Left | Account/sub-account name with expand/collapse chevron |
| 2 | Type | Left | Item type (e.g., "Integration", "Campaign") |
| 3 | Description | Left | Human-readable name of the billable item |
| 4 | Send Date | Left | Date the item was sent (populated for campaigns; empty for integrations) |
| 5 | Created/Activated | Left | Date the item was created or activated (e.g., "13 Mar 2026") |
| 6 | User | Left | Name of the user who created/owns the item |
| 7 | Items | Right | Numeric count of billable items |
| 8 | Unit Price | Right | Per-item price (e.g., "$25.00") |
| 9 | Total | Right | Row total = Items × Unit Price (e.g., "$25.00") |

### Column Header Behavior
- **Account** column has a sort indicator (▲ for ascending, ▼ for descending)
- Clicking the Account header toggles sort direction
- No other columns appear sortable in the prototype

---

## 4. Account Tree Behavior

The table uses a hierarchical expand/collapse tree with up to 3 levels:

### Hierarchy Levels

1. **Top-level account** (root) — e.g., "Serenity Spa Group"
2. **Sub-account** (child) — e.g., "Serenity Spa Auckland"
3. **Line items** (leaf rows) — individual billable items

### Expand/Collapse Mechanics

- **Chevron icon:** Right-pointing chevron (›) when collapsed, downward-pointing chevron (⌄) when expanded
- **Click target:** The chevron icon or the account name row
- **Default state:** All accounts collapsed on page load
- **Independent expansion:** Each account/sub-account expands independently

### Visual Differentiation

| Row Type | Background | Font Weight | Indentation | Shows Chevron |
|----------|-----------|-------------|-------------|---------------|
| Top-level account | Light gray (`rgb(250, 250, 250)`) | Semi-bold (600) | None | Yes |
| Sub-account | Lighter gray (`rgba(244, 244, 245, 0.5)`) | Normal (400) | 24px left padding on name | Yes |
| Line item | Transparent/white | Normal (400) | Aligned with Type column (no account name shown) | No |

### What Each Row Type Displays

**Parent/sub-account rows (summary):**
- Account name (column 1)
- Items count — rolled-up total of all children (column 7)
- Total — rolled-up sum of all children (column 9)
- Columns 2–6 and 8 are **empty**

**Line item rows (leaf):**
- Column 1 is **empty** (no account name)
- All other columns populated with item-specific data

---

## 5. Summary Rows

### Account-Level Summaries
- Each parent account row acts as its own summary
- Shows **aggregated Items count** and **aggregated Total** across all direct line items AND all sub-account totals
- Example: "Serenity Spa Group" shows Items: 12, Total: $300.00 (sum of its 9 direct items + Auckland's 2 + Wellington's 1)

### Sub-Account Summaries
- Same pattern — shows rolled-up Items and Total for that sub-account's line items only
- Example: "Serenity Spa Auckland" shows Items: 2, Total: $50.00

### No Grand Total Row
- The prototype does **not** show a grand total / footer summary row across all accounts

---

## 6. Empty/Zero States

### Empty Columns
- **Send Date** is empty for Integration-type items (only populated for Campaign-type items)
- Empty cells render as blank — no placeholder text, no dash, no "$0.00"

### Parent Row Empty Columns
- Type, Description, Send Date, Created/Activated, User, and Unit Price columns are all blank on parent/sub-account rows
- Only Items and Total are shown

### Zero-Value Handling
- Not observed in prototype data, but the pattern suggests:
  - If Items = 0, display "0"
  - If Total = $0, display "$0.00"
  - Accounts with no billable items in the period would still appear with Items: 0, Total: $0.00

---

## 7. Visible States

### Current Period Indicator
- The subtitle "Cross-account billing data for the current period" indicates the active billing period
- The date range picker shows the current period dates
- No explicit "Draft" or "Pending" badge is visible in the prototype

### Loading State
- Not observed (prototype uses static data)
- Expected: Skeleton rows or a spinner in the table body area

### Error State
- Not observed in prototype
- Expected: Inline error message replacing table content

### Sort State
- Active sort indicated by ▲ (ascending) or ▼ (descending) arrow next to the Account column header
- Default sort: Account ascending (A→Z)

---

## 8. Additional Observations

### Currency Format
- Dollar sign prefix, two decimal places: `$25.00`, `$300.00`
- Right-aligned in their columns
- No thousands separator visible (largest value is $300.00)

### Date Format
- `DD MMM YYYY` — e.g., "13 Mar 2026", "26 Apr 2026"
- No time component shown

### Typography Hierarchy
- Page title: Large, bold
- Subtitle: Smaller, muted/gray color
- Table headers: Small, uppercase-style, muted color
- Account names (top-level): Semi-bold
- Sub-account names: Normal weight
- Line item data: Normal weight

### Responsive Considerations
- Not assessed — prototype viewed at 1440px width
- Table is full-width with no horizontal scroll at this viewport
