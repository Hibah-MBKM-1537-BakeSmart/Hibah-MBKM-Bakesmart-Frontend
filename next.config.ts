import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // buat build tracing otomatis
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    // bantu Docker tracing dependensi dari root project
    outputFileTracingRoot: __dirname,
  },
};

export default nextConfig;
