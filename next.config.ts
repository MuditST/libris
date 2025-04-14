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
};

export default nextConfig;