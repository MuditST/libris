import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com'
      },
      {
        protocol: 'https', 
        hostname: '*.googleusercontent.com'
      }
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. REMOVE THIS after fixing errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;