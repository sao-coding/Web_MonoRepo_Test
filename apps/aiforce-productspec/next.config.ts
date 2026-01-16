import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/AI_City/ProductSpec',
  assetPrefix: '/AI_City/ProductSpec',
  output: 'standalone', // Docker 部署需要
  transpilePackages: ['@msi/ui', '@msi/auth', '@msi/config'],
  eslint: {
    // 完全跳過建置時的 ESLint 檢查
    ignoreDuringBuilds: true,
    // 指定空的 ESLint 目錄（等同於完全停用）
    dirs: []
  },
  typescript: {
    // 保留型別檢查
    ignoreBuildErrors: false
  }
}

export default nextConfig
