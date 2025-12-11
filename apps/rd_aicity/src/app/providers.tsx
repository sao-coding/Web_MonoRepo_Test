'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import { logCustomParamsConfig } from '@/config/log'
import { useAuth } from '@/hooks/use-auth'

/**
 * 根據 URL 和設定，尋找第一個匹配的自定義日誌參數。
 * @param url - 要測試的 URL。
 * @param configs - 日誌設定陣列。
 * @returns 一個包含自定義參數的物件，如果沒有匹配項則為空物件。
 */
const getCustomLogParams = (
  url: string,
  configs: typeof logCustomParamsConfig,
): Record<string, string> => {
  const matchedConfig = configs.find(config => config.pattern.test(url))

  if (matchedConfig) {
    return { [matchedConfig.param]: matchedConfig.name }
  }

  return {}
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient())
  const pathname = usePathname()
  const router = useRouter()
  const { user, status, isAuthenticated, logout } = useAuth()

  // 認證檢查邏輯
  React.useEffect(() => {
    const checkAuthentication = () => {
      const isLoginPage = pathname === '/login'

      // 等待認證初始化完成
      if (status === 'initializing')
        return

      // 登入頁面處理
      if (isLoginPage) {
        if (isAuthenticated) {
          router.replace('/')
        }
        return
      }

      // 其他頁面需要驗證
      if (!isAuthenticated) {
        // 如果認證失敗，確保清除 token 並導向登入頁
        if (status === 'error') {
          logout()
        }
        router.replace('/login')
      }
    }

    checkAuthentication()
  }, [pathname, router, status, isAuthenticated, logout])

  React.useEffect(() => {
    // 避免在認證狀態不穩定時執行
    if (status === 'initializing' || status === 'loading')
      return

    const writeLog = async () => {
      const url = `${process.env.NEXT_PUBLIC_BASE_PATH_URL || ''}${pathname}`
      const customParams = getCustomLogParams(url, logCustomParamsConfig)

      const logData = {
        webSystem: 'rdraid5',
        subSystem: pathname.split('/')[1] || 'AI_City',
        title: document.title,
        url,
        ...customParams,
      }

      await fetch(`${process.env.NEXT_PUBLIC_LOGIN_API_URL}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
        body: JSON.stringify(logData),
      })
    }
    writeLog()
  }, [pathname, user, status])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default Providers
