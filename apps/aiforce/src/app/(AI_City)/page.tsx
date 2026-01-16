import type { Metadata } from 'next'

import { HomeInterface } from './home-interface'

/**
 * AIForce 首頁 SEO Metadata (SSG)
 */
export const metadata: Metadata = {
  title: 'AIForce - AI 應用平台',
  description: '探索多種 AI 應用工具，包括語音辨識、文字轉語音、圖片描述等智能服務。',
  keywords: ['AIForce', 'AI', '人工智慧', '語音辨識', 'TTS', '圖片辨識'],
  openGraph: {
    title: 'AIForce - AI 應用平台',
    description: '探索多種 AI 應用工具，包括語音辨識、文字轉語音、圖片描述等智能服務。',
    type: 'website',
  },
}

/**
 * AIForce 首頁 (Server Component)
 *
 * 靜態輸出 SEO metadata
 * 互動邏輯由 HomeInterface Client Component 處理
 */
export default function HomePage() {
  return <HomeInterface />
}
