import { NextRequest, NextResponse } from "next/server";
import { getWalletNFTs } from "@/utils/solana";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return new NextResponse(
      JSON.stringify({
        error: "Wallet address is required in the query parameters",
      }),
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const nfts = await getWalletNFTs(address);
    return new NextResponse(JSON.stringify({ nfts }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          "Failed to fetch NFTs. Please check the wallet address and try again.",
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
