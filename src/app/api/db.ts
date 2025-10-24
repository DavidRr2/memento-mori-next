// 파일 경로: src/app/api/db.ts (새로운 최종본)

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// 데이터베이스 파일을 열고 초기화하는 함수
export default async function openDb(): Promise<Database> {
  const db = await open({
    filename: './memory_archive.db',
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        image_filename TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_memories_user_id_created_at
    ON memories (user_id, created_at DESC);
  `);

  return db;
}
