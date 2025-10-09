import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Tambahkan baris ini untuk mengaktifkan output yang dibutuhkan oleh Docker
  output: "standalone",
};

export default nextConfig;
