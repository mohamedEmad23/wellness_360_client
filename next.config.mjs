// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['wellness-360-server.onrender.com'],
  },
  // Enable output standalone for Docker deployment
  output: 'standalone',
};

export default nextConfig;