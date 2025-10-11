// 파일 경로: src/app/api/memories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import openDb from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key-that-should-be-kept-secret';

interface UserPayload {
  userId: number;
  email: string;
}

async function getUser(request: NextRequest): Promise<UserPayload | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const db = await openDb();
  const memories = await db.all(
    "SELECT id, content, image_filename, created_at FROM memories WHERE user_id = ? ORDER BY created_at DESC",
    user.userId
  );

  return NextResponse.json(memories);
}

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const formData = await request.formData();
  const content = formData.get('content') as string;
  const image_filename = formData.get('image_filename') as string | null;

  if (!content && !image_filename) {
    return NextResponse.json({ error: '내용 또는 이미지가 필요합니다.' }, { status: 400 });
  }

  const db = await openDb();
  const createdAt = new Date().toISOString();

  const result = await db.run(
    "INSERT INTO memories (user_id, content, image_filename, created_at) VALUES (?, ?, ?, ?)",
    user.userId,
    content,
    image_filename,
    createdAt
  );

  return NextResponse.json({ message: '기억이 성공적으로 기록되었습니다.', id: result.lastID }, { status: 201 });
}