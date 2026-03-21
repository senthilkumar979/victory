import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '91qunajyvl11yxyb.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'frigate.ai',
      },
      {
        protocol: 'https',
        hostname: 'klyonix.com',
      },
      {
        protocol: 'https',
        hostname: '*.zohobackstage.com',
      },
      {
        protocol: 'https',
        hostname: 'wfkq0nguanh0273r.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
