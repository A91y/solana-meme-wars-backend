import { addWallet } from "@/utils/solana";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, signature, wallet } = await req.json();
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const result = await addWallet(message, signature, wallet);
  if (!result) {
    return NextResponse.json(
      { error: "Failed to add wallet" },
      { status: 400 }
    );
  }
  if (!file) {
    return NextResponse.json(
      { success: false, message: "No file provided" },
      { status: 400 }
    );
  }

  const awsClient = new S3Client({ region: process.env.AWS_REGION });
  const bucket = process.env.AWS_BUCKET_NAME || "";
  const key = `uploads/${randomUUID()}`;

  try {
    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };
    await awsClient.send(new PutObjectCommand(uploadParams));

    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Error uploading file", error);
    return NextResponse.json(
      { success: false, message: (error as any).message },
      { status: 500 }
    );
  }
}
