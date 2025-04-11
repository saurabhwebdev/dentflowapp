/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable certain linting features for deployment speed
  eslint: {
    // Don't run ESLint during builds
    ignoreDuringBuilds: true,
  },
  // Don't run TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Set proper image domains if you're using next/image
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true, // For static exports if needed
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Improve build speeds on Vercel
  swcMinify: true,
  // Disable source maps in production
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
