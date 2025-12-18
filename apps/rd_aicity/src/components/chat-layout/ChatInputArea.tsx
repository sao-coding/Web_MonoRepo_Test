'use client'

import { Button } from '@msi/ui/components/button'
import { Textarea } from '@msi/ui/components/textarea'
import { cn } from '@msi/ui/lib/utils'
import { ArrowUp, GlobeIcon } from 'lucide-react'
import React, { useRef } from 'react'

export interface ChatInputAreaProps {
  /** 輸入值 */
  value: string
  /** 值變更回調 */
  onChange: (value: string) => void
  /** 送出回調 */
  onSubmit: () => void
  /** 是否正在載入 */
  isLoading?: boolean
  /** 是否啟用網頁搜尋 */
  isWebSearchEnabled?: boolean
  /** 切換網頁搜尋 */
  onToggleWebSearch?: () => void
  /** 顯示網頁搜尋按鈕 */
  showWebSearch?: boolean
  /** 網頁搜尋提示文字 */
  webSearchHint?: string
  /** Placeholder */
  placeholder?: string
  /** 自訂 className */
  className?: string
  /** 最大寬度類名 */
  maxWidthClass?: string
}

/**
 * ChatInputArea 元件
 *
 * 可復用的聊天輸入區域，包含文字輸入框、送出按鈕、網頁搜尋切換
 *
 * @example
 * ```tsx
 * <ChatInputArea
 *   value={userInput}
 *   onChange={setUserInput}
 *   onSubmit={handleSendMessage}
 *   isLoading={isLoading}
 *   isWebSearchEnabled={isWebSearchEnabled}
 *   onToggleWebSearch={() => setIsWebSearchEnabled(prev => !prev)}
 * />
 * ```
 */
export function ChatInputArea({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  isWebSearchEnabled = false,
  onToggleWebSearch,
  showWebSearch = true,
  webSearchHint = '*使用DeepSearch搜尋',
  placeholder = '今天我能為您做些什麼？',
  className,
  maxWidthClass = 'max-w-3xl',
}: ChatInputAreaProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className={cn(`w-full shrink-0 px-2.5 mx-auto ${maxWidthClass}`, className)}>
      <div className="mx-auto flex flex-col gap-2">
        <div className="flex-1 flex flex-col relative w-full shadow-lg rounded-3xl border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 transition bg-white dark:bg-zinc-800 px-3 py-2">
          <Textarea
            id="chat-input"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onChange={e => onChange(e.target.value)}
            rows={3}
            value={value}
            placeholder={placeholder}
            className="min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex justify-between items-center gap-2 p-2">
            <div className="flex items-end gap-2">
              {showWebSearch && onToggleWebSearch && (
                <>
                  <Button
                    onClick={onToggleWebSearch}
                    variant="ghost"
                    className={cn(
                      'flex items-center gap-2 cursor-pointer rounded-full',
                      isWebSearchEnabled
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-200'
                        : 'bg-white text-gray-500 dark:bg-zinc-800 dark:text-gray-400',
                    )}
                  >
                    <GlobeIcon className="size-4" />
                    網頁搜尋
                  </Button>
                  {isWebSearchEnabled && (
                    <span className="text-xs text-red-500">{webSearchHint}</span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={onSubmit}
                disabled={isLoading && value !== ''}
                size="icon"
                className="h-10 w-10 rounded-full cursor-pointer"
              >
                {isLoading
                  ? <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full" />
                  : <ArrowUp className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInputArea
