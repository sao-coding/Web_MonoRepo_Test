'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { cn } from '../../lib/utils'

export interface ChatMessageProps {
  /** 訊息類型：使用者或助手 */
  type: 'user' | 'assistant'
  /** 訊息內容 */
  content: string
  /** 助手頭像 URL */
  avatarUrl?: string
  /** 動作按鈕區 */
  actions?: React.ReactNode
  /** 額外內容（如 feedback panel） */
  extraContent?: React.ReactNode
  /** 是否正在載入中（用於顯示打字效果） */
  isLoading?: boolean
  /** 自訂 className */
  className?: string
}

/**
 * ChatMessage 元件
 *
 * 可復用的對話訊息 UI，支援使用者訊息和 AI 回覆
 * 自動處理 Markdown 渲染
 *
 * @example
 * ```tsx
 * <ChatMessage
 *   type="user"
 *   content="你好！"
 * />
 * <ChatMessage
 *   type="assistant"
 *   content="你好！有什麼可以幫助你的嗎？"
 *   avatarUrl="/ai-avatar.png"
 *   actions={<MessageActions onCopy={() => {}} />}
 * />
 * ```
 */
export function ChatMessage({
  type,
  content,
  avatarUrl = 'https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png',
  actions,
  extraContent,
  isLoading = false,
  className
}: ChatMessageProps) {
  if (type === 'user') {
    return (
      <div className={cn('flex justify-end w-full', className)}>
        <div className='max-w-[85%] rounded-2xl bg-gray-100 px-5 py-3 text-gray-800 dark:bg-zinc-800 dark:text-gray-100'>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-4 w-full', className)}>
      <div className='mt-1 shrink-0'>
        <img
          className='size-8 rounded-full border border-gray-200 object-cover dark:border-zinc-700'
          src={avatarUrl}
          alt='AI'
        />
      </div>
      <div className='min-w-0 flex-1 space-y-2'>
        <div className='prose prose-sm max-w-none dark:prose-invert'>
          {isLoading && !content ? (
            <div className='flex items-center gap-1'>
              <span className='animate-pulse'>●</span>
              <span className='animate-pulse delay-100'>●</span>
              <span className='animate-pulse delay-200'>●</span>
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {content}
            </ReactMarkdown>
          )}
        </div>
        {actions && <div className='flex items-center gap-2 pt-1'>{actions}</div>}
        {extraContent}
      </div>
    </div>
  )
}

export default ChatMessage
