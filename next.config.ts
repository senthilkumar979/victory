import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '91qunajyvl11yxyb.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
