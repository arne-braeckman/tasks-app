import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import * as schema from './schema'

// Standalone connection for MCP server (no Electron dependency)
let db: ReturnType<typeof drizzle> | null = null
let sqlite: Database.Database | null = null

export function getDbPath(): string {
  const appDataPath = join(homedir(), 'Library', 'Application Support', 'tasks-app')
  if (!existsSync(appDataPath)) {
    mkdirSync(appDataPath, { recursive: true })
  }
  return join(appDataPath, 'tasks.db')
}

export function getDb() {
  if (!db) {
    const dbPath = getDbPath()
    sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')

    db = drizzle(sqlite, { schema })

    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT '📁',
        color TEXT NOT NULL DEFAULT '#6C5CE7',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'none',
        due_date TEXT,
        assignee TEXT NOT NULL DEFAULT '',
        group_id TEXT REFERENCES groups(id) ON DELETE SET NULL,
        parent_id TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_tags (
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, tag_id)
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_group ON tasks(group_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag_id);
    `)

    // Migrate: add customer column if not exists
    try { sqlite.exec("ALTER TABLE tasks ADD COLUMN customer TEXT NOT NULL DEFAULT ''") } catch {}

    // Production: no seed data
  }
  return db
}

export function getSqlite() {
  if (!sqlite) getDb()
  return sqlite!
}

export function closeDb() {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
  }
}
