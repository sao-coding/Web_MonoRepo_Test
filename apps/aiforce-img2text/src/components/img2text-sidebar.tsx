'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@msi/ui/components/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
} from '@msi/ui/components/sidebar'
import { cn } from '@msi/ui/lib/utils'
import { ChevronDown, ImageIcon, Moon, PanelLeft, Sun } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import * as React from 'react'

interface HistoryItem {
  text: string
  imageUrl: string
}

interface Img2TextSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** Logo URL */
  logoUrl?: string
  /** 頁面標題 */
  title?: string
  /** 歷史紀錄列表 */
  history: HistoryItem[]
  /** 點擊歷史項目回調 */
  onHistoryItemClick: (item: HistoryItem) => void
  /** 首頁連結 */
  homeUrl?: string
}

export function Img2TextSidebar({
  logoUrl = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-City.png',
  title = '圖意探險家',
  history,
  onHistoryItemClick,
  homeUrl = '/',
  className,
  ...props
}: Img2TextSidebarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Sidebar
      collapsible='icon'
      className={cn(
        'h-full shrink-0',
        '[&_[data-sidebar=menu-button]]:overflow-hidden',
        '[&_[data-sidebar=menu-button]_span]:truncate',
        '[&_[data-sidebar=menu-button]_span]:block',
        '[&_[data-sidebar=menu-button]_span]:min-w-0',
        '[&_[data-sidebar=content]]:overflow-hidden',
        '[&_[data-sidebar=header]]:overflow-hidden',
        className
      )}
      style={{
        '--sidebar-width': '16rem',
        '--sidebar-width-icon': '56px'
      } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className='group/menu-item flex w-full items-center justify-between p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0'>
              {/* 展開時：顯示 Logo + Title */}
              <Link
                href={process.env.NEXT_PUBLIC_RD_SITE_URL ?? homeUrl}
                className='flex min-w-0 flex-1 items-center gap-2 group-data-[collapsible=icon]:hidden'
              >
                <Image
                  src={logoUrl}
                  alt={title}
                  className='size-7 shrink-0 rounded-full border border-gray-300 object-cover'
                  width={28}
                  height={28}
                  unoptimized
                />
                <span className='truncate text-sm font-semibold'>{title}</span>
              </Link>
              {/* 展開時：顯示 Collapse Button */}
              <SidebarTrigger className='size-6 shrink-0 group-data-[collapsible=icon]:hidden'>
                <PanelLeft />
              </SidebarTrigger>
              {/* 收合時：顯示 Logo 或 PanelLeft (hover時) */}
              <div className='relative mx-auto my-2 hidden size-8 shrink-0 group-data-[collapsible=icon]:flex'>
                {/* Logo - 預設顯示，hover時隱藏 */}
                <Image
                  src={logoUrl}
                  alt={title}
                  className='pointer-events-none absolute inset-0 m-auto size-7 rounded-full border border-gray-300 object-cover transition-opacity group-hover/menu-item:opacity-0'
                  width={28}
                  height={28}
                  unoptimized
                />
                {/* 按鈕 - 預設隱藏，hover時顯示 */}
                <SidebarTrigger className='z-10 size-8 shrink-0 p-0 opacity-0 transition-opacity group-hover/menu-item:opacity-100'>
                  <PanelLeft className='size-5' />
                </SidebarTrigger>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 說明文字 - 僅展開時顯示 */}
        <p className='text-muted-foreground px-4 text-sm group-data-[collapsible=icon]:hidden'>
          上傳圖片，AI 將識別圖片內容並生成相應的文字描述。
        </p>
      </SidebarHeader>

      <SidebarContent>
        {/* 分析紀錄區 */}
        <Collapsible defaultOpen className='group/collapsible group-data-[collapsible=icon]:hidden'>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className='flex w-full items-center gap-1.5'>
                <ChevronDown className='size-4 shrink-0 text-gray-400 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90 group-data-[state=open]/collapsible:rotate-0' />
                <span className='text-muted-foreground truncate text-xs font-medium'>分析紀錄</span>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down'>
              <SidebarGroupContent>
                <SidebarMenu>
                  {history.length > 0 ? (
                    history
                      .slice()
                      .reverse()
                      .map((item, index) => (
                        <SidebarMenuItem key={index} className='group/item relative min-w-0'>
                          <SidebarMenuButton
                            onClick={() => { onHistoryItemClick(item) }}
                            className='group-hover/item:bg-sidebar-accent w-full min-w-0 flex-col items-start gap-1 py-2'
                          >
                            <span className='flex w-full items-center justify-between'>
                              <span className='text-muted-foreground line-clamp-2 text-xs'>
                                {item.text.substring(0, 50)}...
                              </span>
                              <ImageIcon className='ml-2 size-4 shrink-0 text-blue-500' />
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                  ) : (
                    <div className='text-muted-foreground py-4 text-center text-sm'>
                      尚無分析紀錄
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      {/* Sidebar Footer with Theme Toggle */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark') }}>
              {theme === 'dark' ? <Sun className='size-4' /> : <Moon className='size-4' />}
              <span className='group-data-[collapsible=icon]:hidden'>
                {theme === 'dark' ? '淺色模式' : '深色模式'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* SidebarRail 提供收合後 hover 可展開的功能 */}
      <SidebarRail />
    </Sidebar>
  )
}

export default Img2TextSidebar
