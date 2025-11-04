// 파일 경로: src/lib/upload.ts

/**
 * Cloudflare R2로 업로드하기 위한 유틸 함수.
 * Presigned URL을 발급받아 직접 업로드하고, 저장된 오브젝트 키를 반환한다.
 */
const useLocalUploadsClient =
  process.env.NEXT_PUBLIC_USE_LOCAL_UPLOADS === "true" ||
  !process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

export async function uploadImageToR2(imageFile: File): Promise<string | null> {
  const needsConversion =
    /image\/hei[cf]/i.test(imageFile.type) ||
    imageFile.name?.toLowerCase().endsWith(".heic") ||
    imageFile.name?.toLowerCase().endsWith(".heif");

  const convertOption = needsConversion ? "jpeg" : undefined;

  if (useLocalUploadsClient || needsConversion) {
    return uploadViaServer(imageFile, { convert: convertOption });
  }

  let presignedResponse: Response;
  try {
    presignedResponse = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: imageFile.name,
        contentType: imageFile.type,
      }),
    });
  } catch (error) {
    console.error("Presigned URL 요청 중 네트워크 오류", error);
    return uploadViaServer(imageFile, { convert: convertOption });
  }

  if (!presignedResponse.ok) {
    console.error("Presigned URL 요청 실패");
    return uploadViaServer(imageFile, { convert: convertOption });
  }

  const { url, fields, key } = await presignedResponse.json();
  if (!url || !fields || !key) {
    console.error("Presigned URL 응답에 필요한 정보가 없습니다.", {
      url,
      fields,
      key,
    });
    return uploadViaServer(imageFile, { convert: convertOption });
  }

  const r2FormData = new FormData();
  Object.entries({ ...fields, file: imageFile }).forEach(([fieldKey, value]) => {
    r2FormData.append(fieldKey, value as string | Blob);
  });

  try {
    const uploadResponse = await fetch(url, {
      method: "POST",
      body: r2FormData,
    });

    if (!uploadResponse.ok) {
      console.error("R2 업로드 실패", await uploadResponse.text());
      return uploadViaServer(imageFile, { convert: convertOption });
    }
  } catch (error) {
    console.error("R2 업로드 중 네트워크 오류", error);
    return uploadViaServer(imageFile, { convert: convertOption });
  }

  return key;
}

async function uploadViaServer(
  imageFile: File,
  options?: { convert?: "jpeg" | undefined },
): Promise<string | null> {
  try {
    const fallbackFormData = new FormData();
    fallbackFormData.append("file", imageFile);

    const searchParams = new URLSearchParams();
    if (options?.convert) {
      searchParams.set("convert", options.convert);
    }
    const query = searchParams.toString();
    const uploadUrl = query
      ? `/api/upload/direct?${query}`
      : "/api/upload/direct";

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: fallbackFormData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("서버 업로드 실패", data);
      return null;
    }

    const { key } = await response.json();
    return typeof key === "string" ? key : null;
  } catch (error) {
    console.error("서버 업로드 중 오류", error);
    return null;
  }
}
