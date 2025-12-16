import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: {
    // This completely disables ESLint during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
