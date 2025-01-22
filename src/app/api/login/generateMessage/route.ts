import { CHALLENGE_PREFIX } from "@/utils/constant";
import { generateNonce } from "@/utils/solana";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { wallet } = await req.json();
  try {
    const message = CHALLENGE_PREFIX + generateNonce(wallet);
    return NextResponse.json(message);
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

