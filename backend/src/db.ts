/**
 * SQLite-Schema für die KjG-Hygieneschulung.
 *
 * Schema gem. Plan-Sektion 4 (Datenmodell). Synchrone API von better-sqlite3
 * ist hier ideal: kein Connection-Pool, kein async-Overhead, einfacheres Logging.
 */

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

let _db: Database.Database | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS quiz_sessions (
  token         TEXT PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  question_ids  TEXT NOT NULL,
  started_at    TEXT NOT NULL,
  expires_at    TEXT NOT NULL,
  consumed_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON quiz_sessions(expires_at);

CREATE TABLE IF NOT EXISTS attempts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  email             TEXT,
  question_ids      TEXT NOT NULL,
  answers           TEXT NOT NULL,
  correct_count     INTEGER NOT NULL,
  total_count       INTEGER NOT NULL DEFAULT 10,
  passed            INTEGER NOT NULL,
  certificate_pdf   BLOB,
  certificate_hash  TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_created ON attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_name    ON attempts(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_attempts_hash    ON attempts(certificate_hash);
`;

export function getDb(): Database.Database {
  if (_db) return _db;
  const raw = process.env.DB_PATH ?? './data/app.sqlite';
  const path = raw === ':memory:' ? ':memory:' : resolve(raw);
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new Database(path);
  if (path !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  _db = db;
  return db;
}

/** Test-only helper to reset the singleton (used by integration tests). */
export function _resetDbForTests(): void {
  if (_db) {
    try {
      _db.close();
    } catch {
      // ignore
    }
  }
  _db = null;
}

export interface SessionRow {
  token: string;
  first_name: string;
  last_name: string;
  email: string | null;
  question_ids: string;
  started_at: string;
  expires_at: string;
  consumed_at: string | null;
}

export interface AttemptRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  question_ids: string;
  answers: string;
  correct_count: number;
  total_count: number;
  passed: number;
  certificate_pdf: Buffer | null;
  certificate_hash: string | null;
  created_at: string;
}
