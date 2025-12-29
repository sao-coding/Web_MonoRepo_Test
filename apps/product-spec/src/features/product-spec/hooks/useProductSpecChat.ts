'use client'

import type {
  ConversationItem,
  CreateChatResponse,
  ReferenceItem,
  UseProductSpecChatReturn
} from '../types'

import { getAppConfig } from '@msi/config/env'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  createNewChat,
  enrichReferenceItems,
  insertRecordDetail,
  insertReference
} from '../services/productSpecService'

export interface UseProductSpecChatOptions {
  /** 使用者 ID */
  userId?: string | number
  /** 當前選中的記錄 ID */
  activeRecordId: number | null
  /** 設定當前選中的記錄 ID */
  setActiveRecordId: (id: number | null) => void
  /** 新增對話到列表 */
  addConversation: (conversation: ConversationItem) => void
  /** 重新獲取歷史記錄 */
  fetchRecords: () => Promise<void>
  /** 模型 ID */
  modelId: string
  /** 參數設定 */
  parameters: {
    creativity: number
    valueDegree: number
    promptInput: string
  }
  /** 設定反饋按鈕可見性 */
  setButtonVisibility?: (recordDetailId: number, options: { isGood?: boolean, unGood?: boolean, note?: boolean }) => void
}

/**
 * useProductSpecChat Hook
 *
 * 處理 ProductSpec 聊天核心邏輯，包含發送訊息、串流接收、參考資料處理
 *
 * @example
 * ```tsx
 * const { sendMessage, isLoading, currentStreamMessage } = useProductSpecChat({
 *   userId: user?.userId,
 *   activeRecordId,
 *   setActiveRecordId,
 *   addConversation,
 *   fetchRecords,
 *   modelId: selectedModel?.modelId,
 *   parameters: { creativity, valueDegree, promptInput },
 * })
 * ```
 */
export function useProductSpecChat({
  userId,
  activeRecordId,
  setActiveRecordId,
  addConversation,
  fetchRecords,
  modelId,
  parameters,
  setButtonVisibility
}: UseProductSpecChatOptions): UseProductSpecChatReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStreamMessage, setCurrentStreamMessage] = useState('')
  const [currentUserQuestion, setCurrentUserQuestion] = useState('')
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false)

  const toggleWebSearch = useCallback(() => {
    setIsWebSearchEnabled((prev) => !prev)
  }, [])

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput?.trim()) {
      toast.error('請輸入訊息')
      return
    }

    const currentQuestion = userInput
    setCurrentUserQuestion(currentQuestion)
    setIsLoading(true)
    setCurrentStreamMessage('')

    let currentRecordId = activeRecordId

    // 如果沒有 activeRecordId，建立新的聊天會話
    if (!currentRecordId) {
      try {
        const response = await createNewChat({
          userId,
          title: currentQuestion,
          firstQuestion: currentQuestion
        })

        const data = (response.data || response) as CreateChatResponse

        if ((data.success || (response).status === 'success') && data.chatId) {
          currentRecordId = data.chatId
          setActiveRecordId(data.chatId)
          fetchRecords()
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        else {
          throw new Error(data.message || '創建新聊天會話失敗')
        }
      }
      catch (error) {
        console.error('創建新聊天會話錯誤:', error)
        toast.error('創建新聊天會話失敗')
        setIsLoading(false)
        setCurrentUserQuestion('')
        return
      }
    }

    let referenceData: ReferenceItem[] | null = null
    let output = ''
    let shouldSave = false

    try {
      const aiApiUrl = getAppConfig().NEXT_PUBLIC_AI_API_URL
      if (!aiApiUrl) {
        throw new Error('API URL is not configured')
      }

      const requestBody = {
        user_id: userId,
        chat_id: currentRecordId ? currentRecordId.toString() : '',
        query: currentQuestion,
        temperature: parameters.creativity,
        threshold: parameters.valueDegree,
        user_prompt: parameters.promptInput,
        search_web: isWebSearchEnabled,
        model: modelId || 'Qwen/Qwen2.5-VL-72B-Instruct-AWQ'
      }

      const res = await fetch(`${aiApiUrl}/spec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let buffer = ''

      while (!done) {
        if (reader) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          buffer += decoder.decode(value || new Uint8Array(), { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const cleaned = line.trim().replace(/^data:\s*/, '')
            if (!cleaned)
              continue
            try {
              const json = JSON.parse(cleaned)
              if (json.data && Array.isArray(json.data)) {
                referenceData = json.data as ReferenceItem[]
                continue
              }
              if (json.output === '__END__') {
                shouldSave = true
                continue
              }
              if (json.output !== undefined) {
                output += json.output
                setCurrentStreamMessage((prev) => prev + json.output)
              }
            }
            catch (parseError) {
              console.warn('無法解析的 JSON:', cleaned, parseError)
            }
          }
        }
      }

      // 處理剩餘的 buffer
      if (buffer.length > 0) {
        const cleaned = buffer.trim().replace(/^data:\s*/, '')
        if (cleaned) {
          try {
            const json = JSON.parse(cleaned)
            if (json.data && Array.isArray(json.data)) {
              referenceData = json.data as ReferenceItem[]
            }
            else if (json.output === '__END__') {
              shouldSave = true
            }
            else if (json.output !== undefined) {
              output += json.output
              setCurrentStreamMessage((prev) => prev + json.output)
            }
          }
          catch (e) {
            console.warn('無法解析的 JSON (結尾):', cleaned, e)
          }
        }
      }

      // 保存對話
      if (shouldSave) {
        let finalRecordDetailId: number | null = null
        try {
          const result = await insertRecordDetail({
            userId,
            question: currentQuestion,
            title: currentQuestion,
            answer: output,
            chatId: currentRecordId ? currentRecordId.toString() : null,
            temperature: parameters.creativity,
            threshold: parameters.valueDegree,
            userPrompt: parameters.promptInput,
            model: modelId || 'Qwen/Qwen2.5-VL-72B-Instruct-AWQ',
            isWeb: isWebSearchEnabled
          })

          if (result) {
            const { recordDetailId } = result
            finalRecordDetailId = recordDetailId

            // 設定按鈕可見性
            if (setButtonVisibility) {
              setButtonVisibility(recordDetailId, { isGood: true, unGood: true, note: true })
            }

            // 新增對話到列表
            addConversation({
              question: currentQuestion,
              answer: output,
              recordDetailId,
              isGood: null,
              comment: null,
              isWeb: isWebSearchEnabled
            })

            fetchRecords()
          }
        }
        catch (insertError) {
          console.error('保存對話失敗:', insertError)
          toast.error('保存對話失敗')
        }

        // 保存參考資料
        if (finalRecordDetailId && referenceData && referenceData.length > 0) {
          try {
            const enrichedItems = await enrichReferenceItems(referenceData)
            await insertReference(finalRecordDetailId, enrichedItems, userId)
          }
          catch (refError) {
            console.error('保存參考資料失敗:', refError)
          }
        }
      }
    }
    catch (error) {
      console.error('API 調用錯誤:', error)
      toast.error('發生錯誤，請稍後重試')
    }
    finally {
      setCurrentUserQuestion('')
      setIsLoading(false)
      setIsWebSearchEnabled(false)
    }
  }, [
    userId,
    activeRecordId,
    setActiveRecordId,
    addConversation,
    fetchRecords,
    modelId,
    parameters,
    isWebSearchEnabled,
    setButtonVisibility
  ])

  return {
    sendMessage,
    isLoading,
    currentStreamMessage,
    currentUserQuestion,
    isWebSearchEnabled,
    toggleWebSearch
  }
}

export default useProductSpecChat
