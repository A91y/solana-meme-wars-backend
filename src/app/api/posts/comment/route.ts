import { addCommentToPost } from "@/utils/dbUtils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { postId, interactor, content } = await req.json();
  try {
    const newComment = await addCommentToPost(postId, interactor, content);
    return NextResponse.json(newComment);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ message: "Comment API" });
}
