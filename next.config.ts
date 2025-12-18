import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.formula1.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.formula1.com',
        pathname: '/content/dam/fom-website/drivers/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
