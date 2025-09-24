// 파일 경로: src/app/api/memories/route.ts (최종 수정본)

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import openDb from '../db'; // 경로를 '../db'로 수정!
import { promises as fs } from 'fs';
import path from 'path';

const JWT_SECRET = 'your-very-secret-key-that-should-be-kept-secret';

interface UserPayload {
  userId: number;
  email: string;
}

// ... (이하 내용은 이전과 동일) ...
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
    "SELECT id, content, image_filename, created_at FROM memories WHERE user_id = ?",
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
  const imageFile = formData.get('image') as File | null;

  if (!content && (!imageFile || imageFile.size === 0)) {
    return NextResponse.json({ error: '내용 또는 이미지가 필요합니다.' }, { status: 400 });
  }

  let image_filename: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}_${imageFile.name}`;
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    image_filename = filename;
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