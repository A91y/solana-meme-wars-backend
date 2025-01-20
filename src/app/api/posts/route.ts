import { NextResponse } from "next/server";
import {
  verifyNFTOwnership,
  getNFTByMint,
  getImageUrlByURI,
} from "@/utils/solana";
import { createPost, getAllPosts } from "@/utils/dbUtils";

export async function POST(req: Request) {
  const { nftMint, walletAddress } = await req.json();

  try {
    // Verify NFT ownership
    const ownership = await verifyNFTOwnership(nftMint, walletAddress);

    if (!ownership.verified) {
      return NextResponse.json({ error: "Not the NFT owner" }, { status: 400 });
    }

    // Get wallet NFTs
    const nft = await getNFTByMint(nftMint);
    let imageUrl;
    try {
      imageUrl = await getImageUrlByURI(nft.uri);
    } catch (error) {
      console.error("Error fetching image URL", error);
      imageUrl = "";
    }

    const newPost = await createPost({
      nftMint,
      creator: walletAddress,
      title: nft.name,
      symbol: nft.symbol,
      isForSale: false,
      tokenAccount: ownership.tokenAccount.toBase58(),
      imageUrl,
      collection: nft.collection?.address.toBase58(),
    });

    return NextResponse.json(newPost);
  } catch (error) {
    return NextResponse.error();
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const creator = searchParams.get("creator");

  try {
    const posts = await getAllPosts(creator ?? undefined);
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.error();
  }
}
