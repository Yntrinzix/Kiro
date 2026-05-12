# Activate Connector Warning Modal — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a confirmation modal that intercepts connector activation, displays billing cost, and requires typing ACCEPT before proceeding.

**Architecture:** Frontend-only change. New modal component + pricing route handler + gRPC client wiring. Mirrors existing DeleteConnectorConfirmationModal pattern.

**Tech Stack:** Next.js 14, React, TanStack Query, ConnectRPC, @qriousnz/ubiquity-protos, Radix Dialog (via @monorepo/packages-ui)

---

## Task 1: Wire PricingService gRPC Client

**Files:**
- Modify: `monorepo/apps/database/src/lib/grpc-clients.ts`

**Step 1: Add PricingService import and client export**

```typescript
// Add to imports:
import { PricingService } from "@qriousnz/ubiquity-protos/billing/v1";

// Add to exports:
export const pricingClient = createClient(PricingService, transport);
```

**Step 2: Verify build passes**

Run: `cd monorepo/apps/database && bun run build`
Expected: No type errors

**Step 3: Commit**

```bash
git add monorepo/apps/database/src/lib/grpc-clients.ts
git commit -m "feat(connectors): wire PricingService gRPC client"
```

---

## Task 2: Create Pricing Route Handler

**Files:**
- Create: `monorepo/apps/database/src/app/api/connectors/pricing/route.ts`

**Step 1: Create the route handler**

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { pricingClient } from "@/lib/grpc-clients";

export async function GET(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get("accountId");
  const chargeName = request.nextUrl.searchParams.get("chargeName");

  if (!accountId || !chargeName) {
    return NextResponse.json({ error: "Missing accountId or chargeName" }, { status: 400 });
  }

  try {
    const response = await pricingClient.getResolvedPrice({ accountId, chargeName });
    return NextResponse.json({ price: response.price });
  } catch (error) {
    console.error("Failed to fetch resolved price:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
```

**Step 2: Verify build passes**

Run: `cd monorepo/apps/database && bun run build`

**Step 3: Commit**

```bash
git add monorepo/apps/database/src/app/api/connectors/pricing/route.ts
git commit -m "feat(connectors): add pricing route handler for GetResolvedPrice"
```

---

## Task 3: Create useGetConnectorPrice Hook

**Files:**
- Create: `monorepo/apps/database/src/domains/connector-list/api-hooks/useGetConnectorPrice.ts`

**Step 1: Create the hook**

```typescript
import { useQuery } from "@tanstack/react-query";

interface PriceResponse {
  price: {
    id: string;
    chargeId: string;
    accountId: string;
    retail: string;
    effectiveFrom?: { year: number; month: number; day: number };
  } | null;
}

export function useGetConnectorPrice(accountId: string | null, enabled: boolean) {
  return useQuery<PriceResponse>({
    queryKey: ["connector-price", accountId],
    queryFn: async () => {
      const params = new URLSearchParams({
        accountId: accountId!,
        chargeName: "connectors.active_connector",
      });
      const response = await fetch(`/api/connectors/pricing?${params}`);
      if (!response.ok) throw new Error("Failed to fetch connector price");
      return response.json();
    },
    enabled: !!accountId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes — price doesn't change often
  });
}
```

**Step 2: Verify build passes**

Run: `cd monorepo/apps/database && bun run build`

**Step 3: Commit**

```bash
git add monorepo/apps/database/src/domains/connector-list/api-hooks/useGetConnectorPrice.ts
git commit -m "feat(connectors): add useGetConnectorPrice hook"
```

---

## Task 4: Create ActivateConnectorWarningModal Component

**Files:**
- Create: `monorepo/apps/database/src/domains/connector-list/components/ActivateConnectorWarningModal.tsx`

**Step 1: Create the modal component**

```tsx
"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
} from "@monorepo/packages-ui";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { accountIdAtom } from "@/store/accountStore";
import { useGetConnectorPrice } from "../api-hooks/useGetConnectorPrice";
import { useToggleConnectorActive } from "../api-hooks/useToggleConnectorActive";

interface ActivateConnectorWarningModalProps {
  connectorId: string;
  connectorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivateConnectorWarningModal({
  connectorId,
  connectorName,
  open,
  onOpenChange,
}: ActivateConnectorWarningModalProps) {
  const accountId = useAtomValue(accountIdAtom);
  const toggleActiveMutation = useToggleConnectorActive();
  const { data: priceData, isLoading: priceLoading } = useGetConnectorPrice(accountId, open);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = inputValue === "ACCEPT";
  const retailPrice = priceData?.price?.retail ?? "—";

  const handleConfirm = () => {
    if (!isConfirmed || !accountId) return;
    setError(null);

    toggleActiveMutation.mutate(
      { accountId, connectorId, active: true },
      {
        onSuccess: () => {
          setInputValue("");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to activate connector");
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setInputValue("");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="border-neutral-300 border-b px-6 pt-6 pb-4">
          <DialogTitle className="font-semibold text-lg text-neutral-800">
            Activate {connectorName}?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 py-4">
          {priceLoading ? (
            <p className="text-neutral-500 text-sm">Loading pricing...</p>
          ) : (
            <>
              <p className="text-neutral-600 text-sm">
                Activating this connector will start a billing period of{" "}
                <b>${retailPrice}/month</b>.
              </p>
              <p className="text-neutral-600 text-sm">
                This is a minimum 1-month commitment that cannot be canceled or refunded once
                started.
              </p>
            </>
          )}
          <p className="text-neutral-700 text-sm">
            Type <b>ACCEPT</b> below to confirm activation.
          </p>
          <Input
            id="activate-confirmation"
            aria-label="activate-confirmation"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="mt-1"
          />
          {error && (
            <div className="rounded-md border border-red-500 bg-red-100 p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 border-neutral-300 border-t px-6 pt-4 pb-6">
          <Button
            onClick={() => handleOpenChange(false)}
            disabled={toggleActiveMutation.isPending}
            className="rounded-[6px] border border-neutral-600 bg-white font-semibold text-neutral-600 hover:bg-neutral-100">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={toggleActiveMutation.isPending || !isConfirmed || priceLoading}
            className="rounded-[6px] bg-ubi-blue font-semibold text-white hover:bg-ubi-blue/90">
            {toggleActiveMutation.isPending ? "Activating..." : "Activate Connector"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Verify build passes**

Run: `cd monorepo/apps/database && bun run build`

**Step 3: Commit**

```bash
git add monorepo/apps/database/src/domains/connector-list/components/ActivateConnectorWarningModal.tsx
git commit -m "feat(connectors): add ActivateConnectorWarningModal component"
```

---

## Task 5: Integrate Modal into ConnectorTableCell

**Files:**
- Modify: `monorepo/apps/database/src/domains/connector-list/components/ConnectorTableCell.tsx`

**Step 1: Add modal state and intercept activate toggle**

Changes to `ConnectorTableCell.tsx`:
- Import `ActivateConnectorWarningModal` and `useState`
- Add state: `const [activateModalOpen, setActivateModalOpen] = useState(false)`
- In the `onCheckedChange` handler for the active toggle:
  - If `checked === true` (activating): open modal instead of calling mutation
  - If `checked === false` (deactivating): keep existing direct mutation call

```tsx
// Add imports:
import { useState } from "react";
import { ActivateConnectorWarningModal } from "./ActivateConnectorWarningModal";

// Inside component, add state:
const [activateModalOpen, setActivateModalOpen] = useState(false);

// Replace the active column block:
if (column.key === "active") {
  return (
    <div className="flex items-center">
      <ToggleSwitch
        checked={connector.active}
        disabled={!canEdit || toggleActiveMutation.isPending}
        onCheckedChange={(checked) => {
          if (!accountId || !connector.id) return;
          if (checked) {
            // Intercept activation — open warning modal
            setActivateModalOpen(true);
          } else {
            // Deactivation proceeds directly
            toggleActiveMutation.mutate(
              { accountId, connectorId: connector.id, active: false },
              { onError: (error) => toast.error(error.message) }
            );
          }
        }}
      />
      <ActivateConnectorWarningModal
        connectorId={connector.id}
        connectorName={connector.connectorName}
        open={activateModalOpen}
        onOpenChange={setActivateModalOpen}
      />
    </div>
  );
}
```

**Step 2: Verify build passes**

Run: `cd monorepo/apps/database && bun run build`

**Step 3: Manual test**

- Navigate to Connectors page
- Toggle inactive connector → modal should appear with pricing
- Type "ACCEPT" → button enables
- Click "Activate Connector" → connector activates
- Toggle active connector off → should deactivate directly (no modal)

**Step 4: Commit**

```bash
git add monorepo/apps/database/src/domains/connector-list/components/ConnectorTableCell.tsx
git commit -m "feat(connectors): intercept activate toggle with warning modal"
```

---

## Task 6: Remove Optimistic Update for Activation

**Files:**
- Modify: `monorepo/apps/database/src/domains/connector-list/api-hooks/useToggleConnectorActive.ts`

**Step 1: Conditionally skip optimistic update when activating**

The current `onMutate` optimistically flips the toggle. For activation (going through the modal), we want the toggle to stay inactive until the mutation succeeds. The simplest approach: only optimistically update on deactivation.

```typescript
// In onMutate, wrap the optimistic update:
onMutate: async ({ accountId, connectorId, active }) => {
  await queryClient.cancelQueries({ queryKey: ["connectors-action", accountId] });
  const previousConnectors = queryClient.getQueryData(["connectors-action", accountId]);

  // Only optimistically update for deactivation (activation waits for server confirmation)
  if (!active) {
    queryClient.setQueryData(
      ["connectors-action", accountId],
      (old: { connectors: ConnectorListItem[]; fullData: ConnectorListItem[] } | undefined) => {
        if (!old) return old;
        return {
          connectors: old.connectors.map((connector) =>
            connector.id === connectorId ? { ...connector, active } : connector
          ),
          fullData: old.fullData.map((connector) =>
            connector.id === connectorId ? { ...connector, active } : connector
          ),
        };
      }
    );
  }

  return { previousConnectors };
},
```

**Step 2: Verify build passes**

Run: `cd monorepo/apps/database && bun run build`

**Step 3: Commit**

```bash
git add monorepo/apps/database/src/domains/connector-list/api-hooks/useToggleConnectorActive.ts
git commit -m "feat(connectors): skip optimistic update on activation"
```

---

## Task 7: Write Tests

**Files:**
- Create: `monorepo/apps/database/__tests__/unit/src/domains/connector-list/components/ActivateConnectorWarningModal.test.tsx`

**Step 1: Write unit tests**

Test cases:
1. Modal renders with connector name in title
2. Activate button is disabled when input is empty
3. Activate button is disabled when input is "accept" (lowercase)
4. Activate button is enabled when input is "ACCEPT"
5. Cancel button closes modal
6. Billing copy is displayed

**Step 2: Run tests**

Run: `cd monorepo/apps/database && bun test __tests__/unit/src/domains/connector-list/components/ActivateConnectorWarningModal.test.tsx`

**Step 3: Commit**

```bash
git add monorepo/apps/database/__tests__/unit/src/domains/connector-list/components/ActivateConnectorWarningModal.test.tsx
git commit -m "test(connectors): add ActivateConnectorWarningModal unit tests"
```
