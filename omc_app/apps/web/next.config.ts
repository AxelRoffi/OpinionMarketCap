import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate source maps for better error debugging
  productionBrowserSourceMaps: false,
  // Skip ESLint during builds (pre-existing lint warnings across admin/api/hooks)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
