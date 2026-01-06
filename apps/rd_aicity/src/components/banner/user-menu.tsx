'use client'

import { useAuth } from '@msi/auth/src/provider'
import { getAppConfig } from '@msi/config/env'
import { LogOutIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const UserMenu = () => {
  const { user, logout, status } = useAuth()
  const config = useMemo(() => getAppConfig(), [])

  // 使用瀏覽器相容的 MD5 實現
  // const md5 = (str: string): string => {
  //   // 簡單的雜湊函數替代方案，或者可以使用 crypto-js 等第三方庫
  //   let hash = 0
  //   const cleanStr = str.toLowerCase().trim()
  //   for (let i = 0; i < cleanStr.length; i++) {
  //     const char = cleanStr.charCodeAt(i)
  //     hash = ((hash << 5) - hash) + char
  //     hash = hash & hash // 轉換為 32 位整數
  //   }
  //   return Math.abs(hash).toString(16).padStart(8, '0')
  // }

  // 在初始載入時顯示佔位符
  if (status === 'initializing' || status === 'loading') {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
  }

  return (
    <div className="flex items-center gap-2">
      {user
        ? (
            <Button
              variant="outline"
              className="rounded-4xl px-6"
              title={`${user.userId} ${user.name}`}
              onClick={async () => {
                // console.log('logout')
                const status = logout()
                if (status) {
                  toast.success('登出成功')
                  window.location.href = config.NEXT_PUBLIC_BASE_PATH_URL || '/'
                }
                else {
                  toast.error('登出失敗，請稍後再試')
                }
              }}
            >
              <span>登出</span>
            </Button>
          )
        : (
            <Button
              className="rounded-4xl px-6"
              onClick={() => window.location.href = '/login'}
            >
              <span>登入</span>
            </Button>
          )}
    </div>
  )
}

export default UserMenu
