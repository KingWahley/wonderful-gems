/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'wanderful-gems.lovable.app',
      },
      {
        protocol: 'https',
        hostname: 'aehjcuowbyugudhmvcag.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'pohcdn.com',
      },
    ],
  },
};

export default nextConfig;
