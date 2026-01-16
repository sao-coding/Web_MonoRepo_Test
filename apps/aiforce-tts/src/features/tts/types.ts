/**
 * TTS Feature Types
 */

/** TTS 語言設定項目 */
export interface TTSLanguage {
  code: string
  label: string
}

/** TTS 設定 */
export interface TTSConfig {
  defaultLanguage: string
  languages: TTSLanguage[]
}

/** TTS API 請求 */
export interface TTSRequest {
  text: string
  languageCode: string
  token: string
}

/** TTS 歷史項目 */
export interface HistoryItem {
  text: string
  audioUrl: string
}

/** 語言驗證結果 */
export interface LanguageValidationResult {
  isValid: boolean
  message?: string
}
