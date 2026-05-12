import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getDb } from "./db";
import { reindex } from "./reindex";

const server = new McpServer({ name: "memory", version: "2.0.0" });

reindex("changed");

server.tool(
  "memory_filter",
  "List documents matching metadata filters",
  {
    doc_type: z.string().optional().describe("Filter by type: knowledge | session | spec"),
    project: z.string().optional().describe("Filter by project"),
    status: z.string().optional().describe("Filter by status"),
    sync: z.string().optional().describe("Filter by sync state: draft | published | modified"),
    since: z.string().optional().describe("Only docs edited after this ISO date"),
    sort_by: z.string().optional().describe("last_local_edit | title"),
  },
  ({ doc_type, project, status, sync, since, sort_by }) => {
    const db = getDb();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (doc_type) { conditions.push("d.doc_type = ?"); params.push(doc_type); }
    if (project) { conditions.push("d.project = ?"); params.push(project); }
    if (status) { conditions.push("d.status = ?"); params.push(status); }
    if (sync) { conditions.push("d.sync = ?"); params.push(sync); }
    if (since) { conditions.push("d.last_local_edit > ?"); params.push(since); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const order = sort_by === "title" ? "d.title ASC" : "d.last_local_edit DESC NULLS LAST";

    const rows = db.query(`
      SELECT d.path, d.title, d.doc_type, d.project, d.status, d.sync, d.last_local_edit,
        (SELECT GROUP_CONCAT(t.name, ', ') FROM document_tags dt JOIN tags t ON t.id = dt.tag_id WHERE dt.document_id = d.id) as tags
      FROM documents d ${where} ORDER BY ${order} LIMIT 50
    `).all(...params);

    return { content: [{ type: "text", text: JSON.stringify({ documents: rows, count: rows.length }, null, 2) }] };
  }
);

server.tool(
  "memory_spec_status",
  "Get spec progress overview",
  {
    spec_slug: z.string().optional().describe("Specific spec slug"),
    status: z.string().optional().describe("Filter by status"),
  },
  ({ spec_slug, status }) => {
    const db = getDb();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (spec_slug) { conditions.push("s.spec_slug = ?"); params.push(spec_slug); }
    if (status) { conditions.push("d.status = ?"); params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = db.query(`
      SELECT s.spec_slug, d.title, d.status, s.pbi_id, s.task_count, s.tasks_done,
        s.has_requirements, s.has_design, s.has_tasks
      FROM specs s JOIN documents d ON d.id = s.document_id
      ${where} ORDER BY d.last_local_edit DESC
    `).all(...params);

    return { content: [{ type: "text", text: JSON.stringify({ specs: rows, count: rows.length }, null, 2) }] };
  }
);

server.tool(
  "memory_reindex",
  "Trigger a full or partial reindex of markdown files into SQLite",
  {
    scope: z.enum(["full", "changed"]).optional().describe("full = rebuild everything, changed = only modified files"),
    path: z.string().optional().describe("Reindex a single file or directory only"),
  },
  ({ scope, path }) => {
    const start = Date.now();
    const result = reindex(scope ?? "changed", path);
    return { content: [{ type: "text", text: JSON.stringify({ ...result, duration_ms: Date.now() - start }, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
