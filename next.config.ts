import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during production build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
