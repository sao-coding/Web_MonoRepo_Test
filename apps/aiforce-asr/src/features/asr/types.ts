/**
 * ASR Feature Types
 */

/** ASR 語言設定項目 */
export interface ASRLanguage {
  code: string
  label: string
}

/** ASR 設定 */
export interface ASRConfig {
  defaultLanguage: string
  languages: ASRLanguage[]
}

/** ASR API 請求 */
export interface ASRRequest {
  file: File
  languageCode: string
  token: string
}

/** ASR API 回應 */
export interface ASRResponse {
  output: string
  error?: string
}

/** ASR 歷史項目 */
export interface HistoryItem {
  file: string
  text: string
}
