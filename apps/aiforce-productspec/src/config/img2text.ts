import { getAppConfig } from '@msi/config/env'

const config = getAppConfig()

export const AppConfig = {
  appId: 'ai_2',
  appApiUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000/api'
      : 'http://10.16.20.156:7474/api',
  serviceApiUrl: config.NEXT_PUBLIC_NIM_SERVICE_API_URL || 'https://api.msi.com.tw'
}
