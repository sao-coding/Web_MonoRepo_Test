'use client'

import { getAppConfig } from '@msi/config/env'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface ConversationItem {
  question: string
  answer: string
  comment: string | null
  recordDetailId: number
  isGood: boolean | null
  isWeb: boolean
}

export interface RecordItem {
  chatId: number
  title: string
}

export interface UseConversationOptions {
  /** API 基礎 URL */
  apiBaseUrl?: string
  /** 使用者 ID */
  userId?: string | number
}

export interface UseConversationReturn {
  /** 對話記錄列表 */
  conversations: ConversationItem[]
  /** 設定對話記錄 */
  setConversations: React.Dispatch<React.SetStateAction<ConversationItem[]>>
  /** 歷史記錄列表 */
  records: RecordItem[]
  /** 設定歷史記錄 */
  setRecords: React.Dispatch<React.SetStateAction<RecordItem[]>>
  /** 當前選中的記錄 ID */
  activeRecordId: number | null
  /** 設定當前選中的記錄 ID */
  setActiveRecordId: React.Dispatch<React.SetStateAction<number | null>>
  /** 是否正在載入記錄 */
  isLoadingRecord: boolean
  /** 當前訊息內容（用於串流顯示） */
  message: string
  /** 設定當前訊息 */
  setMessage: React.Dispatch<React.SetStateAction<string>>
  /** 獲取歷史記錄列表 */
  fetchRecords: () => Promise<void>
  /** 載入特定記錄的對話詳情 */
  loadRecordDetails: (recordId: number) => Promise<void>
  /** 選擇記錄 */
  selectRecord: (recordId: number | null) => void
  /** 開始新對話 */
  startNewConversation: () => void
  /** 新增對話 */
  addConversation: (conversation: ConversationItem) => void
  /** 更新最後一則對話的答案 */
  updateLastAnswer: (answer: string) => void
}

interface RecordDetailResponse {
  qaPairs?: Array<{
    question: string
    answer: string
    isGood: boolean | null
    comment: string | null
    recordDetailId: number
    isWeb: boolean
  }>
}

/**
 * useConversation Hook
 *
 * 管理對話記錄和歷史記錄的狀態
 *
 * @example
 * ```tsx
 * const {
 *   conversations,
 *   records,
 *   activeRecordId,
 *   fetchRecords,
 *   selectRecord,
 * } = useConversation({
 *   apiBaseUrl: process.env.NEXT_PUBLIC_API_URL,
 *   userId: user?.userId,
 * })
 * ```
 */
export function useConversation({ apiBaseUrl, userId }: UseConversationOptions = {}): UseConversationReturn {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [records, setRecords] = useState<RecordItem[]>([])
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null)
  const [isLoadingRecord, setIsLoadingRecord] = useState(true)
  const [message, setMessage] = useState('')

  const fetchRecords = useCallback(async () => {
    const baseUrl = apiBaseUrl ?? getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL
    if (!baseUrl || !userId) {
      return
    }

    setIsLoadingRecord(true)
    try {
      const res = await fetch(
        `${baseUrl}/api/aicity/productspec/history?userId=${userId}`,
        { method: 'GET' }
      )
      if (res.ok) {
        const data = (await res.json()) as RecordItem[]
        setRecords(data)
      }
    }
    catch (err) {
      console.error('獲取紀錄失敗:', err)
      toast.error('獲取紀錄失敗')
    }
    finally {
      setIsLoadingRecord(false)
    }
  }, [apiBaseUrl, userId])

  const getRecordDetail = useCallback(async (seqNo: number): Promise<RecordDetailResponse | null> => {
    const baseUrl = apiBaseUrl ?? getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL
    if (!baseUrl) {
      return null
    }

    try {
      const res = await fetch(
        `${baseUrl}/api/aicity/productspec/history/${seqNo}`,
        { method: 'GET' }
      )
      return (await res.json()) as RecordDetailResponse
    }
    catch (err) {
      console.error('API 錯誤:', err)
      return null
    }
  }, [apiBaseUrl])

  const loadRecordDetails = useCallback(async (recordId: number) => {
    try {
      const details = await getRecordDetail(recordId)
      if (details?.qaPairs && details.qaPairs.length > 0) {
        const loadedConversations: ConversationItem[] = details.qaPairs.map((detail) => ({
          question: detail.question,
          answer: detail.answer,
          isGood: detail.isGood,
          comment: detail.comment,
          recordDetailId: detail.recordDetailId,
          isWeb: detail.isWeb
        }))

        setConversations(loadedConversations)
        if (loadedConversations.length > 0) {
          const lastAnswer = loadedConversations[loadedConversations.length - 1].answer
          setMessage(lastAnswer)
        }
      }
    }
    catch (err) {
      console.error('載入對話詳情失敗:', err)
      toast.error('載入對話詳情失敗')
    }
  }, [getRecordDetail])

  const selectRecord = useCallback((recordId: number | null) => {
    if (activeRecordId === recordId) {
      return
    }
    setActiveRecordId(recordId)
  }, [activeRecordId])

  const startNewConversation = useCallback(() => {
    setActiveRecordId(null)
    setConversations([])
    setMessage('')
  }, [])

  const addConversation = useCallback((conversation: ConversationItem) => {
    setConversations((prev) => [...prev, conversation])
  }, [])

  const updateLastAnswer = useCallback((answer: string) => {
    setConversations((prev) => {
      if (prev.length === 0) return prev
      const updated = [...prev]
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        answer
      }
      return updated
    })
    setMessage(answer)
  }, [])

  return {
    conversations,
    setConversations,
    records,
    setRecords,
    activeRecordId,
    setActiveRecordId,
    isLoadingRecord,
    message,
    setMessage,
    fetchRecords,
    loadRecordDetails,
    selectRecord,
    startNewConversation,
    addConversation,
    updateLastAnswer
  }
}

export default useConversation
