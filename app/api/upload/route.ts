import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET;

  if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket) {
    return NextResponse.json(
      { error: "Neon Storage environment variables are incomplete." },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Select an image first." }, { status: 400 });
    }

    const extension = allowedTypes[file.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are supported." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Images must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    const key = `uploads/${randomUUID()}.${extension}`;

    const client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      }),
    );

    const baseUrl = endpoint.replace(/\/+$/, "");
    const imageUrl =
      `${baseUrl}/${encodeURIComponent(bucket)}/` +
      key.split("/").map(encodeURIComponent).join("/");

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Neon Storage upload failed:", error);
    return NextResponse.json(
      { error: "Image upload failed. Check the Neon Storage configuration and server logs." },
      { status: 500 },
    );
  }
}
