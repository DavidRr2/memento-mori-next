// 파일 경로: src/app/api/db.ts (새로운 최종본)

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// 데이터베이스 파일을 열고 초기화하는 함수
export default async function openDb(): Promise<Database> {
  const db = await open({
    filename: './memory_archive.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        content TEXT NOT NULL,
        image_filename TEXT,
        created_at TEXT NOT NULL
    );
  `);

  return db;
}