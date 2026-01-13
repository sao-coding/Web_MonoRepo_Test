import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/AI_City/img2text',
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

export default nextConfig
