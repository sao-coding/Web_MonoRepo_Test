'use client'

import { getAppConfig } from '@msi/config'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

// 初始化 PostHog（只執行一次）
let isInitialized = false

function initPostHog() {
  if (isInitialized) return

  if (typeof window === 'undefined') return

  const config = getAppConfig()
  const key = config.NEXT_PUBLIC_POSTHOG_KEY
  const host = config.NEXT_PUBLIC_POSTHOG_HOST

  if (key && host) {
    posthog.init(key, {
      api_host: host,
      person_profiles: 'always',
      capture_pageview: false,
      debug: true,
      loaded: (ph) => {
        // PostHog 載入完成後的 callback
        console.log('[PostHog] Initialized successfully')
        console.log('[PostHog] API Host:', host)
        console.log('[PostHog] Project API Key:', key.substring(0, 10) + '...')
      }
    })
    isInitialized = true

    // 將 posthog 暴露到 window 上，方便在 Console 中測試
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).posthog = posthog
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    initPostHog()
    setMounted(true)
  }, [])

  // 確保在客戶端渲染
  if (!mounted) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// Re-export usePostHog for convenience
export { usePostHog }
