import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate source maps for better error debugging
  productionBrowserSourceMaps: false,
};

export default nextConfig;
