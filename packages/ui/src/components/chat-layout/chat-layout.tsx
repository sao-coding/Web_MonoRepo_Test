'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { SidebarInset, SidebarProvider } from '../sidebar'

export interface ChatLayoutProps {
  /** 左側 Sidebar 元件 */
  leftSidebar: React.ReactNode
  /** Header 元件 */
  header: React.ReactNode
  /** 主要內容區 */
  children: React.ReactNode
  /** 右側 Sidebar 元件 (可選) - 需要自己的 SidebarProvider 包裹 */
  rightSidebar?: React.ReactNode
  /** 預設是否展開左側 sidebar */
  defaultOpen?: boolean
  /** 自訂 className */
  className?: string
}

/**
 * ChatLayout 元件
 *
 * 聊天頁面的整體佈局元件，管理左右 sidebar 和主內容區的佈局
 * 左側 sidebar 使用主 SidebarProvider，右側 sidebar 需要獨立的 SidebarProvider
 *
 * 佈局結構：
 * ┌──────────────────────────────────────────────────────────┐
 * │ SidebarProvider                                           │
 * │ ┌─────────┬────────────────────────────┬────────────────┐ │
 * │ │ Left    │ SidebarInset               │ Right          │ │
 * │ │ Sidebar │ ┌────────────────────────┐ │ Sidebar        │ │
 * │ │         │ │ Header                 │ │ (獨立Provider) │ │
 * │ │         │ ├────────────────────────┤ │                │ │
 * │ │         │ │ Main Content           │ │                │ │
 * │ │         │ │ (children)             │ │                │ │
 * │ │         │ └────────────────────────┘ │                │ │
 * │ └─────────┴────────────────────────────┴────────────────┘ │
 * └──────────────────────────────────────────────────────────┘
 */
export function ChatLayout({
  leftSidebar,
  header,
  children,
  rightSidebar,
  defaultOpen = true,
  className
}: ChatLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} className={cn('flex h-screen w-full overflow-hidden', className)}>
      {/* 左側 Sidebar */}
      {leftSidebar}

      {/* 中間主內容區 (header + content) */}
      <SidebarInset className='relative z-20 flex h-full min-w-0 flex-1 flex-col overflow-hidden'>
        {/* 頂部 Header - 只在主內容區上方 */}
        {header}

        {/* 主內容區 */}
        <main className='flex h-full min-w-0 flex-1 flex-col overflow-hidden'>
          {children}
        </main>
      </SidebarInset>

      {/* 右側 Sidebar - 與 SidebarInset 同層級 */}
      {rightSidebar}
    </SidebarProvider>
  )
}

export default ChatLayout
