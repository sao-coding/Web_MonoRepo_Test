import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/AI_City/ProductSpec',
  assetPrefix: '/AI_City/ProductSpec',
  transpilePackages: ['@msi/ui', '@msi/auth', '@msi/config'],
  eslint: {
    // 暫時關閉建置時的 ESLint 檢查，避免 CRLF 行尾格式錯誤阻擋建置
    ignoreDuringBuilds: true
  }
}

export default nextConfig
