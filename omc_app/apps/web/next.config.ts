import type { NextConfig } from "next";
import path from "path";

// Get the monorepo root (two levels up from apps/web)
const monorepoRoot = path.resolve(__dirname, '../../');

const nextConfig: NextConfig = {
  // Fix multiple lockfiles warning - set workspace root to monorepo
  outputFileTracingRoot: monorepoRoot,

  // Webpack configuration to resolve React version conflicts
  webpack: (config) => {
    // Ensure single React instance across all modules (hoisted to monorepo root)
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(monorepoRoot, 'node_modules/react'),
      'react-dom': path.resolve(monorepoRoot, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(monorepoRoot, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(monorepoRoot, 'node_modules/react/jsx-dev-runtime'),
    };
    return config;
  },

  // Generate source maps for better error debugging
  productionBrowserSourceMaps: false,
};

export default nextConfig;
