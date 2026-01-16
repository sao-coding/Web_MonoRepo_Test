/**
 * Img2Text Service
 *
 * 統一管理 Img2Text 功能模組的所有 API 呼叫
 */

import type { ImageAnalysisResponse } from '../types'

import { getAppConfig } from '@msi/config/env'

// ============================================================================
// Configuration
// ============================================================================

const getImg2TextApiUrl = () =>
  getAppConfig().NEXT_PUBLIC_IMG2TEXT_API_URL || 'https://rd_service.msi.com.tw/ai_api'

// ============================================================================
// API Functions
// ============================================================================

/**
 * 分析圖片並生成文字描述
 * @param imageFile 要分析的圖片檔案
 * @returns 圖片的文字描述
 */
export async function analyzeImage(imageFile: File): Promise<ImageAnalysisResponse> {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('Token', '0UET8Lal6hBBqNSE')

  const res = await fetch(`${getImg2TextApiUrl()}/describe-image`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    throw new Error(`伺服器錯誤: ${res.status}`)
  }

  return res.json()
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 驗證圖片檔案格式
 * @param file 要驗證的檔案
 * @returns 是否為有效的圖片格式
 */
export function validateImageFormat(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png']
  return validTypes.includes(file.type)
}
