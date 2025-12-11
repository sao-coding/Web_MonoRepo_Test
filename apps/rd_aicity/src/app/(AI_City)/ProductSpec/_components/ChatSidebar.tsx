'use client'

import { Button } from '@msi/ui/components/button'
import { Input } from '@msi/ui/components/input'
import { Loading } from '@msi/ui/components/loading'
import {
  CheckIcon,
  ChevronDown,
  FileText,
  PanelLeft,
  PencilIcon,
  SquarePen,
  TrashIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { titleConfig } from '@/config/title'

// 合併 className 的輔助函數
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

interface RecordItem {
  chatId: number
  title: string
}

interface ChatSidebarProps {
  activeRecordId: number | null
  onSelectRecord: (recordId: number | null) => void
  onStartNewConversation: () => void
  userId?: string
  isLoadingRecord: boolean
  records: RecordItem[]
  onRecordsChange: () => void
  setIsShowingNote: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  activeRecordId,
  onSelectRecord,
  onStartNewConversation,
  setIsShowingNote,
  isLoadingRecord,
  records,
  onRecordsChange,
}) => {
  const pathname = usePathname()
  const config = titleConfig.find(item => pathname.startsWith(item.pathname))
  const title = config?.title || 'SpecCore'
  const logoUrl = config?.logoUrl

  const [isExpanded, setIsExpanded] = useState(true)
  const [isRecordsSectionExpanded, setIsRecordsSectionExpanded] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState('')

  // 處理展開/收合
  const toggleExpanded = (expand?: boolean) => {
    setIsExpanded(expand !== undefined ? expand : prev => !prev)
  }

  // 處理收合狀態下的點擊空白處展開
  const handleWrapperClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  // 處理新增按鈕的點擊事件
  const handleNewButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStartNewConversation()
  }

  // 處理筆記按鈕的點擊事件
  const handleNoteButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsShowingNote(true)
    onSelectRecord(null)
  }

  // 處理紀錄區塊的展開/收合
  const handleRecordsSectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRecordsSectionExpanded(!isRecordsSectionExpanded)
  }

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
        }),
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

  const selectRecord = (recordId: number) => {
    if (activeRecordId === recordId)
      return

    onSelectRecord(recordId)
  }

  return (
    <div
      className={cn(
        'bg-gray-50 overflow-y-auto hidden md:flex flex-col h-full transition-all duration-300',
        isExpanded
          ? 'w-[260px]'
          : 'w-14 cursor-w-resize',
      )}
      onClick={handleWrapperClick}
    >
      {isExpanded
        ? (
      // 展開狀態下的 UI 結構
            <>
              <div className="p-2 shrink-0">
                {/* 標題與收合按鈕區塊 */}
                <div className="flex items-center justify-between mb-4">
                  {/* 標題與 Image Icon */}
                  <div className="flex items-center gap-2">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        className={cn('size-7 rounded-full object-cover border border-gray-300')}
                      />
                    )}
                    <Link href={process.env.NEXT_PUBLIC_RD_SITE_URL ?? '/'} className={cn('flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity self-center font-bold text-gray-850 dark:text-white font-primary')}>
                      {title}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpanded(false)
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors cursor-w-resize"
                    aria-label="收合對話紀錄"
                  >
                    <PanelLeft size={20} />
                  </button>
                </div>

                {/* 新增按鈕區塊 */}
                <div>
                  <Button
                    onClick={handleNewButtonClick}
                    variant="ghost"
                    className="w-full flex items-center justify-start gap-2 px-2 has-[>svg]:px-2"
                  >
                    <SquarePen size={20} />
                    新增對話
                  </Button>
                </div>

                {/* 筆記按鈕區塊 */}
                <div>
                  <Button
                    onClick={handleNoteButtonClick}
                    variant="ghost"
                    className="w-full flex items-center justify-start gap-2 px-2 has-[>svg]:px-2"
                  >
                    <FileText size={20} />
                    筆記
                  </Button>
                </div>

                {/* 紀錄區塊 */}
                <div className="mt-2">
                  <Button
                    onClick={handleRecordsSectionToggle}
                    variant="ghost"
                    className="w-full py-1.5 pl-2 flex items-center gap-1.5 text-xs font-medium justify-start hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-500"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronDown size={16} className={`text-gray-300 transform transition-transform duration-200 ${isRecordsSectionExpanded ? 'rotate-0' : 'rotate-180'}`} />
                      <div>對話</div>
                    </span>
                  </Button>
                  {/* 展開時顯示內容 */}
                  <div className={cn(`overflow-hidden transition-all duration-300 ease-in-out ${isRecordsSectionExpanded ? 'opacity-100' : 'opacity-0'}`)}>
                    <div className="overflow-y-auto">
                      {isLoadingRecord
                        ? (
                            <Loading text="Loading..." size="large" />
                          )
                        : records.length > 0
                          ? (
                              records.map(record => (
                                <div className="group relative" key={record.chatId}>
                                  {isEditingTitle === record.chatId
                                    ? (
                                        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-900" onClick={e => e.stopPropagation()}>
                                          <Input
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                updateTitle(record.chatId)
                                              }
                                              else if (e.key === 'Escape') {
                                                setIsEditingTitle(null)
                                              }
                                            }}
                                            autoFocus
                                            className="text-sm py-1"
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => updateTitle(record.chatId)}
                                            className="h-8 px-2"
                                          >
                                            <CheckIcon className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )
                                    : (
                                        <div className="relative">
                                          <div
                                            onClick={() => selectRecord(record.chatId)}
                                            className={`${activeRecordId === record.chatId
                                              ? 'bg-gray-100 dark:bg-gray-900'
                                              : 'hover:bg-gray-100 dark:hover:bg-gray-950'
                                            } min-w-0 flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors`}
                                          >
                                            <span className="truncate min-w-0">{record.title}</span>
                                          </div>
                                          <div className={`${activeRecordId !== record.chatId
                                          && 'opacity-0 group-hover:opacity-100 transition-opacity'
                                          } from-gray-100 dark:from-gray-900 bg-linear-to-l from-80% to-transparent absolute top-2 pl-4 right-2 flex gap-1`}
                                          >
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-800"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                startEditTitle(record.chatId, record.title)
                                              }}
                                            >
                                              <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                toast(
                                                  '確定要刪除這條記錄嗎？',
                                                  {
                                                    action: {
                                                      label: '確定',
                                                      onClick: () => deleteRecord(record.chatId),
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
                                              }}
                                            >
                                              <TrashIcon className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                </div>
                              ))
                            )
                          : (
                              <div className="text-center text-gray-400">
                                尚無任何紀錄
                              </div>
                            )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        : (
      // 收合狀態下的 UI 結構
            <div className="flex flex-col h-full">
              {/* 展開按鈕區塊 (最上方) */}
              <div
                className="flex items-center justify-center mt-2 h-9 pb-1.5 bg-gray-50 shrink-0"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(true)
                  }}
                  className="p-2 hover:bg-gray-200 rounded transition-colors cursor-w-resize"
                  aria-label="展開對話紀錄"
                >
                  <PanelLeft size={20} />
                </button>
              </div>

              {/* 收合狀態下 - 新增按鈕 */}
              <div className="shrink-0">
                <Button
                  onClick={handleNewButtonClick}
                  variant="ghost"
                  className="h-9 w-full flex items-center justify-center p-0"
                  title="新增對話"
                >
                  <SquarePen size={20} />
                </Button>
              </div>

              {/* 收合狀態下 - 筆記按鈕 */}
              <div className="shrink-0">
                <Button
                  onClick={handleNoteButtonClick}
                  variant="ghost"
                  className="h-9 w-full flex items-center justify-center p-0"
                  title="筆記"
                >
                  <FileText size={20} />
                </Button>
              </div>

              {/* 內容區塊 (收合狀態下) */}
              <div className="flex-1 overflow-y-auto p-2">
                {/* 收合狀態下的內容區域 */}
              </div>
            </div>
          )}
    </div>
  )
}

export default ChatSidebar
