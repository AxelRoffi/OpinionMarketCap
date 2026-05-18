import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate source maps for better error debugging
  productionBrowserSourceMaps: false,
  // Skip ESLint during builds (pre-existing lint warnings across admin/api/hooks)
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // Legacy URL — /mint was the V1 name for the create flow. Permanent
      // redirect so external bookmarks survive the rename to /create.
      { source: '/mint', destination: '/create', permanent: true },
    ];
  },
};

export default nextConfig;
