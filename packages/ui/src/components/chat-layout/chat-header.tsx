'use client'

import { LogOutIcon } from 'lucide-react'
import React from 'react'

import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'
import { Button } from '../button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../dropdown-menu'

export interface ChatHeaderProps {
  /** 使用者名稱 */
  userName?: string
  /** 使用者工號 */
  userId?: string
  /** 使用者頭像 URL */
  userAvatarUrl?: string
  /** 登出點擊回調 */
  onLogout?: () => void
  /** 左側額外內容 (如模型選擇) */
  leftContent?: React.ReactNode
  /** 右側額外內容 (在用戶頭像之前) */
  rightContent?: React.ReactNode
  /** 自訂 className */
  className?: string
}

/**
 * ChatHeader 元件
 *
 * 頂部標題列，包含 sidebar 觸發按鈕、自訂內容和用戶選單
 * 用於聊天頁面的統一 header 佈局
 *
 * @example
 * ```tsx
 * <ChatHeader
 *   userName="John"
 *   leftContent={<ModelSelector />}
 *   onLogout={() => signOut()}
 * />
 * ```
 */
export function ChatHeader({
  userName = '使用者',
  userId,
  userAvatarUrl = 'https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/user.png',
  onLogout,
  leftContent,
  rightContent,
  className
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between gap-2 bg-background px-4',
        className
      )}
    >
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        {/* 左側自訂內容 */}
        {leftContent}
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        {/* 右側自訂內容 */}
        {rightContent}

        {/* 用戶頭像選單 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <Avatar className='size-8'>
                <AvatarImage src={userAvatarUrl} />
                <AvatarFallback>{userName.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel className='rounded-sm hover:bg-accent'>
              <div className='flex items-center gap-2'>
                <Avatar>
                  <AvatarImage src={userAvatarUrl} />
                  <AvatarFallback>{userName.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='font-medium'>{userName}</h3>
                  {userId && <p className='text-sm text-muted-foreground'>{userId}</p>}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOutIcon className='mr-2 size-4' />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default ChatHeader
