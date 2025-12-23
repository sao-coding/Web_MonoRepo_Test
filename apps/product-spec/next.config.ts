import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/AI_City/ProductSpec',
  assetPrefix: '/AI_City/ProductSpec',
  transpilePackages: ['@msi/ui', '@msi/auth', '@msi/config'],
}

export default nextConfig
