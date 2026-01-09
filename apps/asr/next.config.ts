import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/AI_City/asr',
  assetPrefix: '/AI_City/asr',
  output: 'standalone', // Docker 部署需要
  transpilePackages: ['@msi/ui', '@msi/auth', '@msi/config'],
  eslint: {
    ignoreDuringBuilds: true,
    dirs: []
  },
  typescript: {
    ignoreBuildErrors: false
  }
}

export default nextConfig
