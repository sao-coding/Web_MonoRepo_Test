'use client'

import { Button } from '@msi/ui/components/button'
import { Textarea } from '@msi/ui/components/textarea'
import { cn } from '@msi/ui/lib/utils'
import { SendHorizontalIcon } from 'lucide-react'
import * as React from 'react'

interface TextInputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  placeholder?: string
  maxWidthClass?: string
  className?: string
}

export function TextInputArea({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = '在此輸入/直接貼上需要轉為語音的文字...',
  maxWidthClass = 'max-w-3xl',
  className
}: TextInputAreaProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && value.trim()) {
        onSubmit()
      }
    }
  }

  return (
    <div className={cn('mx-auto w-full', maxWidthClass, className)}>
      <div className='flex items-end gap-2 rounded-2xl border bg-background p-3 shadow-sm'>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className='min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0'
          rows={2}
        />
        <Button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          size='icon'
          className='size-10 shrink-0 rounded-full'
        >
          {isLoading ? (
            <div className='size-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
          ) : (
            <SendHorizontalIcon className='size-5' />
          )}
        </Button>
      </div>
    </div>
  )
}

export default TextInputArea
