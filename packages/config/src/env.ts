export interface AppConfig {
  NEXT_PUBLIC_RD_SITE_URL: string
  NEXT_PUBLIC_LOGIN_API_URL: string
  NEXT_PUBLIC_BASE_PATH_URL: string
  NEXT_PUBLIC_COOKIE_DOMAIN: string
  NEXT_PUBLIC_NIM_SERVICE_API_URL: string
  NEXT_PUBLIC_PATENT_SERVICE_API_URL: string
  NEXT_PUBLIC_AI_API_URL: string
  NEXT_PUBLIC_VGA_AI_API_URL: string
  NEXT_PUBLIC_AIforce_API_URL: string
  // 其他所有您需要的變數
}

// --- 1. 開發測試配置 (對應 localhost / 10.16.20.11)
const DevConfig: AppConfig = {
  NEXT_PUBLIC_RD_SITE_URL: 'http://10.16.20.11:8012',
  NEXT_PUBLIC_LOGIN_API_URL: 'http://10.16.20.11:8083', // 注意：這裡使用了驗證測試的網址
  NEXT_PUBLIC_BASE_PATH_URL: '/AI_City',
  NEXT_PUBLIC_COOKIE_DOMAIN: 'localhost', // 地端
  NEXT_PUBLIC_NIM_SERVICE_API_URL: 'http://10.16.20.152:8090', // 開發測試
  NEXT_PUBLIC_PATENT_SERVICE_API_URL: 'http://10.16.20.11:8081',
  NEXT_PUBLIC_AI_API_URL: 'http://10.16.20.152:8086',
  NEXT_PUBLIC_VGA_AI_API_URL: 'http://10.16.20.152:8102',
  NEXT_PUBLIC_AIforce_API_URL: 'http://10.16.20.11:8085'
}

// --- 2. 驗證測試配置 (對應 rdraid5_uat.msi.com / 10.16.20.12)
const UatConfig: AppConfig = {
  NEXT_PUBLIC_RD_SITE_URL: 'https://rdraid5_uat.msi.com',
  NEXT_PUBLIC_LOGIN_API_URL: 'https://rdraid5_uat.msi.com:8082',
  NEXT_PUBLIC_BASE_PATH_URL: '/AI_City',
  NEXT_PUBLIC_COOKIE_DOMAIN: '.msi.com', // 驗證測試
  NEXT_PUBLIC_NIM_SERVICE_API_URL: 'https://dadaival.msi.com:7401',
  NEXT_PUBLIC_PATENT_SERVICE_API_URL: 'https://rdraid5_uat.msi.com:8084',
  NEXT_PUBLIC_AI_API_URL: 'https://dadaival.msi.com:7402',
  NEXT_PUBLIC_VGA_AI_API_URL: 'https://dadaival.msi.com:7478',
  NEXT_PUBLIC_AIforce_API_URL: 'https://rdraid5_uat.msi.com:8085'
}

// --- 3. 正式機配置 (其他網址)
const ProdConfig: AppConfig = {
  NEXT_PUBLIC_RD_SITE_URL: 'https://rdraid5.msi.com.tw',
  NEXT_PUBLIC_LOGIN_API_URL: 'https://rdraid5.msi.com.tw:8082',
  NEXT_PUBLIC_BASE_PATH_URL: '/AI_City',
  NEXT_PUBLIC_COOKIE_DOMAIN: '.msi.com.tw', // 正式機
  NEXT_PUBLIC_NIM_SERVICE_API_URL: 'https://api.msi.com.tw',
  NEXT_PUBLIC_PATENT_SERVICE_API_URL: 'https://rdraid5.msi.com.tw:8084',
  NEXT_PUBLIC_AI_API_URL: 'https://km.msi.com.tw:7402',
  NEXT_PUBLIC_VGA_AI_API_URL: 'https://km.msi.com.tw:7478',
  NEXT_PUBLIC_AIforce_API_URL: 'https://rdraid5.msi.com.tw:8085'
}

/**
 * 根據當前的主機名稱 (Hostname) 取得對應的環境配置
 * 注意：由於部分變數（如 DATABASE_URL, JWT_SECRET_KEY）包含敏感資訊，
 * 建議只在 Server-Side (getStaticProps/getServerSideProps/API Routes) 呼叫此函式。
 */
export function getAppConfig(hostname?: string): AppConfig {
  const currentHostname = hostname || (typeof window !== 'undefined' ? window.location.hostname : '')

  // 1. 開發測試判斷 (localhost, 10.16.20.11, 或 10.16.20.12 的 IP 但用來作為開發機)
  // 如果是開發環境且沒有 hostname (例如 server-side)，預設使用 DevConfig
  if (currentHostname === 'localhost' || currentHostname.includes('10.16.20.11') || (process.env.NODE_ENV === 'development' && !currentHostname)) {
    return DevConfig
  }

  // 2. 驗證測試判斷 (rdraid5_uat.msi.com, 10.16.20.12)
  if (currentHostname.includes('rdraid5_uat.msi.com') || currentHostname.includes('10.16.20.12')) {
    return UatConfig
  }

  // 3. 其他情況 (正式機)
  return ProdConfig
}
