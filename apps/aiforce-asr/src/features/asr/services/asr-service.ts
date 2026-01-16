/**
 * ASR Service
 *
 * 統一管理 ASR 功能模組的所有 API 呼叫
 */

import type { ASRResponse } from '../types'

// ============================================================================
// Configuration
// ============================================================================

const getASRApiUrl = () =>
  process.env.NEXT_PUBLIC_ASR_API_URL || 'https://rd_service.msi.com.tw/ai_api'

/** ASR 語言設定 */
export const asrConfig = {
  defaultLanguage: 'cmn-Hant-TW',
  languages: [
    { code: 'cmn-Hant-TW', label: '中文 (臺灣)' },
    { code: 'cmn-Hans-CN', label: '中文 (簡體)' },
    { code: 'en-US', label: '英文 (美國)' },
    { code: 'en-GB', label: '英文 (英國)' },
    { code: 'ja-JP', label: '日語' }
  ]
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 執行語音辨識
 * @param file 音訊檔案
 * @param languageCode 語言代碼
 * @returns 辨識結果
 */
export async function recognizeSpeech(
  file: File,
  languageCode: string
): Promise<ASRResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language-code', languageCode)
  formData.append('Token', '0UET8Lal6hBBqNSE')

  const res = await fetch(`${getASRApiUrl()}/asr`, {
    method: 'POST',
    body: formData
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || '識別失敗')
  }

  return data
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 驗證音訊檔案格式
 * @param file 要驗證的檔案
 * @returns 是否為有效的音訊格式
 */
export function validateAudioFormat(file: File): boolean {
  return file.name.toLowerCase().endsWith('.wav')
}
