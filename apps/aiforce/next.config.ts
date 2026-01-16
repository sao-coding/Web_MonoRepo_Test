import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// 根據環境動態設定 rewrite 目標
const getRewriteHost = () => {
  // 生產環境使用 nginx proxy，不需要 rewrites
  // 開發環境使用 localhost
  const isDev = process.env.NODE_ENV === 'development'
  return isDev ? 'http://localhost' : 'http://127.0.0.1'
}

// 端口設定 (開發環境使用不同端口避免衝突)
const PORTS = {
  productSpec: process.env.NODE_ENV === 'development' ? 3002 : 3002,
  asr: process.env.NODE_ENV === 'development' ? 3004 : 3003,
}

const nextConfig: NextConfig = {
  basePath: '/aiforce',
  output: 'standalone', // Docker 部署需要
  transpilePackages: ['@msi/config', '@msi/ui', '@msi/auth', '@msi/i18n'],
  async rewrites() {
    const host = getRewriteHost()
    return [
      {
        source: '/productspec',
        destination: `${host}:${PORTS.productSpec}/aiforce/productspec`,
      },
      {
        source: '/productspec/:path*',
        destination: `${host}:${PORTS.productSpec}/aiforce/productspec/:path*`,
      },
      {
        source: '/asr',
        destination: `${host}:${PORTS.asr}/aiforce/asr`,
      },
      {
        source: '/asr/:path*',
        destination: `${host}:${PORTS.asr}/aiforce/asr/:path*`,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
