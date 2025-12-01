/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

interface LoadingProps {
  text?: string
  size?: 'small' | 'medium' | 'large'
  fullPage?: boolean
  overlay?: boolean
  transparent?: boolean
}

/**
 * Loading 組件 - 顯示載入動畫
 * @param text 載入文字
 * @param size 尺寸大小 (small, medium, large)
 * @param fullPage 是否全頁覆蓋
 * @param overlay 是否背景遮罩
 * @param transparent 背景是否透明
 */
export function Loading({
  text = '載入中...',
  size = 'medium',
  fullPage = false,
  overlay = true,
  transparent = false,
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

  // 設置背景，根據transparent參數
  // const bgClassName = transparent
  //   ? overlay
  //     ? 'bg-white/20 backdrop-blur-sm'
  //     : ''
  //   : overlay
  //     ? 'bg-white/80 backdrop-blur-sm'
  //     : ''

  return (
    <AnimatePresence>
      <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 rounded-lg p-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Loader2 className="animate-spin" size={iconSize} />
          {text && <p className={`${textSize} text-gray-600`}>{text}</p>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
