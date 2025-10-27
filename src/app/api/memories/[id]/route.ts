// 파일 경로: src/app/api/memories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import openDb from '../../db';
import { getUserFromRequest } from '../../_lib/auth';

type RouteParamsPromise = Promise<Record<string, string | string[] | undefined>>;

async function resolveMemoryId(params: RouteParamsPromise): Promise<string | null> {
  const resolved = await params;
  const id = resolved?.id;
  return typeof id === 'string' ? id : null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParamsPromise }
) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const db = await openDb();
  const memoryId = await resolveMemoryId(params);
  if (!memoryId) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const memory = await db.get(
    "SELECT * FROM memories WHERE id = ? AND user_id = ?",
    memoryId,
    user.userId
  );

  if (!memory) {
    return NextResponse.json({ error: '해당 기억을 찾을 수 없거나 삭제 권한이 없습니다.' }, { status: 404 });
  }

  if (memory.image_filename) {
    // TODO: 여기에 Cloudflare R2의 파일을 삭제하는 로직을 추가해야 합니다.
    // (예: new S3Client(...).send(new DeleteObjectCommand(...)))
  }

  await db.run("DELETE FROM memories WHERE id = ?", memoryId);

  return NextResponse.json({ message: '기억이 성공적으로 삭제되었습니다.' });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParamsPromise }
) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const db = await openDb();
  const memoryId = await resolveMemoryId(params);
  if (!memoryId) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const memory = await db.get(
    "SELECT * FROM memories WHERE id = ? AND user_id = ?",
    memoryId,
    user.userId
  );

  if (!memory) {
    return NextResponse.json({ error: '해당 기억을 찾을 수 없거나 수정 권한이 없습니다.' }, { status: 404 });
  }

  const formData = await request.formData();
  const content = formData.get('content') as string;
  const image_filename = formData.get('image_filename') as string | null;

  // 새 이미지가 업로드되면 기존 이미지는 R2에서 삭제해야 함
  const newImageUploaded = formData.has('image_filename') && memory.image_filename !== image_filename;
  if (newImageUploaded && memory.image_filename) {
      // TODO: 여기에 Cloudflare R2의 '오래된' 파일을 삭제하는 로직을 추가해야 합니다.
  }

  await db.run(
    "UPDATE memories SET content = ?, image_filename = ? WHERE id = ?",
    content,
    image_filename,
    memoryId
  );

  return NextResponse.json({ message: '기억이 성공적으로 수정되었습니다.' });
}
