import { addWallet } from "@/utils/solana";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message, signature, wallet } = await req.json();
  try {
    const result = await addWallet(message, signature, wallet);
    if (!result) {
      return NextResponse.json(
        { error: "Failed to add wallet" },
        { status: 400 }
      );
    }
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
