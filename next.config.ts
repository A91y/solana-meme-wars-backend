import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'https://solana-meme-wars-backend.vercel.app/:path*',
          },
        ]
      },
};

export default nextConfig;
