import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.ophim.live',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.ophim.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.ophim.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      }
    ],
    qualities: [60, 70, 75, 80, 85, 90],
  },
};

export default nextConfig;
