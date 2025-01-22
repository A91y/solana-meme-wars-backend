import { updateUserProfileImage } from "@/utils/dbUtils";
import { addWallet } from "@/utils/solana";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, signature, wallet } = await req.json();
    if (!message || !signature || !wallet) {
      return NextResponse.json(
        { error: "Missing required fields: message, signature, or wallet" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await addWallet(message, signature, wallet);
    if (!result) {
      return NextResponse.json(
        {
          error:
            "Failed to add wallet. Please check your message and signature.",
        },
        { status: 400 }
      );
    }

    const awsClient = new S3Client({ region: process.env.AWS_REGION });
    const bucket = process.env.AWS_BUCKET_NAME || "";
    if (!bucket) {
      return NextResponse.json(
        { error: "AWS bucket name is not configured" },
        { status: 500 }
      );
    }

    const key = `uploads/${randomUUID()}`;

    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };

    await awsClient.send(new PutObjectCommand(uploadParams));

    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const updatedUser = await updateUserProfileImage(wallet, url);
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user profile image" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request", error);
    return NextResponse.json(
      { error: "Internal server error", message: (error as any).message },
      { status: 500 }
    );
  }
}
