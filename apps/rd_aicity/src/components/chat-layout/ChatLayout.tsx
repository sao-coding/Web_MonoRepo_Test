'use client'

import { SidebarInset, SidebarProvider } from '@msi/ui/components/sidebar'
import { cn } from '@msi/ui/lib/utils'
import React from 'react'

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
  className,
}: ChatLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} className={cn('flex h-screen w-full overflow-hidden', className)}>
      {/* 左側 Sidebar */}
      {leftSidebar}

      {/* 中間主內容區 (header + content) */}
      <SidebarInset className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative z-20">
        {/* 頂部 Header - 只在主內容區上方 */}
        {header}

        {/* 主內容區 */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {children}
        </main>
      </SidebarInset>

      {/* 右側 Sidebar - 與 SidebarInset 同層級 */}
      {rightSidebar}
    </SidebarProvider>
  )
}

export default ChatLayout
