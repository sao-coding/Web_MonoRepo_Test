import type { Metadata } from 'next'

import { ASRInterface } from '@/components/asr-interface'

/**
 * ASR 頁面 SEO Metadata (SSG)
 */
export const metadata: Metadata = {
  title: '語音轉文字 - AI 語音辨識服務',
  description: '使用 AI 將語音轉換為文字，支援多種語言。上傳 WAV 音檔即可快速識別。',
  keywords: ['ASR', '語音辨識', 'AI', '語音轉文字', 'Speech-to-Text'],
  openGraph: {
    title: '語音轉文字 - AI 語音辨識服務',
    description: '使用 AI 將語音轉換為文字，支援多種語言。上傳 WAV 音檔即可快速識別。',
    type: 'website'
  }
}

/**
 * ASR 首頁 (Server Component)
 *
 * 靜態輸出頁面標題、SEO 描述
 * 互動邏輯由 ASRInterface Client Component 處理
 */
export default function ASRPage() {
  return <ASRInterface />
}
