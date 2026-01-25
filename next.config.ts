import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ WAJIB: Supaya muncul file server.js
  output: "standalone",

  reactStrictMode: false,
  compress: true, // Hemat bandwidth

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true, // Hemat RAM server
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'merpatisolobakery.id',
        port: '',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
    ],
  },
  
  // Optimasi build
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
  },
};

export default nextConfig;