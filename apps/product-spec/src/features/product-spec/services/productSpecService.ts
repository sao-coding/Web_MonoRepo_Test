/**
 * ProductSpec Service
 *
 * 統一管理 ProductSpec 功能模組的所有 API 呼叫
 * 將 API 邏輯從元件中抽離，提供可重用的服務層
 */

import { getAppConfig } from '@msi/config/env'
import type {
  CreateChatRequest,
  CreateChatResponse,
  EnrichedReferenceItem,
  FeedbackRequest,
  FormattedReferenceItem,
  InsertRecordDetailRequest,
  InsertRecordDetailResponse,
  Model,
  NoteInfo,
  NotesListItem,
  ParameterSettings,
  ProductInfo,
  RecordDetail,
  RecordItem,
  ReferenceItem,
  SpecItem,
} from '../types'

// ============================================================================
// Configuration
// ============================================================================

const getPatentApiUrl = () => getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL
const getAiApiUrl = () => getAppConfig().NEXT_PUBLIC_AI_API_URL

// ============================================================================
// History & Conversation APIs
// ============================================================================

/**
 * 獲取使用者的聊天歷史記錄列表
 */
export async function getHistory(userId: string | number): Promise<RecordItem[]> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/history?userId=${userId}`,
    { method: 'GET' },
  )
  if (!res.ok) {
    throw new Error('獲取紀錄失敗')
  }
  return res.json()
}

/**
 * 獲取特定對話的詳細內容
 */
export async function getRecordDetail(seqNo: number): Promise<{ qaPairs: RecordDetail[] }> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/history/${seqNo}`,
    { method: 'GET' },
  )
  if (!res.ok) {
    throw new Error('獲取對話詳情失敗')
  }
  return res.json()
}

/**
 * 獲取特定聊天的參數設定
 */
export async function getParameters(
  userId: string | number,
  chatId: number,
): Promise<ParameterSettings> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/parameters?userId=${userId}&chatId=${chatId}`,
    { method: 'GET' },
  )
  if (!res.ok) {
    throw new Error('獲取參數設定失敗')
  }
  return res.json()
}

/**
 * 建立新的聊天會話
 */
export async function createNewChat(data: CreateChatRequest): Promise<CreateChatResponse> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/chat/new`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) {
    throw new Error('創建新聊天會話失敗')
  }
  return res.json()
}

/**
 * 插入對話詳情記錄
 */
export async function insertRecordDetail(
  data: InsertRecordDetailRequest,
): Promise<InsertRecordDetailResponse> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/history`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) {
    throw new Error('保存對話失敗')
  }
  return res.json()
}

// ============================================================================
// AI Message API (Streaming)
// ============================================================================

/**
 * 發送訊息到 AI（返回 Response 供串流處理）
 */
export async function sendMessageToAI(
  userId: string | number | undefined,
  chatId: string,
  query: string,
  options: {
    temperature: number
    threshold: number
    userPrompt: string
    searchWeb: boolean
    model: string
  },
): Promise<Response> {
  const aiApiUrl = getAiApiUrl()
  if (!aiApiUrl) {
    throw new Error('API URL is not configured')
  }

  const requestBody = {
    user_id: userId,
    chat_id: chatId,
    query,
    temperature: options.temperature,
    threshold: options.threshold,
    user_prompt: options.userPrompt,
    search_web: options.searchWeb,
    model: options.model,
  }

  const res = await fetch(`${aiApiUrl}/spec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }

  return res
}

// ============================================================================
// Reference APIs
// ============================================================================

/**
 * 插入參考資料
 */
export async function insertReference(
  recordDetailId: number,
  referenceDataItems: EnrichedReferenceItem[],
  userId: string | number | undefined,
): Promise<void> {
  await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/reference-data`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordDetailId,
        referenceDataItems,
        userId,
      }),
    },
  )
}

/**
 * 獲取參考資料
 */
export async function getReferenceData(recordDetailId: number): Promise<{
  data: { referenceData: FormattedReferenceItem[] }
}> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/reference-data/${recordDetailId}`,
    { method: 'GET' },
  )
  if (!res.ok) {
    throw new Error('獲取參考資料失敗')
  }
  return res.json()
}

/**
 * 獲取產品規格
 */
export async function getProductSpec(
  mktName: string,
  language: string = 'en',
): Promise<{
  data: {
    productInfo: ProductInfo
    specifications: SpecItem[]
  }
}> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/reference/${mktName}/specifications?language=${language}`,
    { method: 'GET' },
  )
  if (!res.ok) {
    throw new Error('獲取產品規格失敗')
  }
  return res.json()
}

/**
 * 根據產品名稱獲取 ProductId
 */
export async function getProductIdByName(
  mktName: string,
  language: string = 'en',
): Promise<number | null> {
  try {
    const data = await getProductSpec(mktName, language)
    return data.data.productInfo?.productId ? Number(data.data.productInfo.productId) : null
  }
  catch {
    return null
  }
}

// ============================================================================
// Feedback API
// ============================================================================

/**
 * 發送反饋
 */
export async function sendFeedback(data: FeedbackRequest): Promise<void> {
  await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/feedback`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
}

// ============================================================================
// Notes APIs
// ============================================================================

/**
 * 獲取使用者的記事列表
 */
export async function getNotes(userId: string | number): Promise<NotesListItem[]> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/notes?userId=${userId}`,
    { method: 'GET' },
  )
  if (!res.ok) {
    throw new Error('獲取記事列表失敗')
  }
  return res.json()
}

/**
 * 新增記事
 */
export async function insertNote(
  recordDetailId: number,
  userId: string | number | undefined,
): Promise<void> {
  await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/notes`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordDetailId, userId }),
    },
  )
}

/**
 * 獲取記事詳情（含參考資料）
 */
export async function getNoteDetail(noteId: number): Promise<NoteInfo> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/notes/${noteId}/references/detail`,
    { method: 'GET' },
  )
  if (!res.ok) {
    throw new Error('獲取記事內容失敗')
  }
  const data = await res.json()
  return {
    noteInfo: [data.noteInfo],
    referenceData: data.referenceData,
    isWeb: data.isWeb,
    recordDetailId: data.recordDetailId,
  }
}

/**
 * 更新記事標題
 */
export async function updateNoteTitle(noteId: number, title: string): Promise<void> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/notes/${noteId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    },
  )
  if (!res.ok) {
    throw new Error('更新標題失敗')
  }
}

/**
 * 刪除記事
 */
export async function deleteNote(noteId: number): Promise<void> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/notes/${noteId}`,
    { method: 'DELETE' },
  )
  if (!res.ok) {
    throw new Error('刪除記事失敗')
  }
}

// ============================================================================
// Models API
// ============================================================================

/**
 * 獲取可用的 AI 模型列表
 */
export async function getModels(): Promise<Model[]> {
  const res = await fetch(
    `${getPatentApiUrl()}/api/aicity/productspec/models`,
    { method: 'GET' },
  )
  if (!res.ok) {
    throw new Error('獲取模型列表失敗')
  }
  return res.json()
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 從 QA 文字中提取產品名稱
 */
export function extractProductNamesFromText(qaText: string): string[] {
  if (!qaText)
    return []
  const productNames: string[] = []
  const regex = /data-product="([^"]*)"/g
  const matches = qaText.matchAll(regex)
  for (const match of matches) {
    const productName = match[1]
    if (productName && !productNames.includes(productName)) {
      productNames.push(productName)
    }
  }
  return productNames
}

/**
 * 處理參考資料並豐富 productIds
 */
export async function enrichReferenceItems(
  items: ReferenceItem[],
): Promise<EnrichedReferenceItem[]> {
  return Promise.all(
    items.map(async (item) => {
      const productNames = extractProductNamesFromText(item.qa_text || '')
      let productIds: number[] = []
      if (productNames.length > 0) {
        const productIdPromises = productNames.map(name => getProductIdByName(name))
        const results = await Promise.all(productIdPromises)
        productIds = results.filter((id): id is number => id !== null)
      }
      return {
        webPath: item.web_path || '',
        webTitle: item.web_title || '',
        qaText: item.qa_text || '',
        scores: item.scores,
        method: item.method,
        isWeb: item.is_web,
        productIds,
      }
    }),
  )
}

// ============================================================================
// Export as namespace for convenient usage
// ============================================================================

export const productSpecService = {
  // History & Conversation
  getHistory,
  getRecordDetail,
  getParameters,
  createNewChat,
  insertRecordDetail,

  // AI Message
  sendMessageToAI,

  // Reference
  insertReference,
  getReferenceData,
  getProductSpec,
  getProductIdByName,

  // Feedback
  sendFeedback,

  // Notes
  getNotes,
  insertNote,
  getNoteDetail,
  updateNoteTitle,
  deleteNote,

  // Models
  getModels,

  // Utilities
  extractProductNamesFromText,
  enrichReferenceItems,
}

export default productSpecService
