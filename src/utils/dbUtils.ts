import prisma from "@/lib/db";

/**
 * Create a new post.
 */
export async function createPost(postData: {
  nftMint: string;
  creator: string; // Wallet address of the creator
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

  const existingPost = await prisma.post.findUnique({
    where: {
      nftMint_creator: {
        nftMint,
        creator,
      },
    },
  });

  if (existingPost) {
    return { error: "Post with this NFT Mint already exists" };
  }
  // Ensure the user exists or create a new one
  const user = await prisma.user.upsert({
    where: { walletAddress: creator },
    update: {
      lastActive: new Date(),
    },
    create: {
      walletAddress: creator,
      username: null,
      totalPosts: 0,
      totalSales: 0,
      lastActive: new Date(),
    },
  });

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

  // Increment totalPosts for the user
  await prisma.user.update({
    where: { walletAddress: creator },
    data: {
      totalPosts: {
        increment: 1,
      },
    },
  });

  return newPost;
}

/**
 * Toggle upvote for a post by an interactor.
 */
export async function toggleUpvote(postId: number, interactor: string) {
  // Ensure the interactor exists or create a new user
  const user = await prisma.user.upsert({
    where: { walletAddress: interactor },
    update: {
      lastActive: new Date(),
    },
    create: {
      walletAddress: interactor,
      username: null,
      totalPosts: 0,
      totalSales: 0,
      lastActive: new Date(),
    },
  });

  // Check if the user already upvoted
  const existingVote = await prisma.vote.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: user.id,
      },
    },
  });

  if (existingVote?.type === "upvote") {
    // Remove the upvote
    await prisma.vote.delete({
      where: {
        id: existingVote.id,
      },
    });
    await prisma.post.update({
      where: { id: postId },
      data: { upvotes: { decrement: 1 } },
    });
    return { message: "Upvote removed" };
  } else {
    // Add or change to an upvote
    if (existingVote) {
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type: "upvote" },
      });
    } else {
      await prisma.vote.create({
        data: {
          postId,
          userId: user.id,
          type: "upvote",
        },
      });
    }
    await prisma.post.update({
      where: { id: postId },
      data: {
        upvotes: { increment: 1 },
        downvotes: existingVote ? { decrement: 1 } : undefined,
      },
    });
    return { message: "Upvoted" };
  }
}

/**
 * Toggle downvote for a post by an interactor.
 */
export async function toggleDownvote(postId: number, interactor: string) {
  // Ensure the interactor exists or create a new user
  const user = await prisma.user.upsert({
    where: { walletAddress: interactor },
    update: {
      lastActive: new Date(),
    },
    create: {
      walletAddress: interactor,
      username: null,
      totalPosts: 0,
      totalSales: 0,
      lastActive: new Date(),
    },
  });

  // Check if the user already downvoted
  const existingVote = await prisma.vote.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: user.id,
      },
    },
  });

  if (existingVote?.type === "downvote") {
    // Remove the downvote
    await prisma.vote.delete({
      where: {
        id: existingVote.id,
      },
    });
    await prisma.post.update({
      where: { id: postId },
      data: { downvotes: { decrement: 1 } },
    });
    return { message: "Downvote removed" };
  } else {
    // Add or change to a downvote
    if (existingVote) {
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type: "downvote" },
      });
    } else {
      await prisma.vote.create({
        data: {
          postId,
          userId: user.id,
          type: "downvote",
        },
      });
    }
    await prisma.post.update({
      where: { id: postId },
      data: {
        downvotes: { increment: 1 },
        upvotes: existingVote ? { decrement: 1 } : undefined,
      },
    });
    return { message: "Downvoted" };
  }
}

/**
 * Add a comment to a post.
 */
export async function addCommentToPost(
  postId: number,
  interactor: string,
  content: string
) {
  // Ensure the interactor exists or create a new user
  const user = await prisma.user.upsert({
    where: { walletAddress: interactor },
    update: {
      lastActive: new Date(),
    },
    create: {
      walletAddress: interactor,
      username: null,
      totalPosts: 0,
      totalSales: 0,
      lastActive: new Date(),
    },
  });

  // Add the comment
  const newComment = await prisma.comment.create({
    data: {
      postId,
      userId: user.id,
      content,
    },
  });

  return newComment;
}

/**
 * Get all posts.
 */
export async function getAllPosts(creator?: string) {
  const filter = creator ? { where: { creator } } : undefined;
  return await prisma.post.findMany(filter);
}

/**
 * Fetch all comments for a specific post.
 */
export async function getCommentsForPost(postId: number) {
  // Fetch comments for the given postId along with the user who posted them
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      User: { select: { walletAddress: true, username: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments;
}

/**
 * Fetch a specific post by its ID.
 */
export async function getPostById(postId: number) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      User: true,
      comments: true,
      votes: true,
    },
  });
}

export async function getPostByMintAddress(mintAddress: string) {
  return await prisma.post.findMany({
    where: { nftMint: mintAddress },
    include: {
      User: true,
      comments: true,
      votes: true,
    },
  });
}
