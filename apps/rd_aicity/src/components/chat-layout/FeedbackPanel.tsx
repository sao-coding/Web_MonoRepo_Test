'use client'

import { Button } from '@msi/ui/components/button'
import { Input } from '@msi/ui/components/input'
import { cn } from '@msi/ui/lib/utils'
import { SendIcon, XIcon } from 'lucide-react'
import React, { useState } from 'react'

export interface FeedbackPanelProps {
  /** 提交回調 */
  onSubmit: (feedback: string) => void
  /** 取消回調 */
  onCancel?: () => void
  /** 預設值 */
  defaultValue?: string
  /** Placeholder */
  placeholder?: string
  /** 自訂 className */
  className?: string
}

/**
 * FeedbackPanel 元件
 *
 * 用於收集使用者對 AI 回覆的文字反饋
 *
 * @example
 * ```tsx
 * <FeedbackPanel
 *   onSubmit={(feedback) => handleFeedback(recordId, feedback)}
 *   onCancel={() => setShowFeedback(false)}
 *   placeholder="請輸入您的反饋..."
 * />
 * ```
 */
export function FeedbackPanel({
  onSubmit,
  onCancel,
  defaultValue = '',
  placeholder = '請輸入您的反饋意見...',
  className,
}: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState(defaultValue)

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback.trim())
      setFeedback('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel()
    }
  }

  return (
    <div className={cn('flex items-center gap-2 mt-2', className)}>
      <Input
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 h-8 text-sm"
        autoFocus
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-8 px-2"
        onClick={handleSubmit}
        disabled={!feedback.trim()}
      >
        <SendIcon className="h-4 w-4" />
      </Button>
      {onCancel && (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2"
          onClick={onCancel}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default FeedbackPanel
