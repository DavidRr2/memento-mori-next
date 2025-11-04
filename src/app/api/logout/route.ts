// 파일 경로: src/app/api/logout/route.ts (최종 수정본)

import { NextResponse } from 'next/server'; // 여기에 NextRequest 추가!
import { serialize } from 'cookie';

export async function POST() {
  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    maxAge: -1,
    path: '/',
  });

  return new NextResponse(JSON.stringify({ message: '로그아웃 되었습니다.' }), {
    status: 200,
    headers: { 'Set-Cookie': cookie },
  });
}
