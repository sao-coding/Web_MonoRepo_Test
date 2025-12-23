/**
 * ProductSpec Feature - Type Definitions
 *
 * 集中管理 ProductSpec 功能模組的所有型別定義
 */

// ============================================================================
// Core Types
// ============================================================================

/** 對話記錄項目 */
export interface RecordItem {
  chatId: number
  title: string
}

/** 對話詳情 */
export interface RecordDetail {
  question: string
  answer: string
  isGood: boolean | null
  comment: string | null
  recordDetailId: number
  isWeb: boolean
}

/** 對話項目（用於 UI 渲染） */
export interface ConversationItem {
  question: string
  answer: string
  comment: string | null
  recordDetailId: number
  isGood: boolean | null
  isWeb: boolean
}

/** AI 模型 */
export interface Model {
  id: number
  name: string
  modelId: string
  provider: string | null
  description: string | null
  modelType: string
  state: string
  isDefault: string
  aliases: string
  recommend: string
}

/** 參考資料項目（API 回傳格式） */
export interface ReferenceItem {
  web_path: string | null
  web_title: string | null
  method: string
  qa_text: string
  scores: number
  is_web: boolean
}

/** 參考資料項目（已格式化） */
export interface FormattedReferenceItem {
  id: number
  webPath: string
  webTitle: string
  qaText: string
  scores: number
  method: string
  isWeb: boolean
  language: string
  createDate: string
  used: boolean
}

// ============================================================================
// Note Types
// ============================================================================

/** 記事項目 */
export interface NoteItem {
  noteId: number
  title: string
  content: string
  createDate: string
  updateTime: string
}

/** 記事列表項目 */
export interface NotesListItem {
  fCreateDate: string
  fUpdateTime: string
  fStat: string
  fKeyin: string
  fMasterTable: number
  fMasterId: number
  fTitle: string
  fContent: string
  fSeqNo: number
}

/** 記事資訊（含參考資料） */
export interface NoteInfo {
  noteInfo: NoteItem[]
  referenceData: NoteReferenceItem[]
  isWeb: boolean
  recordDetailId: number
}

/** 記事參考資料項目 */
export interface NoteReferenceItem {
  id: number
  title: string
  path: string
  reference: string
  score: number
  type: string
  language: string
  createDate: string
}

// ============================================================================
// Feedback Types
// ============================================================================

/** 反饋狀態 */
export interface FeedbackState {
  isGoodEnabled: boolean
  feedBackEnabled: boolean
}

// ============================================================================
// Parameter Types
// ============================================================================

/** 參數設定 */
export interface ParameterSettings {
  temperature: number
  threshold: number
  userPrompt: string
  model: string
}

// ============================================================================
// API Request Types
// ============================================================================

/** 建立新聊天請求 */
export interface CreateChatRequest {
  userId: string | number | undefined
  title: string
  firstQuestion: string
}

/** 建立新聊天回應 */
export interface CreateChatResponse {
  success?: boolean
  status?: string
  chatId: number
  message?: string
  data?: {
    success: boolean
    chatId: number
    message?: string
  }
}

/** 插入對話詳情請求 */
export interface InsertRecordDetailRequest {
  userId: string | number | undefined
  question: string
  title: string
  answer: string
  chatId: string | null
  temperature: number
  threshold: number
  userPrompt: string
  model: string
  isWeb: boolean
}

/** 插入對話詳情回應 */
export interface InsertRecordDetailResponse {
  recordDetailId: number
  record: {
    fSeqNo: number
  }
}

/** 發送訊息請求 */
export interface SendMessageRequest {
  user_id: string | number | undefined
  chat_id: string
  query: string
  temperature: number
  threshold: number
  user_prompt: string
  search_web: boolean
  model: string
}

/** 反饋請求 */
export interface FeedbackRequest {
  recordDetailId: number
  isGood: boolean | null
  comment: string | null
  userId: string | number | undefined
}

/** 插入參考資料請求 */
export interface InsertReferenceRequest {
  recordDetailId: number
  referenceDataItems: EnrichedReferenceItem[]
  userId: string | number | undefined
}

/** 豐富的參考資料項目（含產品 ID） */
export interface EnrichedReferenceItem {
  webPath: string
  webTitle: string
  qaText: string
  scores: number
  method: string
  isWeb: boolean
  productIds: number[]
}

// ============================================================================
// Product Spec Types
// ============================================================================

/** 產品規格項目 */
export interface SpecItem {
  specName: string
  specValue: string
  masterTable: string
  masterId: string
}

/** 產品資訊 */
export interface ProductInfo {
  productId: string
  productTitle: string
  productModelName: string
  productLine: string
  productPicture: string | null
}

// ============================================================================
// Hook Return Types
// ============================================================================

/** useProductSpecChat 回傳型別 */
export interface UseProductSpecChatReturn {
  /** 發送訊息 */
  sendMessage: (userInput: string) => Promise<void>
  /** 是否正在載入 */
  isLoading: boolean
  /** 當前 streaming 訊息 */
  currentStreamMessage: string
  /** 當前使用者問題 */
  currentUserQuestion: string
  /** 是否啟用網路搜尋 */
  isWebSearchEnabled: boolean
  /** 切換網路搜尋 */
  toggleWebSearch: () => void
}

/** useProductSpecParameters 回傳型別 */
export interface UseProductSpecParametersReturn {
  /** 創意度 */
  creativity: number
  /** 設定創意度 */
  setCreativity: (value: number) => void
  /** 閾值 */
  valueDegree: number
  /** 設定閾值 */
  setValueDegree: (value: number) => void
  /** 提示詞 */
  promptInput: string
  /** 設定提示詞 */
  setPromptInput: (value: string) => void
  /** 獲取參數 */
  fetchParameters: (recordId: number) => Promise<void>
  /** 重設參數 */
  resetParameters: () => void
}
