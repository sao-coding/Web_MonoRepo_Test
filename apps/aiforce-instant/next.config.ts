import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/AI_City/instant',
  assetPrefix: '/AI_City/instant',
  // output: 'standalone', // Docker 部署需要
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
