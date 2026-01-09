'use client'

import Cookies from 'js-cookie'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * User: JWT payload 的型別，依後端回傳的 payload 調整
 */
export interface User {
  userId: string
  userName: string
  name: string
  email?: string
  deptId?: string
  domain?: string
  system?: string
  jti?: string
  iat?: number
  exp?: number
  iss?: string
  aud?: string | string[]
}

export interface LoginCredentials {
  userName: string
  password: string
  system?: string
  domain?: string
}

export interface LoginResponse {
  userId: string
  userName: string
  name: string
  deptId: string
  domain: string
  message: string
  accessToken: string
  chatbotToken: string
}

export type AuthStatus = 'initializing' | 'loading' | 'success' | 'error' | 'idle'

export interface UseAuthReturn {
  user: User | null
  status: AuthStatus
  error: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => boolean
  refreshUser: () => void
  getChatbotToken: () => string | null
}

/**
 * 安全一點的 JWT 解碼：先檢查格式再 decode，失敗回傳 null
 */
const decodeJWT = (token: string): User | null => {
  try {
    if (!token || typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64Url = parts[1] as string
    // 補齊 base64 padding
    const padded = base64Url.padEnd(base64Url.length + (4 - (base64Url.length % 4)) % 4, '=')
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(''),
    )
    return JSON.parse(jsonPayload) as User
  } catch (err) {
    // keep debug log但不拋出
    // eslint-disable-next-line no-console
    console.error('JWT 解碼失敗:', err)
    return null
  }
}

/**
 * 讀取 cookie domain（若未設定 NEXT_PUBLIC_COOKIE_DOMAIN，則回傳 undefined）
 */
const getCookieDomain = () => {
  const d = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  return d && d.length > 0 ? d : undefined
}

export interface AuthConfig {
  loginApiUrl?: string
}

export const useAuth = (config?: AuthConfig): UseAuthReturn => {
  // Log React version to debug "Invalid hook call"
  // eslint-disable-next-line no-console
  console.log('[@msi/auth] React version:', React.version)

  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [error, setError] = useState<string | null>(null)

  // 讀取 accessToken 每次需要最新值時直接從 Cookies 取得，避免 useMemo 導致 stale token
  const readToken = useCallback(() => Cookies.get('accessToken') || null, [])

  // 讀取 chatbotToken
  const getChatbotToken = useCallback(() => Cookies.get('chatbotToken') || null, [])

  const loadUser = useCallback(() => {
    const token = readToken()
    if (!token) {
      setUser(null)
      setStatus('idle')
      return
    }

    const payload = decodeJWT(token)
    if (!payload) {
      setUser(null)
      setStatus('error')
      setError('Token 格式無效或解析失敗')
      return
    }

    const currentTime = Date.now() / 1000
    if (payload.exp && payload.exp > currentTime) {
      setUser(payload)
      setStatus('success')
      setError(null)
    } else {
      // token 過期，嘗試移除 cookie（同時嘗試有 domain / 無 domain）
      const domain = getCookieDomain()
      Cookies.remove('accessToken')
      Cookies.remove('chatbotToken')
      if (domain) {
        Cookies.remove('accessToken', { domain })
        Cookies.remove('chatbotToken', { domain })
      }
      setUser(null)
      setStatus('idle')
      setError(null)
    }
  }, [readToken])

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      try {
        setStatus('loading')
        setError(null)

        const apiBase = config?.loginApiUrl || process.env.NEXT_PUBLIC_LOGIN_API_URL
        if (!apiBase) {
          const msg = '未設定 NEXT_PUBLIC_LOGIN_API_URL'
          setError(msg)
          setStatus('error')
          return { success: false, error: msg }
        }

        // 新 API: POST /api/System/Login
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/System/Login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: credentials.userName,
            password: credentials.password,
            system: credentials.system || '',
            domain: credentials.domain || ''
          }),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          const errorMessage = (errorData && (errorData.message || errorData.error)) || '登入失敗'
          setError(errorMessage)
          setStatus('error')
          return { success: false, error: errorMessage }
        }

        const data: LoginResponse = await res.json()
        const token = data?.accessToken
        if (!token || typeof token !== 'string') {
          const msg = '伺服器未回傳有效的 accessToken'
          setError(msg)
          setStatus('error')
          return { success: false, error: msg }
        }

        // expires: 傳入天數 (js-cookie)
        const expiresDays = 36500 // 約 100 年（如需更短請調整）
        const domain = getCookieDomain()
        const cookieOptions: Record<string, unknown> = {
          expires: expiresDays,
          sameSite: 'lax',
        }
        if (domain) cookieOptions.domain = domain
        // 若在 https 下，啟用 secure
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') cookieOptions.secure = true

        // 儲存 accessToken
        Cookies.set('accessToken', token, cookieOptions)

        // 儲存 chatbotToken（如果有的話）
        if (data.chatbotToken) {
          Cookies.set('chatbotToken', data.chatbotToken, cookieOptions)
        }

        // 解析 token 並更新狀態
        const payload = decodeJWT(token)
        if (!payload) {
          // 如果 JWT 解析失敗，使用 API 回傳的資料建立 user
          const userFromResponse: User = {
            userId: data.userId,
            userName: data.userName,
            name: data.name,
            deptId: data.deptId,
            domain: data.domain
          }
          setUser(userFromResponse)
          setTimeout(() => setStatus('success'), 300)
          return { success: true }
        }

        setUser(payload)
        // 小幅延遲以便顯示 loading 動畫（如需要可刪除）
        setTimeout(() => setStatus('success'), 300)
        return { success: true }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('登入錯誤:', err)
        const msg = '網路連線錯誤，請稍後再試'
        setError(msg)
        setStatus('error')
        return { success: false, error: msg }
      }
    },
    [config?.loginApiUrl],
  )

  const logout = useCallback((): boolean => {
    try {
      const domain = getCookieDomain()
      // 嘗試移除可能存在的 cookie（含/不含 domain）
      Cookies.remove('accessToken')
      Cookies.remove('chatbotToken')
      if (domain) {
        Cookies.remove('accessToken', { domain })
        Cookies.remove('chatbotToken', { domain })
      }
      // 也嘗試移除其他 cookies
      Object.keys(Cookies.get()).forEach((name) => {
        Cookies.remove(name)
        if (domain) Cookies.remove(name, { domain })
      })
      setUser(null)
      setStatus('idle')
      setError(null)
      return true
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('登出錯誤:', err)
      return false
    }
  }, [])

  const refreshUser = useCallback(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    loadUser()
    // 若需要在跨頁面或其他 window 中同步，可監聽 storage event（cookie 無 storage event）
    // window.addEventListener('storage', loadUser)
    // return () => window.removeEventListener('storage', loadUser)
  }, [loadUser])

  const isAuthenticated = useMemo(() => {
    return !!user && status === 'success'
  }, [user, status])

  return {
    user,
    status,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    getChatbotToken,
  }
}
