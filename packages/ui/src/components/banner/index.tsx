'use client'

import { LogOutIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

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

export interface BannerProps {
  /** 使用者名稱 */
  userName?: string
  /** 使用者工號 */
  userId?: string
  /** 使用者頭像 URL */
  userAvatarUrl?: string
  /** 登出點擊回調 */
  onLogout?: () => void
  /** 標題 */
  title?: string
  /** MSI Logo URL */
  msiLogoUrl?: string
  /** AIforce Logo URL */
  aiforceLogoUrl?: string
  /** Logo URL (deprecated, 向下相容) */
  logoUrl?: string
  /** 首頁連結 */
  homeUrl?: string
  /** 中間額外內容 (如AI智能助手) */
  centerContent?: React.ReactNode
  /** 右側額外內容 (在用戶頭像之前) */
  rightContent?: React.ReactNode
  /** 自訂 className */
  className?: string
  /** 自訂標題 className */
  titleClassName?: string
}

export function Banner({
  userName = '使用者',
  userId,
  userAvatarUrl = 'https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/user.png',
  onLogout,
  title = 'AIforce',
  msiLogoUrl,
  aiforceLogoUrl,
  logoUrl,
  homeUrl = '/',
  centerContent,
  rightContent,
  className,
  titleClassName
}: BannerProps) {
  // 判斷是否使用雙 logo 模式
  const useDualLogo = msiLogoUrl && aiforceLogoUrl

  return (
    <div className='flex h-16 items-center justify-between border-b border-gray-300 px-4 md:px-6 dark:border-gray-700'>
      <Link
        href={homeUrl}
        className='flex cursor-pointer items-center gap-2 overflow-hidden transition-opacity hover:opacity-80'
      >
        {useDualLogo ? (
          // 雙 Logo 模式：MSI logo + 分隔線 + AIforce logo
          <div className='flex items-center gap-3'>
            <Image
              src={msiLogoUrl}
              alt='MSI'
              height={32}
              width={100}
              className={cn('object-contain dark:invert h-[32px] w-auto', className)}
              priority
              unoptimized
            />
            <div className='h-7 w-px bg-gray-400 dark:bg-gray-500' />
            <Image
              src={aiforceLogoUrl}
              alt='AIforce'
              height={32}
              width={180}
              className={cn('object-contain dark:invert h-[40px] w-auto', className)}
              priority
              unoptimized
            />
          </div>
        ) : logoUrl ? (
          // 單 Logo 模式 (向下相容)
          <Image
            src={logoUrl}
            alt={title}
            height={25}
            width={280}
            className={cn('object-contain dark:invert w-auto h-[25px]', className)}
            priority
            unoptimized
          />
        ) : null}
        <span
          className={cn(
            'truncate text-2xl font-bold text-black dark:text-white md:text-3xl',
            titleClassName
          )}
          style={{ fontFamily: '微軟正黑體' }}
        >
          {title}
        </span>
      </Link>
      {centerContent}
      <div className='flex items-center gap-4'>
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
    </div>
  )
}

export default Banner
