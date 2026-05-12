---
sync: draft
notionPageId:
lastLocalEdit: 2026-05-07T10:53:00+12:00
lastPublished:
---

# Backend ↔ Connectors API: Field Usage Integration

## Key Discovery

The Connectors-Prefect FastAPI uses Pydantic's default snake_case JSON serialization. Any .NET consumer (like `ConnectorFieldUsageService`) MUST use snake_case in `[JsonProperty]` attributes when deserializing responses.

## API Contract

```
GET /connectors/{account_id}/field-usage?table_id={table_id}
```

- `table_id` optional — omit for contact table, include for transactional
- Auth: `verify_connectors_feature_access` + `verify_view_connectors`
- Returns 200 with empty `fields` array if no active connectors

## Response Shape (snake_case from Python)

```json
{
  "fields": [
    {
      "field_identifier": "email",
      "usage_type": "to_name",
      "connectors": [
        {
          "connector_id": "uuid",
          "connector_name": "SFTP Daily Import",
          "connector_type": "importer",
          "system": "sftp"
        }
      ]
    }
  ]
}
```

## Backend Consumer

- File: `mvc/code/Infrastructure/ConnectorFieldUsageService.cs`
- Static class, `Lazy<HttpClient>`, reads `Settings.ConnectorFieldUsageApiBaseUrl`
- Private deserialization models with `[JsonProperty("snake_case")]`
- Maps to public models in `Info/Connector/`
- Gracefully degrades (returns empty result) if API URL not configured

## Config

- Setting: `ConnectorFieldUsage.ApiBaseUrl`
- Test: `https://connectors-helper.internal.ubiquity-test.co.nz`
- Prod: `https://connectors-helper.internal.ubiquity-prod.co.nz`
- Local: not configured by default (graceful degrade)

## Gotcha

Pydantic serializes as snake_case by default. The original PR #2773 used camelCase in JsonProperty attributes, causing all fields to deserialize as null. Fixed in `fix/connector-field-usage-deserialization` branch.

## Revert Status (2026-05-07)

- **PR #2773** (feature) — merged into release/1.178.0, then REVERTED via PR #2795
- **PR #2788** (URL fix + graceful degrade) — closed, never merged
- **PR #2795** (revert) — open, targets release/1.178.0, removes entire feature
- **Branch `fix/connector-field-usage-deserialization`** — parked for next iteration, contains snake_case fix + graceful degrade + correct URLs

## Next Iteration Plan

1. Revert the revert (re-introduce #2773's feature code)
2. Merge `fix/connector-field-usage-deserialization` (all fixes combined)
3. Full end-to-end testing before release
4. Ensure `ConnectorFieldUsage.ApiBaseUrl` is configured in settings.xml for all environments

## Related PBIs

- #3503387 — Connector field usage API (Connectors-Prefect side, George Powell)
- #3482774 — Database Change Alert (consumes this API)
- Parent Feature: #3487866 — Database Edit Alert
