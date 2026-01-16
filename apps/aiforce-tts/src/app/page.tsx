import type { Metadata } from 'next'

import { TTSInterface } from '@/components/tts-interface'

/**
 * TTS 頁面 SEO Metadata (SSG)
 */
export const metadata: Metadata = {
  title: '說書人 - AI 文字轉語音',
  description: '使用 AI 將文字轉換為自然流暢的語音，支援多種語言和聲音風格。',
  keywords: ['TTS', '文字轉語音', 'AI', '說書人', '語音合成'],
  openGraph: {
    title: '說書人 - AI 文字轉語音',
    description: '使用 AI 將文字轉換為自然流暢的語音，支援多種語言和聲音風格。',
    type: 'website'
  }
}

/**
 * TTS 首頁 (Server Component)
 *
 * 靜態輸出頁面標題、SEO 描述
 * 互動邏輯由 TTSInterface Client Component 處理
 */
export default function TTSPage() {
  return <TTSInterface />
}
