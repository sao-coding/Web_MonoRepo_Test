import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/AI_City',
  transpilePackages: ['@msi/config', '@msi/ui', '@msi/auth'],
  async rewrites() {
    return [
      {
        source: '/ProductSpec',
        destination: 'http://localhost:3002/AI_City/ProductSpec',
      },
      {
        source: '/ProductSpec/:path*',
        destination: 'http://localhost:3002/AI_City/ProductSpec/:path*',
      },
    ]
  },
}

export default nextConfig
