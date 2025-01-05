import { NextRequest, NextResponse } from "next/server";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { SOLANA_RPC_URL } from "@/utils/constant";

const connection = new Connection(SOLANA_RPC_URL);
const metaplex = new Metaplex(connection);

async function getWalletNFTs(walletAddress: string) {
  const nfts = await metaplex
    .nfts()
    .findAllByOwner({ owner: new PublicKey(walletAddress) });

  return nfts;
}

export async function GET(
  _: NextRequest,
  { params }: { params: { address: string } }
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
