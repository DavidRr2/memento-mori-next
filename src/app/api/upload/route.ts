// 파일 경로: src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
// [수정됨] 잘못된 import 경로를 올바른 패키지로 변경!
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const { filename, contentType } = await request.json();

  // .env.local 파일에서 우리 비밀 키들을 불러옴
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return NextResponse.json({ error: 'Cloudflare R2 설정이 필요합니다.' }, { status: 500 });
  }
  
  // AWS 라이브러리를 Cloudflare R2에 연결하도록 설정
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });

  // 파일 이름이 중복되지 않도록 고유한 ID를 생성
  const key = `${uuidv4()}-${filename}`;

  try {
    // Cloudflare R2에 '임시 업로드 출입증' 발급 요청
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucketName,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 104857600], // 최대 100MB
        ['starts-with', '$Content-Type', contentType],
      ],
      Fields: {
        'Content-Type': contentType,
      },
      Expires: 600, // 10분 동안 유효
    });

    // 프론트엔드에 출입증 정보 전달
    return NextResponse.json({ url, fields, key });

  } catch (error) {
    console.error('Presigned Post 생성 오류:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}