// 파일 경로: src/app/api/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../_lib/auth';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  return NextResponse.json(
    user ? { logged_in: true, email: user.email } : { logged_in: false },
  );
}
