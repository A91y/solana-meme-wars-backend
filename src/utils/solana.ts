import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
import prisma from "@/lib/db";
import { SOLANA_RPC_URL } from "./constant";
import { Metadata, Metaplex } from "@metaplex-foundation/js";

export async function verifyNFTOwnership(
  mintAddress: string,
  walletAddress: string
) {
  const connection = new Connection(SOLANA_RPC_URL);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(walletAddress),
    { mint: new PublicKey(mintAddress) }
  );

  return {
    verified: tokenAccounts.value.length > 0,
    tokenAccount: tokenAccounts.value[0]?.pubkey,
  };
}

export async function createNFTTransferInstruction(
  postId: string | number,
  seller: string,
  buyer: string
) {
  const post = await prisma.post.findUnique({ where: { id: Number(postId) } });
  if (!post) {
    throw new Error(`Post with ID ${postId} not found`);
  }
  const mintPubkey = new PublicKey(post.nftMint);
  const sellerPubkey = new PublicKey(seller);
  const buyerPubkey = new PublicKey(buyer);

  const sellerTokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    sellerPubkey
  );
  const buyerTokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    buyerPubkey,
    true
  );

  return createTransferInstruction(
    sellerTokenAccount,
    buyerTokenAccount,
    sellerPubkey,
    1
  );
}

export async function getWalletNFTs(walletAddress: string) {
  const connection = new Connection(SOLANA_RPC_URL);
  const metaplex = new Metaplex(connection);

  const nfts = await metaplex
    .nfts()
    .findAllByOwner({ owner: new PublicKey(walletAddress) });

  return nfts;
}

export async function getImageUrlByURI(uri: string) {
  const response = await fetch(uri);
  const data = await response.json();
  if (Array.isArray(data)) {
    return data[0].image;
  }
  return data.image;
}

export async function getNFTByMint(mint: string) {
  const connection = new Connection(SOLANA_RPC_URL);
  const metaplex = new Metaplex(connection);

  const nft = await metaplex
    .nfts()
    .findByMint({ mintAddress: new PublicKey(mint) });
  return nft;
}
