import { Database } from "bun:sqlite";
import { homedir } from "os";
import { join } from "path";

const DB_PATH = join(homedir(), ".kiro", "kiro-memory.db");

let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) {
    _db = new Database(DB_PATH, { create: true });
    _db.exec("PRAGMA journal_mode = WAL");
    _db.exec("PRAGMA foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY,
      path TEXT NOT NULL UNIQUE,
      doc_type TEXT NOT NULL,
      title TEXT NOT NULL,
      project TEXT,
      status TEXT,
      sync TEXT,
      last_local_edit TEXT,
      content_hash TEXT NOT NULL,
      indexed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS document_tags (
      document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (document_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS specs (
      id INTEGER PRIMARY KEY,
      document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      spec_slug TEXT NOT NULL UNIQUE,
      pbi_id TEXT,
      has_requirements INTEGER NOT NULL DEFAULT 0,
      has_design INTEGER NOT NULL DEFAULT 0,
      has_tasks INTEGER NOT NULL DEFAULT 0,
      task_count INTEGER DEFAULT 0,
      tasks_done INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type);
    CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project);
    CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
    CREATE INDEX IF NOT EXISTS idx_documents_sync ON documents(sync);
    CREATE INDEX IF NOT EXISTS idx_documents_last_edit ON documents(last_local_edit);
    CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_specs_slug ON specs(spec_slug);
  `);
}
