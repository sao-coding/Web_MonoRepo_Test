import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/AI_City/tts',
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

export default nextConfig
