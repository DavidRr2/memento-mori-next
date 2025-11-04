import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { lookup as mimeLookup } from "mime-types";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";


type RouteParamsPromise = Promise<Record<string, string | string[] | undefined>>;

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

export async function GET(
  _request: NextRequest,
  { params }: { params: RouteParamsPromise },
) {
  const resolved = await params;
  const segments = resolved?.key;
  if (!segments) {
    return NextResponse.json({ error: "잘못된 경로입니다." }, { status: 400 });
  }

  const key = Array.isArray(segments) ? segments.join("/") : segments;

  if (key.includes("..")) {
    return NextResponse.json({ error: "잘못된 경로입니다." }, { status: 400 });
  }
  const localPath = path.join(process.cwd(), "public", "uploads", key);

  const mimeType = mimeLookup(key) || "application/octet-stream";

  try {
    const data = await fs.readFile(localPath);
    return new NextResponse(blobFromBuffer(data), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("로컬 업로드 읽기 오류", error);
      return NextResponse.json({ error: "파일을 읽을 수 없습니다." }, { status: 500 });
    }
  }

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const result = await client.send(command);
    const bodyStream = result.Body;
    if (!bodyStream) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    const arrayBuffer = await bodyStream.transformToByteArray();

    // 캐싱을 위해 로컬에도 저장
    try {
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, Buffer.from(arrayBuffer));
    } catch (cacheError) {
      console.warn("로컬 캐시 저장 실패", cacheError);
    }

    const remoteBuffer = Buffer.from(arrayBuffer);
    return new NextResponse(blobFromBuffer(remoteBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("원격 업로드 가져오기 실패", error);
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }
}

function blobFromBuffer(buffer: Buffer): Blob {
  const typedArray = Uint8Array.from(buffer);
  return new Blob([typedArray.buffer]);
}
