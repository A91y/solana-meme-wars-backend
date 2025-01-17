import { NextRequest, NextResponse } from "next/server";
import { getWalletNFTs } from "@/utils/solana";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Wallet address is required in the query parameters" },
      { status: 400 }
    );
  }

  try {
    const nfts = await getWalletNFTs(address);
    return NextResponse.json({ nfts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch NFTs. Please check the wallet address and try again.",
      },
      { status: 500 }
    );
  }
}
