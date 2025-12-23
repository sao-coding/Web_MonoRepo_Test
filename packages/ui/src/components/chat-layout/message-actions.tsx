'use client'

import { CopyIcon, Pin, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/utils'
import { Button } from '../button'

export interface MessageActionsProps {
  /** 複製回調 */
  onCopy?: () => void
  /** 參考資料回調 */
  onReference?: () => void
  /** 記事回調 */
  onNote?: () => void
  /** 點讚回調 */
  onThumbsUp?: () => void
  /** 點踩回調 */
  onThumbsDown?: () => void
  /** 是否已點讚 */
  isLiked?: boolean
  /** 是否已點踩 */
  isDisliked?: boolean
  /** 是否顯示記事按鈕 */
  showNote?: boolean
  /** 是否顯示點讚按鈕 */
  showThumbsUp?: boolean
  /** 是否顯示點踩按鈕 */
  showThumbsDown?: boolean
  /** 額外的動作按鈕 */
  children?: React.ReactNode
  /** 自訂 className */
  className?: string
}

/**
 * MessageActions 元件
 *
 * 可復用的訊息操作按鈕組，包含複製、參考資料、記事、讚/踩
 *
 * @example
 * ```tsx
 * <MessageActions
 *   onCopy={() => navigator.clipboard.writeText(text)}
 *   onReference={() => openReferences(id)}
 *   onNote={() => saveNote(id)}
 *   onThumbsUp={() => handleFeedback(id, true)}
 *   onThumbsDown={() => handleFeedback(id, false)}
 *   showNote={true}
 *   showThumbsUp={true}
 *   showThumbsDown={true}
 * />
 * ```
 */
export function MessageActions({
  onCopy,
  onReference,
  onNote,
  onThumbsUp,
  onThumbsDown,
  isLiked = false,
  isDisliked = false,
  showNote = true,
  showThumbsUp = true,
  showThumbsDown = true,
  children,
  className
}: MessageActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {onCopy && (
        <Button
          variant='ghost'
          size='sm'
          className='h-6 px-2 text-xs text-gray-500 dark:text-gray-400'
          onClick={onCopy}
        >
          <CopyIcon className='mr-1 size-3' />
          複製
        </Button>
      )}

      {onReference && (
        <Button
          variant='ghost'
          size='sm'
          className='h-6 px-2 text-xs text-gray-500 dark:text-gray-400'
          onClick={onReference}
        >
          <Star className='mr-1 size-3' />
          參考資料
        </Button>
      )}

      {showNote && onNote && (
        <Button
          variant='ghost'
          size='sm'
          className='h-6 px-2 text-xs text-gray-500 dark:text-gray-400'
          onClick={onNote}
        >
          <Pin className='mr-1 size-3' />
          記事
        </Button>
      )}

      {showThumbsUp && onThumbsUp && (
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'h-6 px-2 text-xs',
            isLiked ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
          )}
          onClick={onThumbsUp}
        >
          <ThumbsUp className='size-3' />
        </Button>
      )}

      {showThumbsDown && onThumbsDown && (
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'h-6 px-2 text-xs',
            isDisliked ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
          )}
          onClick={onThumbsDown}
        >
          <ThumbsDown className='size-3' />
        </Button>
      )}

      {children}
    </div>
  )
}

export default MessageActions
