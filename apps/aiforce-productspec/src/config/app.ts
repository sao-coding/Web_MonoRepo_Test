import { getAppConfig } from '@msi/config/env'

const config = getAppConfig()

const AppConfig = {
  appId: 'ai_6',
  appApiUrl:
    process.env.NODE_ENV === 'development'
      ? 'https://api.msi.com.tw:7475/api'
      : 'https://api.msi.com.tw:7475/api',
  websocketUrl:
    process.env.NODE_ENV === 'development'
      ? 'wss://km_support.msi.com.tw:7475/api/ws'
      : 'wss://km_support.msi.com.tw:7475/api/ws',
  serviceApiUrl: config.NEXT_PUBLIC_NIM_SERVICE_API_URL || 'https://api.msi.com.tw:7475',
  model: 'Qwen/Qwen2-VL-72B-Instruct-AWQ'
}
export default AppConfig
