'use client'

import { Button } from '@msi/ui/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@msi/ui/components/collapsible'
import { Input } from '@msi/ui/components/input'
import { Loading } from '@msi/ui/components/loading'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@msi/ui/components/sidebar'
import {
  CheckIcon,
  ChevronRight,
  FileText,
  PencilIcon,
  SquarePen,
  TrashIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { titleConfig } from '@/config/title'

interface RecordItem {
  chatId: number
  title: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeRecordId: number | null
  onSelectRecord: (recordId: number | null) => void
  onStartNewConversation: () => void
  userId?: string
  isLoadingRecord: boolean
  records: RecordItem[]
  onRecordsChange: () => void
  setIsShowingNote: React.Dispatch<React.SetStateAction<boolean>>
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  activeRecordId,
  onSelectRecord,
  onStartNewConversation,
  setIsShowingNote,
  isLoadingRecord,
  records,
  onRecordsChange,
  ...props
}) => {
  const pathname = usePathname()
  const config = titleConfig.find(item => pathname.startsWith(item.pathname))
  const title = config?.title || 'SpecCore'
  const logoUrl = config?.logoUrl

  const [isEditingTitle, setIsEditingTitle] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const deleteRecord = async (seqNo: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/history/${seqNo}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('紀錄已刪除')
        if (activeRecordId === seqNo) {
          onSelectRecord(null)
        }
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/history/${seqNo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
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
    toast(
      '確定要刪除這條記錄嗎？',
      {
        action: {
          label: '確定',
          onClick: () => deleteRecord(chatId),
        },
        cancel: {
          label: '取消',
          onClick: () => {},
        },
        position: 'top-center',
        duration: 10000,
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      },
    )
  }

  return (
    <Sidebar variant="floating" collapsible="icon" className="**:data-[slot=sidebar-container]:z-10 group-data-[state=expanded]:w-[16rem] transition-all duration-300 ease-in-out" {...props}>
      <SidebarHeader className="p-0">
        <SidebarMenu>
          <SidebarMenuItem className="group/logo-item">
            <div className="flex items-center w-full relative">
              <SidebarMenuButton size="lg" asChild className="flex-1 group-data-[collapsible=icon]:group-hover/logo-item:opacity-0 group-data-[collapsible=icon]:group-hover/logo-item:pointer-events-none transition-opacity">
                <Link href={process.env.NEXT_PUBLIC_RD_SITE_URL ?? '/'}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt={title}
                        className="size-8 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{title}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
              <SidebarTrigger className="hidden group-data-[collapsible=icon]:flex absolute inset-0 w-full h-full opacity-0 group-hover/logo-item:opacity-100 transition-opacity" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        {/* 功能按鈕區 */}
        <SidebarGroup className="overflow-hidden pt-2">
          <SidebarGroupContent>
            <SidebarMenu className="min-w-0">
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onStartNewConversation}>
                  <SquarePen className="group-data-[collapsible=icon]:stroke-[1.5]" />
                  <span className="group-data-[collapsible=icon]:hidden">新增對話</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    setIsShowingNote(true)
                    onSelectRecord(null)
                  }}
                >
                  <FileText className="group-data-[collapsible=icon]:stroke-[1.5]" />
                  <span className="group-data-[collapsible=icon]:hidden">筆記</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 對話區 - 使用 Collapsible */}
        <Collapsible defaultOpen className="overflow-hidden group/collapsible-root">
          <SidebarGroup className="overflow-hidden">
            <SidebarGroupLabel asChild className="group-data-[collapsible=icon]:hidden">
              <CollapsibleTrigger className="group/collapsible flex w-full items-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md px-2">
                <ChevronRight className="size-4 text-gray-200 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 mr-1" />
                <span>對話</span>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupContent>
                <SidebarMenu className="min-w-0">
                  {isLoadingRecord
                    ? (
                        <div className="flex justify-center py-4">
                          <Loading size="small" />
                        </div>
                      )
                    : records.length > 0
                      ? (
                          records.map(record => (
                            <SidebarMenuItem key={record.chatId} className="min-w-0 max-w-full">
                              {isEditingTitle === record.chatId
                                ? (
                                    <div className="flex w-full items-center gap-1 px-2">
                                      <Input
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        className="h-8 grow"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter')
                                            updateTitle(record.chatId)
                                          else if (e.key === 'Escape')
                                            setIsEditingTitle(null)
                                        }}
                                      />
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-7"
                                        onClick={() => updateTitle(record.chatId)}
                                      >
                                        <CheckIcon className="size-4" />
                                      </Button>
                                    </div>
                                  )
                                : (
                                    <div className="group/item relative">
                                      <SidebarMenuButton
                                        onClick={() => onSelectRecord(record.chatId)}
                                        isActive={activeRecordId === record.chatId}
                                        tooltip={record.title}
                                        className="pr-16"
                                      >
                                        <span className="truncate">{record.title}</span>
                                      </SidebarMenuButton>

                                      {/* Hover 時顯示的操作按鈕 */}
                                      <div
                                        className={`absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 ${
                                          activeRecordId === record.chatId
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover/item:opacity-100'
                                        } transition-opacity`}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-6 hover:bg-sidebar-accent"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            startEditTitle(record.chatId, record.title)
                                          }}
                                        >
                                          <PencilIcon className="size-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                          onClick={e => handleDeleteClick(e, record.chatId)}
                                        >
                                          <TrashIcon className="size-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                            </SidebarMenuItem>
                          ))
                        )
                      : (
                          <div className="text-center text-muted-foreground text-sm py-4">
                            尚無任何紀錄
                          </div>
                        )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
