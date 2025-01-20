import { toggleUpvote } from "@/utils/dbUtils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { postId, interactor } = await req.json();
  try {
    const result = await toggleUpvote(postId, interactor);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
