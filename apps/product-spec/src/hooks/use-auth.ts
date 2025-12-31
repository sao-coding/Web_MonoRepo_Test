'use client'

import { getAppConfig } from '@msi/config/env'
import Cookies from 'js-cookie'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface User {
  userId: string
  userName: string
  name: string
  email: string
  deptId: string
  domain: string
  system: string
  jti: string
  iat: number
  exp: number
  iss: string
  aud: string
}

interface LoginCredentials {
  userName: string
  password: string
}

type AuthStatus = 'initializing' | 'loading' | 'success' | 'error' | null

interface UseAuthReturn {
  user: User | null
  status: AuthStatus
  error: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => boolean
  refreshUser: () => void
}

// JWT payload 解碼函數
const decodeJWT = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload) as User
  } catch (error) {
    console.error('JWT 解碼失敗:', error)
    return null
  }
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [error, setError] = useState<string | null>(null)

  // 快取 token 和解析結果
  const token = useMemo(() => Cookies.get('accessToken') || null, [])
  const parsedUser = useMemo(() => {
    if (!token) return null
    return decodeJWT(token)
  }, [token])

  // 使用 useCallback 優化函數引用穩定性
  const loadUser = useCallback(() => {
    if (token && parsedUser) {
      // 檢查 token 是否過期
      const currentTime = Date.now() / 1000
      if (parsedUser.exp && parsedUser.exp > currentTime) {
        setUser(parsedUser)
        setStatus('success')
      } else {
        // Token 已過期，清除
        Cookies.remove('accessToken', { domain: window.location.hostname })
        setUser(null)
        setStatus(null)
      }
    } else if (token && !parsedUser) {
      setStatus('error')
      setError('Token 格式無效')
    } else {
      setStatus(null)
    }
  }, [token, parsedUser])

  // 登入函數 - 保留延遲，使用 useCallback 優化
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      try {
        setStatus('loading')
        setError(null)

        const res = await fetch(`${getAppConfig().NEXT_PUBLIC_LOGIN_API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        })

        if (res.ok) {
          const data = await res.json()

          // 儲存 token - 移除額外屬性
          Cookies.set('accessToken', data.accessToken, {
            expires: 100 * 365 * 24 * 60 * 60, // 100年
            domain: getAppConfig().NEXT_PUBLIC_COOKIE_DOMAIN
          })

          // 解析並設定用戶資訊
          const payload = decodeJWT(data.accessToken)
          if (payload) {
            setUser(payload)
            // 延遲一秒再設定狀態
            setTimeout(() => {
              setStatus('success')
            }, 1000)
            return { success: true }
          } else {
            const errorMessage = 'Token 解析失敗'
            setError(errorMessage)
            setStatus('error')
            return { success: false, error: errorMessage }
          }
        } else {
          const errorData = await res.json()
          console.error('登入失敗:', errorData)
          const errorMessage = errorData.message || '登入失敗，請檢查您的帳號和密碼'
          setError(errorMessage)
          setStatus('error')
          return { success: false, error: errorMessage }
        }
      } catch (error) {
        console.error('登入錯誤:', error)
        const errorMessage = '網路連線錯誤，請稍後再試'
        setError(errorMessage)
        setStatus('error')
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  // 登出函數 - 刪除所有 cookies，使用 useCallback 優化
  const logout = useCallback((): boolean => {
    try {
      // 刪除所有Cookie
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, { domain: getAppConfig().NEXT_PUBLIC_COOKIE_DOMAIN })
      })
      setUser(null)
      setStatus(null)
      setError(null)
      return true
    } catch (error) {
      console.error('登出錯誤:', error)
      return false
    }
  }, [])

  // 刷新用戶資訊
  const refreshUser = useCallback(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // 使用 useMemo 快取計算結果
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
    refreshUser
  }
}
