'use client'

import { useCallback, useState } from 'react'

export interface FeedbackState {
  isGoodEnabled: boolean
  feedBackEnabled: boolean
}

export interface UseFeedbackOptions {
  /** API 基礎 URL */
  apiBaseUrl?: string
  /** 使用者 ID */
  userId?: string | number
}

export interface UseFeedbackReturn {
  /** 反饋狀態（按 recordDetailId 索引） */
  feedbackStates: Record<number, FeedbackState>
  /** 已提交的反饋文字 */
  activeFeedback: Record<number, string>
  /** 是否已送出新反饋 */
  newFeedback: Record<number, boolean>
  /** 是否顯示點讚狀態 */
  isGood: Record<number, boolean>
  /** 是否顯示點踩狀態 */
  unGood: Record<number, boolean>
  /** 是否顯示記事按鈕 */
  noteEnabled: Record<number, boolean>
  /** 切換點讚狀態 */
  toggleIsGood: (recordDetailId: number) => void
  /** 切換反饋面板 */
  toggleFeedback: (recordDetailId: number) => void
  /** 提交反饋 */
  submitFeedback: (recordDetailId: number, feedback: string) => void
  /** 發送反饋到 API */
  sendFeedback: (recordDetailId: number, isGood: boolean | null, feedback?: string | null) => Promise<void>
  /** 新增記事 */
  insertNote: (recordDetailId: number) => Promise<void>
  /** 設定顯示按鈕狀態 */
  setButtonVisibility: (recordDetailId: number, options: { isGood?: boolean, unGood?: boolean, note?: boolean }) => void
}

/**
 * useFeedback Hook
 *
 * 管理對話反饋狀態（點讚、點踩、文字反饋、記事）
 *
 * @example
 * ```tsx
 * const { feedbackStates, toggleIsGood, submitFeedback } = useFeedback({
 *   apiBaseUrl: process.env.NEXT_PUBLIC_API_URL,
 *   userId: user?.userId,
 * })
 * ```
 */
export function useFeedback({ apiBaseUrl, userId }: UseFeedbackOptions = {}): UseFeedbackReturn {
  const [feedbackStates, setFeedbackStates] = useState<Record<number, FeedbackState>>({})
  const [activeFeedback, setActiveFeedback] = useState<Record<number, string>>({})
  const [newFeedback, setNewFeedback] = useState<Record<number, boolean>>({})
  const [isGood, setIsGood] = useState<Record<number, boolean>>({})
  const [unGood, setUnGood] = useState<Record<number, boolean>>({})
  const [noteEnabled, setNoteEnabled] = useState<Record<number, boolean>>({})

  const sendFeedback = useCallback(async (
    recordDetailId: number,
    isGoodValue: boolean | null,
    feedback: string | null = null,
  ) => {
    if (!apiBaseUrl) {
      return
    }

    try {
      await fetch(`${apiBaseUrl}/api/aicity/productspec/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordDetailId,
          isGood: isGoodValue,
          comment: feedback,
          userId,
        }),
      })
      if (feedback) {
        setActiveFeedback(prev => ({ ...prev, [recordDetailId]: feedback }))
      }
    }
    catch (err) {
      console.error('POST 反饋API錯誤:', err)
    }
  }, [apiBaseUrl, userId])

  const toggleIsGood = useCallback((recordDetailId: number) => {
    setFeedbackStates((prev) => {
      const current = prev[recordDetailId] || { isGoodEnabled: false, feedBackEnabled: false }
      const newIsGoodEnabled = !current.isGoodEnabled

      // 發送反饋
      if (newIsGoodEnabled) {
        sendFeedback(recordDetailId, true)
      }
      else {
        sendFeedback(recordDetailId, null)
      }

      return {
        ...prev,
        [recordDetailId]: {
          isGoodEnabled: newIsGoodEnabled,
          feedBackEnabled: false,
        },
      }
    })
  }, [sendFeedback])

  const toggleFeedback = useCallback((recordDetailId: number) => {
    setFeedbackStates(prev => ({
      ...prev,
      [recordDetailId]: {
        isGoodEnabled: false,
        feedBackEnabled: !prev[recordDetailId]?.feedBackEnabled,
      },
    }))
  }, [])

  const submitFeedback = useCallback((recordDetailId: number, feedback: string) => {
    sendFeedback(recordDetailId, false, feedback)
    setFeedbackStates(prev => ({
      ...prev,
      [recordDetailId]: { isGoodEnabled: false, feedBackEnabled: false },
    }))
    setIsGood(prev => ({ ...prev, [recordDetailId]: false }))
    setUnGood(prev => ({ ...prev, [recordDetailId]: false }))
    setNewFeedback(prev => ({ ...prev, [recordDetailId]: true }))
  }, [sendFeedback])

  const insertNote = useCallback(async (recordDetailId: number) => {
    if (!apiBaseUrl) {
      return
    }

    try {
      await fetch(`${apiBaseUrl}/api/aicity/productspec/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordDetailId,
          userId,
        }),
      })
    }
    catch (err) {
      console.error('儲存記事API：', err)
    }
    finally {
      setNoteEnabled(prev => ({ ...prev, [recordDetailId]: false }))
    }
  }, [apiBaseUrl, userId])

  const setButtonVisibility = useCallback((
    recordDetailId: number,
    options: { isGood?: boolean, unGood?: boolean, note?: boolean },
  ) => {
    if (options.isGood !== undefined) {
      setIsGood(prev => ({ ...prev, [recordDetailId]: options.isGood! }))
    }
    if (options.unGood !== undefined) {
      setUnGood(prev => ({ ...prev, [recordDetailId]: options.unGood! }))
    }
    if (options.note !== undefined) {
      setNoteEnabled(prev => ({ ...prev, [recordDetailId]: options.note! }))
    }
  }, [])

  return {
    feedbackStates,
    activeFeedback,
    newFeedback,
    isGood,
    unGood,
    noteEnabled,
    toggleIsGood,
    toggleFeedback,
    submitFeedback,
    sendFeedback,
    insertNote,
    setButtonVisibility,
  }
}

export default useFeedback
