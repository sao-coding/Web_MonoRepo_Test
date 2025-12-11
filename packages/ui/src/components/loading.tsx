'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@msi/ui/lib/utils'

interface LoadingProps {
  text?: string
  size?: 'small' | 'medium' | 'large'
  fullPage?: boolean
  overlay?: boolean
  transparent?: boolean
  className?: string
}

/**
 * Loading 組件 - 顯示載入動畫
 * @param text 載入文字
 * @param size 尺寸大小 (small, medium, large)
 * @param fullPage 是否全頁覆蓋
 * @param overlay 是否背景遮罩
 * @param transparent 背景是否透明
 * @param className 額外的 className
 */
export function Loading({
  text = '載入中...',
  size = 'medium',
  fullPage = false,
  overlay = true,
  transparent = false,
  className,
}: LoadingProps) {
  // 根據尺寸設定圖標大小
  const iconSize = {
    small: 16,
    medium: 24,
    large: 40,
  }[size]

  // 根據尺寸設定文字大小
  const textSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }[size]

  // 根據是否為全頁模式設置定位和尺寸
  const containerClassName = fullPage
    ? 'fixed inset-0 z-50'
    : overlay
      ? 'absolute inset-0 z-10'
      : 'flex items-center justify-center z-10'

  return (
    <div className={cn('flex items-center justify-center', containerClassName, className)}>
      <div className="flex flex-col items-center gap-2 rounded-lg p-4">
        <Loader2 className="animate-spin text-primary" size={iconSize} />
        {text && <p className={cn(textSize, 'text-muted-foreground')}>{text}</p>}
      </div>
    </div>
  )
}
