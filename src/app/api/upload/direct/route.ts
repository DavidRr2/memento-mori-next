// 파일 경로: src/app/api/upload/direct/route.ts

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getUserFromRequest } from "../../_lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "업로드할 파일이 필요합니다." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const body: Buffer = Buffer.from(new Uint8Array(arrayBuffer));
  const fileName =
    file instanceof File && file.name ? file.name : "upload";
  const originalExtension = path.extname(fileName);
  const convertParam = request.nextUrl.searchParams.get("convert");
  const shouldConvertToJpeg =
    convertParam === "jpeg" ||
    /image\/hei[cf]/i.test(file.type) ||
    originalExtension.toLowerCase() === ".heic" ||
    originalExtension.toLowerCase() === ".heif";

  let targetBuffer: Buffer = body;
  let targetContentType = file.type || "application/octet-stream";
  let targetExtension = originalExtension;

  if (shouldConvertToJpeg) {
    try {
      targetBuffer = await sharp(body).rotate().jpeg({ quality: 88 }).toBuffer();
      targetContentType = "image/jpeg";
      targetExtension = ".jpg";
    } catch (error) {
      console.error("이미지 변환 실패, 원본 파일을 사용합니다.", error);
      targetBuffer = body;
      targetContentType = file.type || "application/octet-stream";
      targetExtension = originalExtension || ".jpg";
    }
  }

  const shouldUseLocal =
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    process.env.ENABLE_LOCAL_UPLOADS === "true";

  if (shouldUseLocal) {
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const extension = targetExtension || ".jpg";
      const key = `${uuidv4()}${extension}`;
      await writeFile(path.join(uploadsDir, key), targetBuffer);
      return NextResponse.json({ key: `local/${key}` });
    } catch (error) {
      console.error("LOCAL UPLOAD ERROR", error);
      return NextResponse.json(
        { error: "로컬 업로드에 실패했습니다." },
        { status: 500 },
      );
    }
  }

  const baseName = fileName.replace(/\.[^.]+$/, "").replace(/\s+/g, "-") || "upload";
  const extensionForKey = targetExtension || originalExtension || ".jpg";
  const key = `${uuidv4()}-${baseName}${extensionForKey}`;

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: targetBuffer,
        ContentType: targetContentType,
        Metadata: {
          "uploaded-by": String(user.userId),
        },
      }),
    );

    return NextResponse.json({ key });
  } catch (error) {
    console.error("DIRECT UPLOAD ERROR", error);
    return NextResponse.json(
      { error: "업로드에 실패했습니다." },
      { status: 500 },
    );
  }
}
