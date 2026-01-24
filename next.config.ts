import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  reactStrictMode: false,
  swcMinify: true,
  compress: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'merpatisolobakery.id',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
    ],
  },
  experimental: {},
};

export default nextConfig;
