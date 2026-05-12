# Activate Connector Warning Modal — Design

## Architecture

The modal intercepts the toggle-to-active action in `ConnectorTableCell`. Instead of firing the mutation directly, it opens a confirmation dialog that fetches the connector's resolved price via gRPC (`PricingService.GetResolvedPrice`) and requires the user to type `ACCEPT` before proceeding.

The pattern mirrors the existing `DeleteConnectorConfirmationModal` — same Dialog primitives, same "type ACCEPT" UX, same error handling shape.

## Data Flow

```
User flips toggle → (if activating) → open ActivateConnectorWarningModal
                                         ↓
                              fetch GetResolvedPrice(accountId, "connectors.active_connector")
                                         ↓
                              display cost + billing terms
                                         ↓
                              user types ACCEPT → button enabled
                                         ↓
                              click "Activate Connector" → toggleActiveMutation.mutate(active: true)
                                         ↓
                              (backend handles billing signal via SQS — no frontend action needed)
```

## Key Decisions

1. **Price fetching:** Call `GetResolvedPrice` server-side via a Next.js route handler (`/api/connectors/pricing`). This keeps the gRPC transport server-only (consistent with existing patterns — all gRPC calls go through server actions or route handlers).

2. **No optimistic update on activate:** Unlike the current toggle (which optimistically flips), the modal flow waits for mutation success before updating UI. This is intentional — the PBI requires the toggle to stay inactive until confirmed.

3. **Deactivation unchanged:** The modal only intercepts `inactive → active`. Toggling `active → inactive` continues to fire the mutation directly (no billing warning needed for deactivation).

4. **Billing signal is backend-only:** The Connectors-Prefect service already sends `SubscriptionActivated` to SQS on activation. The frontend does NOT need to signal billing — it just calls the existing toggle endpoint.

5. **Error state stays in modal:** If the mutation fails after confirmation, the modal stays open with an error message (not a toast). The toggle remains inactive.

## Components

| Component | Responsibility |
|-----------|---------------|
| `ActivateConnectorWarningModal` | Dialog with billing copy, ACCEPT input, activate button |
| `useGetConnectorPrice` | React Query hook calling the pricing route handler |
| `/api/connectors/pricing/route.ts` | Server-side route handler calling `PricingService.GetResolvedPrice` |
| `ConnectorTableCell` (modified) | Opens modal on activate instead of firing mutation directly |
| `grpc-clients.ts` (modified) | Add `pricingClient` export |

## UI Copy (from PBI mockup)

**Title:** "Activate [Connector Name]?"

**Body:**
> Activating this connector will start a billing period of **$[cost]/month**.
>
> This is a minimum 1-month commitment that cannot be canceled or refunded once started.
>
> Type **ACCEPT** below to confirm activation.

**Buttons:** Cancel | Activate Connector (disabled until ACCEPT typed)
