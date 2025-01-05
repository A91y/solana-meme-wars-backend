import prisma from "@/lib/db";

export async function createPost(postData: {
  nftMint: string;
  creator: string;
  title: string;
  symbol: string;
  description?: string;
  isForSale: boolean;
  price?: number;
  tokenAccount: string;
  imageUrl?: string;
  collection?: string;
}) {
  const {
    nftMint,
    creator,
    title,
    symbol,
    description,
    isForSale,
    price,
    tokenAccount,
    imageUrl,
    collection,
  } = postData;

  // Create post in database
  const newPost = await prisma.post.create({
    data: {
      nftMint,
      tokenAccount,
      creator,
      description,
      title,
      isForSale,
      price,
      status: "active",
      imageUrl: imageUrl ?? "",
      metadata: {
        name: title,
        symbol: symbol,
        collection: collection ?? null,
      },
    },
  });

  return newPost;
}

export async function getAllPosts(creator?: string) {
  const filter = creator ? { where: { creator } } : undefined;
  return await prisma.post.findMany(filter);
}
