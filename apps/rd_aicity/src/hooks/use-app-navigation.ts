/**
 * 應用導航 Hook
 * 處理內部/外部連結導航邏輯
 */
'use client'

import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import { useCallback } from 'react'
import { redirectToForum } from '@/lib/forum-redirect'

interface UseAppNavigationReturn {
  navigateToApp: (sysUrl: string | null, appIdentifier?: string) => void
  handleAuthRedirect: (targetUrl: string) => Promise<void>
  isInternalLink: (url: string) => boolean
  getRouteByAppId: (appId: string) => string | null
}

/**
 * 應用程式路由映射表
 * 用於 sysUrl 為空時的 fallback 導航
 * Key 支援英文和中文 sysName
 */
const APP_ROUTE_MAP: Record<string, string> = {
  // 已分離為獨立專案 - 英文 key
  'product_spec': '/AI_City/ProductSpec',
  'productspec': '/AI_City/ProductSpec',
  'asr': '/AI_City/asr',
  'translate': '/AI_City/translate',
  'tts': '/AI_City/tts',
  'vga': '/AI_City/vga',
  'patents': '/AI_City/patents',
  'pcb': '/AI_City/pcb',
  'img2text': '/AI_City/img2text',

  // 中文 sysName 對應 (根據 API 回傳)
  '翻譯助手': '/AI_City/translate',
  '語音轉文字': '/AI_City/asr',
  '規格書助手': '/AI_City/ProductSpec',
  '知識管理助手': '/AI_City/km', // 需要確認路徑
  '線路圖比對助手': '/AI_City/trackcad',
  '全球專利助手': '/AI_City/patents',
  'GPU競品分析助手': '/AI_City/vga',
  '圖意探險家': '/AI_City/img2text',
  '會議助理': '/AI_City/meeting',
  '繪圖助手': '/AI_City/draw',
  '文字轉語音': '/AI_City/tts',

  // AI 論壇 - 使用特殊 Form POST 跳轉
  'ai_forum': '__FORUM_REDIRECT__',
  'aiforum': '__FORUM_REDIRECT__',
  'AI 論壇': '__FORUM_REDIRECT__',
  'ai論壇': '__FORUM_REDIRECT__',
}

/**
 * 內部路由模式
 */
const INTERNAL_ROUTE_PATTERNS = [
  '/AI_City',
  '/ProductSpec',
  '/asr',
  '/translate',
  '/tts',
  '/vga',
  '/patents',
  '/pcb',
  '/img2text',
]

export function useAppNavigation(): UseAppNavigationReturn {
  const { isAuthenticated, user } = useAuth()

  /**
   * 判斷是否為內部連結
   * 內部連結：以 /AI_City 或其他內部路由開頭
   * 外部連結：完整 URL (http://, https://)
   */
  const isInternalLink = useCallback((url: string): boolean => {
    if (!url)
      return false

    // 相對路徑視為內部連結
    if (url.startsWith('/')) {
      return true
    }

    // 檢查是否包含當前 host 的 URL（也視為內部）
    try {
      const urlObj = new URL(url)
      const currentHost = typeof window !== 'undefined' ? window.location.host : ''

      // 如果是當前 host，視為內部連結
      if (urlObj.host === currentHost) {
        return true
      }

      // 檢查 pathname 是否匹配內部路由
      const pathname = urlObj.pathname
      return INTERNAL_ROUTE_PATTERNS.some(pattern =>
        pathname.startsWith(pattern),
      )
    }
    catch {
      // 無法解析的 URL，視為內部連結
      return true
    }
  }, [])

  /**
   * 處理需要認證的外部重導向
   * 呼叫 auth redirect API 取得 token 並開啟新視窗
   */
  const handleAuthRedirect = useCallback(async (targetUrl: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      console.warn('用戶未登入，無法進行認證重導向')
      return
    }

    try {
      const basePath = getAppConfig().NEXT_PUBLIC_BASE_PATH_URL || '/AI_City'
      const response = await fetch(`${basePath}/api/apps/auth/redirect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ targetUrl }),
      })

      if (!response.ok) {
        throw new Error(`redirect API 呼叫失敗: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success || !data.redirectUrl) {
        throw new Error('redirect URL 取得失敗')
      }

      window.open(data.redirectUrl, '_blank')
    }
    catch (e) {
      console.error('開啟應用程式失敗:', e)
    }
  }, [isAuthenticated, user])

  /**
   * 根據 app ID 取得路由
   */
  const getRouteByAppId = useCallback((appId: string): string | null => {
    // 正規化 appId：轉小寫，移除空格和特殊字符，轉為 underscore
    const normalizeId = (id: string): string =>
      id.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '')

    const normalizedAppId = normalizeId(appId)

    console.warn(`尋找 fallback 路由: appId="${appId}" -> normalized="${normalizedAppId}"`)
    console.warn('可用的路由映射:', Object.keys(APP_ROUTE_MAP))

    // 嘗試直接匹配
    if (APP_ROUTE_MAP[appId]) {
      return APP_ROUTE_MAP[appId]
    }

    // 嘗試正規化後匹配
    if (APP_ROUTE_MAP[normalizedAppId]) {
      return APP_ROUTE_MAP[normalizedAppId]
    }

    // 嘗試模糊匹配：appId 包含在 key 中，或 key 包含在 appId 中
    for (const [key, route] of Object.entries(APP_ROUTE_MAP)) {
      const normalizedKey = normalizeId(key)
      if (normalizedAppId.includes(normalizedKey) || normalizedKey.includes(normalizedAppId)) {
        console.warn(`模糊匹配成功: "${normalizedAppId}" <-> "${normalizedKey}"`)
        return route
      }
    }

    console.warn(`找不到匹配的路由: ${appId}`)
    return null
  }, [])

  /**
   * 導航到應用程式
   * 根據連結類型決定導航方式
   * @param sysUrl - API 回傳的系統 URL (可為 null)
   * @param appIdentifier - 應用識別符 (用於 fallback)
   */
  const navigateToApp = useCallback((sysUrl: string | null, appIdentifier?: string): void => {
    // 如果 sysUrl 為空，使用 fallback
    if (!sysUrl) {
      if (appIdentifier) {
        const fallbackRoute = getRouteByAppId(appIdentifier)
        if (fallbackRoute) {
          // 特殊處理：AI 論壇
          if (fallbackRoute === '__FORUM_REDIRECT__') {
            const success = redirectToForum()
            if (!success) {
              console.error('AI 論壇跳轉失敗：認證資訊不足')
              // 可以選擇跳轉到登入頁或顯示錯誤提示
            }
            return
          }

          console.warn(`sysUrl 為空，使用 fallback 路由: ${fallbackRoute}`)
          window.location.href = fallbackRoute
          return
        }
      }
      console.warn('sysUrl 為空且無 fallback')
      return
    }

    // 判斷是否為內部路由
    const isInternal = isInternalLink(sysUrl)

    if (isInternal) {
      // 內部連結：提取 pathname 並導航
      let targetPath: string

      if (sysUrl.startsWith('http')) {
        // 完整 URL (例如 http://10.16.20.11:3001/AI_City/translate)
        // 提取 pathname 部分
        try {
          const url = new URL(sysUrl)
          targetPath = url.pathname
        }
        catch {
          targetPath = sysUrl
        }
      }
      else {
        targetPath = sysUrl
      }

      // 確保有 /AI_City 前綴
      if (!targetPath.startsWith('/AI_City')) {
        targetPath = `/AI_City${targetPath.startsWith('/') ? '' : '/'}${targetPath}`
      }

      window.location.href = targetPath
    }
    else {
      // 外部連結：使用 auth redirect
      handleAuthRedirect(sysUrl)
    }
  }, [isInternalLink, handleAuthRedirect, getRouteByAppId])

  return {
    navigateToApp,
    handleAuthRedirect,
    isInternalLink,
    getRouteByAppId,
  }
}
