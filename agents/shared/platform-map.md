# Ubiquity Platform Map

## Repositories

- **Ubiquity-WebApps** (Next.js 15, React 19, Bun): frontend monorepo — `database` app, `journey-builder` app
- **QT-Ubi-UbiquityBackend** (.NET/C#): gRPC + REST services, domain-based projects (system, list, mail, smta, forms, survey, share, event, txt, push, dte)
- **ubiquity-protos** (Protobuf, Buf): single source of truth for gRPC contracts → generates TS, Python, .NET packages
- **Ubiquity-Connectors-Prefect** (Python 3.12, Prefect 3, FastAPI): data connector orchestration flows

## How They Connect

WebApps → gRPC (Connect) → Backend
WebApps → REST → Connectors-Prefect
Connectors-Prefect → gRPC → Backend
Protos → generates packages consumed by all three

## Keyword Routing

| You hear | You look at |
|----------|-------------|
| database, webapp, frontend, UI, connector-list, add-connector | Ubiquity-WebApps |
| backend, gRPC service, .NET, domain, list service, account service | QT-Ubi-UbiquityBackend |
| proto, contract, schema, buf, breaking change | ubiquity-protos |
| connector, prefect, flow, extractor, importer, FastAPI | Ubiquity-Connectors-Prefect |

## Drill Down

For full architecture details (package structure, data flows, conventions): read `C:/Users/T828819/.kiro/steering/ubiquity-architecture.md`

## Engineering Memory (SQLite MCP)

You have access to `memory_*` MCP tools — a queryable index over all knowledge files and specs.

**Use when:** You need to find prior decisions, related specs, domain entities, or knowledge entries.
**Don't use when:** You already know the file path — just read it directly.

| Tool | Use for |
|------|---------|
| `memory_search` | "What do we know about X?" |
| `memory_filter` | "Show all specs in draft" / "What changed this week?" |
| `memory_get` | Full metadata + relationships for a specific doc |
| `memory_domain` | Business entities and how they relate |
| `memory_spec_status` | Spec progress overview |
