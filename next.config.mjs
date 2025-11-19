/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Compress responses
  compress: true,
  // Enable page pre-rendering for better performance
  trailingSlash: false,
}

export default nextConfig
