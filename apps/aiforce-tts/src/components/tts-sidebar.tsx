'use client'

import { Button } from '@msi/ui/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@msi/ui/components/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@msi/ui/components/select'
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
import { ChevronDown, InfoIcon, Moon, PanelLeft, Sun, Volume2Icon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { toast } from 'sonner'

// TTS 語言配置
const ttsConfig = {
  default_language: 'zh-TW',
  languages: [
    { code: 'zh-TW', label: '中文（臺灣）' },
    { code: 'zh-CN', label: '中文（簡體）' },
    { code: 'en-US', label: '英文（美國）' },
    { code: 'en-GB', label: '英文（英國）' },
    { code: 'ja-JP', label: '日語' },
    { code: 'ko-KR', label: '韓語' },
    { code: 'de-DE', label: '德語' },
    { code: 'fr-FR', label: '法語' },
    { code: 'es-ES', label: '西班牙語' }
  ]
}

export { ttsConfig }

interface HistoryItem {
  text: string
  audioUrl: string
}

interface TtsSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** Logo URL */
  logoUrl?: string
  /** 頁面標題 */
  title?: string
  /** 歷史紀錄列表 */
  history: HistoryItem[]
  /** 當前語言 */
  language: string
  /** 語言變更回調 */
  onLanguageChange: (lang: string) => void
  /** 點擊歷史項目回調 */
  onHistoryItemClick: (item: HistoryItem) => void
  /** 首頁連結 */
  homeUrl?: string
}

export function TtsSidebar({
  logoUrl = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-tts.png',
  title = '說書人',
  history,
  language,
  onLanguageChange,
  onHistoryItemClick,
  homeUrl = '/',
  className,
  ...props
}: TtsSidebarProps) {
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
          將文字轉換為自然流暢的語音，支援多種語言和聲音風格。
        </p>
      </SidebarHeader>

      <SidebarContent>
        {/* 語言選擇區 */}
        <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
          <SidebarGroupLabel className='flex items-center gap-1'>
            <InfoIcon className='size-4 text-blue-500' />
            當前語言
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className='bg-background rounded-md border p-2'>
              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className='hover:bg-accent h-8 w-full border-0 p-0 text-sm font-normal shadow-none'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='max-h-60'>
                  {ttsConfig.languages.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 轉換紀錄區 */}
        <Collapsible defaultOpen className='group/collapsible group-data-[collapsible=icon]:hidden'>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className='flex w-full items-center gap-1.5'>
                <ChevronDown className='size-4 shrink-0 text-gray-400 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90 group-data-[state=open]/collapsible:rotate-0' />
                <span className='text-muted-foreground truncate text-xs font-medium'>轉換紀錄</span>
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
                                {item.text}
                              </span>
                              <Volume2Icon className='ml-2 size-4 shrink-0 text-blue-500' />
                            </span>
                          </SidebarMenuButton>
                          <div className='absolute top-1 right-1 opacity-0 transition-opacity group-hover/item:opacity-100'>
                            <Button
                              size='sm'
                              className='h-6 px-2 text-xs'
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(item.text)
                                toast.success('已複製到剪貼板')
                              }}
                            >
                              複製
                            </Button>
                          </div>
                        </SidebarMenuItem>
                      ))
                  ) : (
                    <div className='text-muted-foreground py-4 text-center text-sm'>
                      尚無轉換紀錄
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

export default TtsSidebar
