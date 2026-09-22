import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
