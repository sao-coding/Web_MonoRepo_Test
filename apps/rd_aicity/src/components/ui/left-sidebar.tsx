'use client'

import {
  ChevronDown,
  FileText,
  PanelLeft,
  SquarePen,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { titleConfig } from '@/config/title'

// 假設您有 cn 函數來合併 className，如果沒有，請使用一個簡單的實現或刪除
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

interface LeftSidebarProps {
  // --- 1. 標題與 Image Icon 設定 ---
  /** 標題的 className */
  titleClassName?: string
  /** 標題左側圖片的 className (用於控制大小和樣式) */
  titleImageClassName?: string

  // --- 新增：標題下方的說明文字區塊 ---
  /** 標題下方的說明內容 (可選，允許文字或 React 元素) */
  headerDescription?: React.ReactNode

  // --- 3. 新增Button 設定 ---
  /** 控制是否顯示新增按鈕，預設為 true */
  showNewButton?: boolean
  /** 按鈕的內容 (僅用於展開狀態，允許文字或React元素) */
  NewButtonContent?: React.ReactNode
  /** 新增按鈕的點擊事件 (在引用頁面設定) */
  onNewButtonClick: () => void
  showNoteButton?: boolean
  NoteButtonContent?: React.ReactNode
  onNoteButtonClick: () => void

  /** 4. 內容放置區塊：側邊欄的主內容區 */
  children?: React.ReactNode
  /** 內容放置區塊的 className */
  ContentClassName?: string

  expandedWidth?: string
  collapsedWidth?: string

  // --- 新增：可展開/收合的紀錄區塊設定 ---
  /** 控制是否顯示紀錄區塊，預設為 false */
  showRecordsSection?: boolean
  /** 紀錄區塊的觸發按鍵文字，預設為 '紀錄' */
  RecordsSectionLabel?: React.ReactNode
  /** 紀錄區塊的內容 */
  recordsSectionContent?: React.ReactNode
  /** 紀錄區塊內容的 className */
  RecordsClassName?: string
  /** 紀錄區塊展開/收合事件回調 */
  onRecordsSectionToggle?: (isExpanded: boolean) => void
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  titleClassName,
  titleImageClassName, // 預設圖片樣式
  headerDescription,
  showNewButton = false,
  NewButtonContent = '新增對話',
  onNewButtonClick,
  showNoteButton = false,
  NoteButtonContent = '筆記',
  onNoteButtonClick,
  children,
  ContentClassName,
  expandedWidth = 'w-[260px]',
  collapsedWidth = 'w-14 cursor-[w-resize]',
  showRecordsSection = false,
  RecordsSectionLabel = '紀錄',
  recordsSectionContent,
  RecordsClassName,
  onRecordsSectionToggle,
}) => {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isRecordsSectionExpanded, setIsRecordsSectionExpanded] = useState(true)
  const title = titleConfig.find(item => pathname.startsWith(item.pathname))?.title
  const titleImageUrl = titleConfig.find(item => pathname.startsWith(item.pathname))?.logoUrl

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

  // 處理新增按鈕的點擊事件 (統一處理，並阻止冒泡)
  const handleNewButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onNewButtonClick() // 執行外部設定的動作
  }

  // 處理記事按鈕的點擊事件 (統一處理，並阻止冒泡)
  const handleNoteButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onNoteButtonClick() // 執行外部設定的動作
  }

  // 新增：處理紀錄區塊的展開/收合
  const handleRecordsSectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = !isRecordsSectionExpanded
    setIsRecordsSectionExpanded(newState)
    onRecordsSectionToggle?.(newState) // 執行外部回調
  }

  return (
    // 最外層 div 處理收合狀態下的空白處點擊展開
    <div
      className={cn(
        'bg-gray-50 overflow-y-auto hidden md:flex flex-col h-full transition-all duration-300',
        isExpanded
          ? expandedWidth
          : collapsedWidth,
      )}
      onClick={handleWrapperClick} // 點擊空白處觸發展開
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
                    {titleImageUrl && (
                    // 使用 img 標籤來顯示外部圖片
                      <img
                        src={titleImageUrl}
                        className={cn('size-7 rounded-full object-cover border border-gray-300', titleImageClassName)}
                      />
                    )}
                    <Link href={process.env.NEXT_PUBLIC_RD_SITE_URL ?? '/'} className={cn('flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity self-center font-bold text-gray-850 dark:text-white font-primary', titleClassName)}>
                      {title}
                      {' '}
                      {/* 1. 標題 */}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation() // 阻止冒泡
                      toggleExpanded(false)
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors cursor-[w-resize]"
                    aria-label="收合對話紀錄"
                  >
                    <PanelLeft size={20} />
                    {' '}
                    {/* 2. PanelRight Icon：收合功能 */}
                  </button>
                </div>

                {/* 新增：標題下方的說明文字區塊 */}
                {headerDescription && (
                  <div className="text-sm text-gray-600 mb-4">
                    {headerDescription}
                  </div>
                )}

                {/* 新增按鈕區塊 (展開狀態 - 顯示文字和 Icon) */}
                {showNewButton && (
                  <div>
                    <Button
                      onClick={handleNewButtonClick}
                      variant="ghost"
                      className="w-full flex items-center justify-start gap-2 px-2 has-[>svg]:px-2"
                    >
                      <SquarePen size={20} />
                      {NewButtonContent}
                      {' '}
                      {/* 3. 新增Button內容 (含文字) */}
                    </Button>
                  </div>
                )}

                {/* 記事按鈕區塊 (展開狀態 - 顯示文字和 Icon) */}
                {showNoteButton && (
                  <div>
                    <Button
                      onClick={handleNoteButtonClick}
                      variant="ghost"
                      className="w-full flex items-center justify-start gap-2 px-2 has-[>svg]:px-2"
                    >
                      <FileText size={20} />
                      {' '}
                      {NoteButtonContent}
                      {' '}
                      {/* 3. 新增Button內容 (含文字) */}
                    </Button>
                  </div>
                )}

                {/* 內容放置區塊 */}
                {children && (
                  <div className={cn('overflow-y-auto min-h-0 p-2 pt-0', ContentClassName)}>
                    {children}
                    {' '}
                    {/* 4. 內容放置區塊 */}
                  </div>
                )}

                {/* 紀錄區塊 (展開狀態 - 顯示可展開/收合的區塊) */}
                {showRecordsSection && (
                  <div className="mt-2">
                    <Button
                      onClick={handleRecordsSectionToggle}
                      variant="ghost"
                      className="w-full py-1.5 pl-2 flex items-center gap-1.5 text-xs font-medium justify-start hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-500"
                    >
                      <span className="flex items-center gap-2">
                        <ChevronDown size={16} className={`text-gray-300 transform transition-transform duration-200 ${isRecordsSectionExpanded ? 'rotate-0' : 'rotate-180'}`} />
                        <div>
                          {RecordsSectionLabel}
                        </div>
                      </span>
                    </Button>
                    {/* 展開時顯示內容 - 加入動畫效果 */}
                    <div className={cn(`overflow-hidden transition-all duration-300 ease-in-out ${isRecordsSectionExpanded ? 'opacity-100' : 'opacity-0'}`, RecordsClassName)}>
                      <div className="overflow-y-auto">
                        {recordsSectionContent}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )
        : (
      // 收合狀態下的 UI 結構
            <div className="flex flex-col h-full">
              {/* 展開按鈕區塊 (最上方) */}
              <div
                className="flex items-center justify-center mt-2 h-[36px] pb-1.5 bg-gray-50 shrink-0"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation() // 阻止冒泡
                    toggleExpanded(true)
                  }}
                  className="p-2 hover:bg-gray-200 rounded transition-colors cursor-[w-resize]"
                  aria-label="展開對話紀錄"
                >
                  {/* 摺疊狀態：顯示打開 sidebar 的圖標 */}
                  <PanelLeft size={20} />
                </button>
              </div>

              {/* 收合狀態下 - 新增按鈕 (只顯示 SquarePen) */}
              {showNewButton && (
                <div className="shrink-0">
                  <Button
                    onClick={handleNewButtonClick} // 執行外部設定的動作，並阻止冒泡
                    variant="ghost"
                    // 確保寬度和高度只夠容納 Icon
                    className="h-[36px] w-full flex items-center justify-center p-0"
                    title={typeof NewButtonContent === 'string' || typeof NewButtonContent === 'number' ? String(NewButtonContent) : undefined}
                  >
                    {/* 3. 區塊收合時要顯示純 SquarePen (符合要求) */}
                    <SquarePen size={20} />
                  </Button>
                </div>
              )}

              {/* 收合狀態下 - 記事按鈕 (只顯示 FileText) */}
              {showNoteButton && (
                <div className="shrink-0">
                  <Button
                    onClick={handleNoteButtonClick} // 執行外部設定的動作，並阻止冒泡
                    variant="ghost"
                    // 確保寬度和高度只夠容納 Icon
                    className="h-[36px] w-full flex items-center justify-center p-0"
                    title={typeof NoteButtonContent === 'string' || typeof NoteButtonContent === 'number' ? String(NoteButtonContent) : undefined}
                  >
                    {/* 3. 區塊收合時要顯示純 SquarePen (符合要求) */}
                    <FileText size={20} />
                  </Button>
                </div>
              )}

              {/* 內容區塊 (收合狀態下) */}
              <div className="flex-1 overflow-y-auto p-2">
                {/* 這裡可放置收合狀態的內容，或保持空白 */}
              </div>
            </div>
          )}
    </div>
  )
}

export default LeftSidebar
