// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['wellness-360-client.onrender.com'],
    // Add additional security for remote images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wellness-360-client.onrender.com',
        pathname: '/**',
      },
    ],
    // Enable image optimization for imported images
    disableStaticImages: false,
  },
  // Enable output standalone for Docker deployment
  output: 'standalone',
  
  // Add proper MIME type handling for static assets
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Specific headers for video files
        source: '/videos/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ];
  },
};

export default nextConfig;