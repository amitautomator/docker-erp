import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getServerSession } from "@/lib/getServerSession";

import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const maxSize = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 },
      ); // ✅ Consistent error response
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const fileId = uuidv4();

    const extension = fileType.split("/")[1]; // png, jpeg, webp
    const newFileName = `business-logos/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: newFileName,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

    return NextResponse.json({
      uploadUrl,
      newFileName,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
