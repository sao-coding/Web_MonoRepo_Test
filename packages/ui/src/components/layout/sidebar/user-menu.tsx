'use client'

import { LogOutIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@msi/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@msi/ui/components/dropdown-menu'
import { useAuth } from '@msi/hooks'

const UserMenu = () => {
  const { user, logout, status } = useAuth()

  // 使用瀏覽器相容的 MD5 實現
  const md5 = (str: string): string => {
    // 簡單的雜湊函數替代方案，或者可以使用 crypto-js 等第三方庫
    let hash = 0
    const cleanStr = str.toLowerCase().trim()
    for (let i = 0; i < cleanStr.length; i++) {
      const char = cleanStr.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 轉換為 32 位整數
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  // 在初始載入時顯示佔位符
  if (status === 'initializing' || status === 'loading') {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
  }

  return (
    <div className="flex items-center gap-2">
      {user
        ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://www.gravatar.com/avatar/${md5(user.email ?? '')}?d=identicon`}
                    />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.userId}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2"
                      onClick={async () => {
                        // console.log('logout')
                        const status = logout()
                        if (status) {
                          toast.success('登出成功')
                          window.location.href = process.env.NEXT_PUBLIC_BASE_PATH_URL as string
                        }
                        else {
                          toast.error('登出失敗，請稍後再試')
                        }
                      }}
                    >
                      <LogOutIcon className="h-4 w-4" />
                      <span>登出</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          )
        : (
            <Link href="/login" className="flex h-10 items-center gap-2">
              <UserIcon />
              <span>登入</span>
            </Link>
          )}
    </div>
  )
}

export default UserMenu
