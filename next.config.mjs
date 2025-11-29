/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Allow ngrok dev origin
  allowedDevOrigins: ['https://haydee-sonantal-anthropophagously.ngrok-free.dev'],

  // Skip trailing slash redirect for better compatibility
  skipTrailingSlashRedirect: true,

  // Disable aggressive caching in development
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config) => {
      config.cache = false
      return config
    },
  }),
}

export default nextConfig
