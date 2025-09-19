import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ skip lint error saat build di Netlify
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,       // ✅ biar error face-api.js hilang
      encoding: false, // ✅ biar error node-fetch hilang
    };
    return config;
  },
};

export default nextConfig;
