import { addCommentToPost, getCommentsForPost } from "@/utils/dbUtils";
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
  try {
    // Extract postId from the query parameters
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");

    // Ensure postId is provided and is a valid number
    if (!postId || isNaN(Number(postId))) {
      return NextResponse.json(
        { error: "Invalid or missing postId" },
        { status: 400 }
      );
    }

    // Fetch comments for the specified post
    const comments = await getCommentsForPost(Number(postId));

    // Return the comments in the response
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
