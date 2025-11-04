// 파일 경로: src/app/api/memories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import openDb from '../db';
import { getUserFromRequest } from '../_lib/auth';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const db = await openDb();
  const memories = await db.all(
    "SELECT id, content, image_filename, created_at, COALESCE(section, 'General') AS section FROM memories WHERE user_id = ? ORDER BY created_at DESC",
    user.userId
  );

  return NextResponse.json(memories);
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const formData = await request.formData();
  const content = formData.get('content') as string;
  const image_filename = formData.get('image_filename') as string | null;
  const section = (formData.get('section') as string | null)?.trim() || 'General';

  if (!content && !image_filename) {
    return NextResponse.json({ error: '내용 또는 이미지가 필요합니다.' }, { status: 400 });
  }

  const db = await openDb();
  const createdAt = new Date().toISOString();

  const result = await db.run(
    "INSERT INTO memories (user_id, content, image_filename, created_at, section) VALUES (?, ?, ?, ?, ?)",
    user.userId,
    content,
    image_filename,
    createdAt,
    section
  );

  return NextResponse.json({ message: '기억이 성공적으로 기록되었습니다.', id: result.lastID }, { status: 201 });
}
