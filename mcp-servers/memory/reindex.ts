import { getDb } from "./db";
import matter from "gray-matter";
import { createHash } from "crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, basename } from "path";
import { homedir } from "os";

const KIRO_ROOT = join(homedir(), ".kiro");
const SCAN_DIRS = [join(KIRO_ROOT, "knowledge"), join(KIRO_ROOT, "specs")];

function hash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function findMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) files.push(full);
    }
  };
  walk(dir);
  return files;
}

function inferDocType(relPath: string): string {
  if (relPath.startsWith("knowledge/sessions/")) return "session";
  if (relPath.startsWith("knowledge/")) return "knowledge";
  if (relPath.startsWith("specs/")) return "spec";
  return "knowledge";
}

function inferProject(relPath: string, fm: Record<string, unknown>): string | null {
  if (fm.project) return String(fm.project);
  const name = basename(relPath, ".md");
  const prefix = name.split("-")[0]?.toLowerCase();
  if (prefix && ["webapps", "backend", "protos", "connectors", "ubiquity"].includes(prefix)) return prefix;
  return null;
}

function extractTitle(content: string, relPath: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : basename(relPath, ".md");
}

function extractTags(fm: Record<string, unknown>): string[] {
  if (Array.isArray(fm.tags)) return fm.tags.map(String);
  if (typeof fm.tags === "string") return fm.tags.split(",").map(t => t.trim());
  return [];
}

export function reindex(scope: "full" | "changed" = "changed", targetPath?: string): { indexed: number; updated: number; removed: number; errors: string[] } {
  const db = getDb();
  const errors: string[] = [];
  let indexed = 0, updated = 0, removed = 0;

  if (scope === "full") {
    db.exec("DELETE FROM document_tags");
    db.exec("DELETE FROM specs");
    db.exec("DELETE FROM documents");
  }

  const files = targetPath
    ? (existsSync(targetPath) ? (statSync(targetPath).isDirectory() ? findMarkdownFiles(targetPath) : [targetPath]) : [])
    : SCAN_DIRS.flatMap(findMarkdownFiles);

  const existingHashes = new Map<string, string>();
  if (scope === "changed") {
    for (const row of db.query("SELECT path, content_hash FROM documents").all() as { path: string; content_hash: string }[]) {
      existingHashes.set(row.path, row.content_hash);
    }
  }

  const upsertDoc = db.prepare(`
    INSERT INTO documents (path, doc_type, title, project, status, sync, last_local_edit, content_hash, indexed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(path) DO UPDATE SET
      doc_type=excluded.doc_type, title=excluded.title, project=excluded.project,
      status=excluded.status, sync=excluded.sync, last_local_edit=excluded.last_local_edit,
      content_hash=excluded.content_hash, indexed_at=datetime('now')
  `);
  const getDocId = db.prepare("SELECT id FROM documents WHERE path = ?");
  const upsertTag = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
  const getTagId = db.prepare("SELECT id FROM tags WHERE name = ?");
  const insertDocTag = db.prepare("INSERT OR IGNORE INTO document_tags (document_id, tag_id) VALUES (?, ?)");
  const clearDocTags = db.prepare("DELETE FROM document_tags WHERE document_id = ?");

  const processedPaths = new Set<string>();

  db.exec("BEGIN");
  try {
    for (const file of files) {
      try {
        const raw = readFileSync(file, "utf-8");
        const { data: fm, content } = matter(raw);
        const relPath = relative(KIRO_ROOT, file).replace(/\\/g, "/");
        const contentHash = hash(raw);

        processedPaths.add(relPath);
        if (scope === "changed" && existingHashes.get(relPath) === contentHash) continue;

        const docType = inferDocType(relPath);
        const title = extractTitle(content, relPath);
        const project = inferProject(relPath, fm);
        const status = fm.status ?? fm.sessionStatus ?? null;
        const sync = fm.sync ?? null;
        const lastLocalEdit = fm.lastLocalEdit ? String(fm.lastLocalEdit) : null;

        upsertDoc.run(relPath, docType, title, project, status, sync, lastLocalEdit, contentHash);

        const docRow = getDocId.get(relPath) as { id: number };
        clearDocTags.run(docRow.id);
        for (const tag of extractTags(fm)) {
          upsertTag.run(tag);
          const tagRow = getTagId.get(tag) as { id: number };
          insertDocTag.run(docRow.id, tagRow.id);
        }

        if (existingHashes.has(relPath)) updated++;
        else indexed++;
      } catch (e) {
        errors.push(`${file}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    if (scope === "changed" && !targetPath) {
      for (const [path] of existingHashes) {
        if (!processedPaths.has(path)) {
          db.exec(`DELETE FROM documents WHERE path = '${path.replace(/'/g, "''")}'`);
          removed++;
        }
      }
    }

    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }

  return { indexed, updated, removed, errors };
}
