import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    remotePatterns: [
      // QR-code rendering helper used by `<QrCode>` for affiliate links.
      { protocol: 'https', hostname: 'api.qrserver.com' },
    ],
  },
};

export default nextConfig;
