'use client'

import { Button } from '@msi/ui/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@msi/ui/components/collapsible'
import { Input } from '@msi/ui/components/input'
import { Loading } from '@msi/ui/components/loading'
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
import {
  AudioLines,
  CheckIcon,
  ChevronDown,
  File,
  FileAudio,
  Mic,
  Moon,
  PanelLeft,
  PencilIcon,
  Sun,
  TrashIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

export interface RecordItem {
  chatId: number
  title: string
  // createdAt: string
}

interface InstantSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** 是否為音檔上傳模式 */
  isUpload: boolean
  /** 目前選中的記錄 ID */
  activeRecordId: number | null
  /** 選擇記錄時的回調 */
  onSelectRecord: (recordId: number | null) => void
  /** 開始新即時會議 */
  onStartNewInstant: () => void
  /** 開始新音檔上傳 */
  onStartNewUpload: () => void
  /** 是否正在載入記錄 */
  isLoadingRecord: boolean
  /** 記錄列表 */
  records: RecordItem[]
  /** 記錄變更時的回調 (用於重新獲取記錄) */
  onRecordsChange: () => void
  /** 頁面標題 */
  title?: string
  /** Logo URL */
  logoUrl?: string
  /** 首頁連結 */
  homeUrl?: string
  /** 刪除記錄的 API 路徑 (不含 ID) */
  deleteApiPath?: string
  /** 更新標題的 API 路徑 (不含 ID) */
  updateApiPath?: string
}

export function InstantSidebar({
  isUpload,
  activeRecordId,
  onSelectRecord,
  onStartNewInstant,
  onStartNewUpload,
  isLoadingRecord,
  records,
  onRecordsChange,
  logoUrl = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-Meeting.png',
  title = '會議助理',
  homeUrl = '/',
  deleteApiPath = `${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/history`,
  updateApiPath = `${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/history`,
  className,
  ...props
}: InstantSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isEditingTitle, setIsEditingTitle] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const { theme, setTheme } = useTheme()

  const deleteRecord = async (seqNo: number) => {
    try {
      const res = await fetch(`${deleteApiPath}/${seqNo}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('紀錄已刪除')
        if (activeRecordId === seqNo)
          onSelectRecord(null)
        onRecordsChange()
      }
      else {
        toast.error('刪除失敗')
      }
    }
    catch (err) {
      console.error('刪除紀錄失敗:', err)
      toast.error('刪除紀錄失敗')
    }
  }

  const startEditTitle = (seqNo: number, currentTitle: string) => {
    setIsEditingTitle(seqNo)
    setNewTitle(currentTitle)
  }

  const updateTitle = async (seqNo: number) => {
    if (!newTitle.trim()) {
      toast.error('標題不能為空')
      return
    }
    try {
      const res = await fetch(`${updateApiPath}/${seqNo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      })
      if (res.ok) {
        toast.success('標題已更新')
        setIsEditingTitle(null)
        onRecordsChange()
      }
      else {
        toast.error('更新失敗')
      }
    }
    catch (err) {
      console.error('更新標題失敗:', err)
      toast.error('更新標題失敗')
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation()
    toast('確定要刪除這條記錄嗎？', {
      action: { label: '確定', onClick: () => deleteRecord(chatId) },
      cancel: { label: '取消', onClick: () => undefined },
      position: 'top-center',
      duration: 10000,
      style: {
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    })
  }

  return (
    <Sidebar
      collapsible='icon'
      className={cn(
        'h-full shrink-0',
        '**:data-[sidebar=menu-button]:overflow-hidden',
        '[&_[data-sidebar=menu-button]_span]:truncate',
        '[&_[data-sidebar=menu-button]_span]:block',
        '[&_[data-sidebar=menu-button]_span]:min-w-0',
        '**:data-[sidebar=content]:overflow-hidden',
        '**:data-[sidebar=header]:overflow-hidden',
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
          結合多語翻譯與智慧文字紀錄的會議支援平台。
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onStartNewInstant}
                  className={cn(
                    'cursor-pointer',
                    pathname === '/' && !isUpload && 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <Mic />
                  <span className='group-data-[collapsible=icon]:hidden'>即時會議記錄</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onStartNewUpload}
                  className={cn(
                    'cursor-pointer',
                    pathname === '/' && isUpload && 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <FileAudio />
                  <span className='group-data-[collapsible=icon]:hidden'>現有音檔上傳</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => { router.push('/Recording') }}
                  className={cn(
                    'cursor-pointer',
                    pathname === '/Recording' && 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <AudioLines />
                  <span className='group-data-[collapsible=icon]:hidden'>語音錄製</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 識別紀錄區 */}
        <Collapsible defaultOpen className='group/collapsible group-data-[collapsible=icon]:hidden'>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className='flex w-full items-center gap-1.5'>
                <ChevronDown className='size-4 shrink-0 text-gray-400 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90 group-data-[state=open]/collapsible:rotate-0' />
                <span className='text-muted-foreground truncate text-xs font-medium'>紀錄</span>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down'>
              <SidebarGroupContent>
                <SidebarMenu>
                  {isLoadingRecord
                    ? (
                        <div className='flex justify-center py-4'>
                          <Loading size='small' className='top-12' />
                        </div>
                      )
                    : records.length > 0
                      ? (
                          records.map((record) => (
                            <SidebarMenuItem
                              key={record.chatId}
                              className='group/item relative flex min-w-0 gap-2'
                            >
                              <File />
                              <div className='grid'>
                                {isEditingTitle === record.chatId
                                  ? (
                                      <div className='flex w-full items-center gap-1 px-2'>
                                        <Input
                                          value={newTitle}
                                          onChange={(e) => { setNewTitle(e.target.value) }}
                                          className='h-8 min-w-0 grow'
                                          ref={(el) => {
                                            if (el) {
                                              setTimeout(() => { el.focus() }, 0)
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter')
                                              updateTitle(record.chatId)
                                            else if (e.key === 'Escape')
                                              setIsEditingTitle(null)
                                          }}
                                        />
                                        <Button
                                          size='icon'
                                          variant='ghost'
                                          className='size-7 shrink-0'
                                          onClick={() => updateTitle(record.chatId)}
                                        >
                                          <CheckIcon className='size-4' />
                                        </Button>
                                      </div>
                                    )
                                  : (
                                      <>
                                        <SidebarMenuButton
                                          onClick={() => { onSelectRecord(record.chatId) }}
                                          isActive={activeRecordId === record.chatId}
                                          className='group-hover/item:bg-sidebar-accent group-hover/item:text-sidebar-accent-foreground w-full min-w-0'
                                        >
                                          <span className='block min-w-0 flex-1 truncate'>
                                            {record.title}
                                          </span>
                                        </SidebarMenuButton>
                                        <div
                                          className={cn(
                                            'absolute right-2 top-1/2 -translate-y-1/2 flex gap-1',
                                            'opacity-0 group-hover/item:opacity-100 transition-opacity',
                                            'bg-sidebar group-hover/item:bg-sidebar-accent'
                                          )}
                                        >
                                          <Button
                                            variant='ghost'
                                            size='icon'
                                            className='size-6'
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              startEditTitle(record.chatId, record.title)
                                            }}
                                          >
                                            <PencilIcon className='size-3.5' />
                                          </Button>
                                          <Button
                                            variant='ghost'
                                            size='icon'
                                            className='text-destructive size-6 hover:text-destructive'
                                            onClick={(e) => { handleDeleteClick(e, record.chatId) }}
                                          >
                                            <TrashIcon className='size-3.5' />
                                          </Button>
                                        </div>
                                      </>
                                    )}
                                    <span className='px-2 text-xs text-gray-400'>
                                      {/* // 詳細建立時間 yyyy/mm/dd hh:mm:ss */}
                                      {/* {new Date(record.createdAt).toLocaleString('zh-TW', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      })} */}
                                    </span>
                                  </div>
                            </SidebarMenuItem>
                          ))
                        )
                      : (
                          <div className='text-muted-foreground py-4 text-center text-sm'>
                            尚無任何紀錄
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

export default InstantSidebar
