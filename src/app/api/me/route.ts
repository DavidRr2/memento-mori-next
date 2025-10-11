// 파일 경로: src/app/api/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// [수정됨] 비밀 키를 .env.local 파일에서 불러오도록 변경
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key-that-should-be-kept-secret';

interface UserPayload {
  userId: number;
  email: string;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ logged_in: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return NextResponse.json({ logged_in: true, email: decoded.email });
  } catch (error) {
    // 토큰이 유효하지 않은 경우 (만료 등)
    return NextResponse.json({ logged_in: false });
  }
}