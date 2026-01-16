/**
 * TTS Service
 *
 * 統一管理 TTS 功能模組的所有 API 呼叫
 */

import type { LanguageValidationResult, TTSRequest } from '../types'

import { getAppConfig } from '@msi/config/env'

// ============================================================================
// Configuration
// ============================================================================

const getTTSApiUrl = () => getAppConfig().NEXT_PUBLIC_TTS_API_URL || 'https://rd_service.msi.com.tw/ai_api'

// ============================================================================
// API Functions
// ============================================================================

/**
 * 將文字轉換為語音
 * @param text 要轉換的文字
 * @param languageCode 語言代碼 (e.g., 'zh-TW', 'en-US')
 * @returns 音訊 Blob 的 Object URL
 */
export async function convertTextToSpeech(
  text: string,
  languageCode: string
): Promise<string> {
  const request: TTSRequest = {
    text,
    languageCode,
    token: '0UET8Lal6hBBqNSE'
  }

  const res = await fetch(`${getTTSApiUrl()}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: request.text,
      'language-code': request.languageCode,
      Token: request.token
    })
  })

  if (!res.ok) {
    throw new Error(`伺服器錯誤: ${res.status}`)
  }

  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 偵測文字的語言
 * @param text 要偵測的文字
 * @returns 'zh' 或 'en'
 */
export function detectLanguage(text: string): 'zh' | 'en' {
  const chineseRatio = (text.match(/[\u4E00-\u9FFF]/g) || []).length / text.length
  const englishRatio = (text.match(/[a-z]/gi) || []).length / text.length
  if (chineseRatio > 0.3) return 'zh'
  if (englishRatio > 0.3) return 'en'
  return 'en'
}

/**
 * 驗證輸入文字與選擇的語言是否匹配
 * @param inputText 輸入的文字
 * @param selectedLanguage 選擇的語言代碼
 * @param languages 可用語言列表
 * @returns 驗證結果
 */
export function validateLanguageMatch(
  inputText: string,
  selectedLanguage: string,
  languages: Array<{ code: string; label: string }>
): LanguageValidationResult {
  const detected = detectLanguage(inputText)
  const normalizedSelected = selectedLanguage.split('-')[0]

  if (detected === normalizedSelected) {
    return { isValid: true }
  }

  const langNames: Record<string, string> = { zh: '中文', en: '英文' }
  const detectedLangName = langNames[detected]
  const selectedLangName = languages.find((l) => l.code === selectedLanguage)?.label || selectedLanguage

  return {
    isValid: false,
    message: `偵測到您輸入的是${detectedLangName}，但您選擇的語言是${selectedLangName}。請檢查語言設定。`
  }
}
