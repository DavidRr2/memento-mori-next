// 파일 경로: src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import openDb from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

// [수정됨] 비밀 키를 .env.local 파일에서 불러오도록 변경
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key-that-should-be-kept-secret';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);

  if (user && await bcrypt.compare(password, user.password_hash)) {
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    return new NextResponse(JSON.stringify({ message: '로그인 성공!' }), {
      status: 200,
      headers: { 'Set-Cookie': cookie },
    });
  } else {
    return NextResponse.json({ error: '잘못된 이메일 또는 비밀번호입니다.' }, { status: 401 });
  }
}