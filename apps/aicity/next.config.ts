import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  basePath: '/AI_City',
  transpilePackages: ['@msi/config', '@msi/ui', '@msi/auth', '@msi/i18n'],
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

export default withNextIntl(nextConfig)
