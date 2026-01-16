/**
 * Img2Text Feature Types
 */

/** 圖片分析 API 請求 */
export interface ImageAnalysisRequest {
  image: File
  token: string
}

/** 圖片分析 API 回應 */
export interface ImageAnalysisResponse {
  text: string
}

/** 分析歷史項目 */
export interface HistoryItem {
  text: string
  imageUrl: string
}
