import { NextRequest, NextResponse } from "next/server";
import { getWalletNFTs } from "@/utils/solana";

export async function GET(
  _: NextRequest,
  { params }: any
) {
  const { address } = await params;

  if (!address) {
    return NextResponse.json(
      { error: "Wallet address is required in the URL" },
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
