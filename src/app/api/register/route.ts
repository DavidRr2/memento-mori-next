// 파일 경로: src/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import openDb from '../db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: '이메일과 비밀번호를 모두 입력해주세요.' }, { status: 400 });
  }

  const db = await openDb();
  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (existingUser) {
    return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', email, hashedPassword);

  return NextResponse.json({ message: '회원가입이 완료되었습니다!' }, { status: 201 });
}