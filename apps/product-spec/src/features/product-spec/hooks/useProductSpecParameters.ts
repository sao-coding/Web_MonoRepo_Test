'use client'

import type { Model, UseProductSpecParametersReturn } from '../types'

import { useCallback, useState } from 'react'

import { getParameters } from '../services/productSpecService'

export interface UseProductSpecParametersOptions {
  /** 使用者 ID */
  userId?: string | number
  /** 模型列表（用於重設時選擇預設模型） */
  models: Model[]
  /** 設定選中的模型 ID */
  setSelectedModelId: (id: number | null) => void
}

/**
 * useProductSpecParameters Hook
 *
 * 管理 ProductSpec 聊天參數（創意度、閾值、提示詞）
 *
 * @example
 * ```tsx
 * const {
 *   creativity,
 *   setCreativity,
 *   valueDegree,
 *   setValueDegree,
 *   promptInput,
 *   setPromptInput,
 *   fetchParameters,
 *   resetParameters,
 * } = useProductSpecParameters({
 *   userId: user?.userId,
 *   models,
 *   setSelectedModelId,
 * })
 * ```
 */
export function useProductSpecParameters({
  userId,
  models,
  setSelectedModelId,
}: UseProductSpecParametersOptions): UseProductSpecParametersReturn {
  const [creativity, setCreativityState] = useState(0.1)
  const [valueDegree, setValueDegreeState] = useState(1)
  const [promptInput, setPromptInputState] = useState('')

  const setCreativity = useCallback((value: number) => {
    setCreativityState(value)
  }, [])

  const setValueDegree = useCallback((value: number) => {
    setValueDegreeState(value)
  }, [])

  const setPromptInput = useCallback((value: string) => {
    setPromptInputState(value)
  }, [])

  const fetchParametersFromServer = useCallback(async (recordId: number) => {
    if (!userId)
      return

    try {
      const data = await getParameters(userId, recordId)
      setCreativityState(data.temperature || 0.1)
      setValueDegreeState(data.threshold || 1)
      setPromptInputState(data.userPrompt || '')

      // 根據模型 ID 設定選中的模型
      const matchedModel = models.find(model => model.modelId === data.model)
      if (matchedModel) {
        setSelectedModelId(matchedModel.id)
      }
    }
    catch (err) {
      console.error('使用者最後使用的參數設定--獲取失敗:', err)
    }
  }, [userId, models, setSelectedModelId])

  const resetParameters = useCallback(() => {
    setCreativityState(0.1)
    setValueDegreeState(1)
    setPromptInputState('')

    // 選擇預設模型
    const defaultModel = models.find(model => model.isDefault === '1')
    if (defaultModel) {
      setSelectedModelId(defaultModel.id)
    }
  }, [models, setSelectedModelId])

  return {
    creativity,
    setCreativity,
    valueDegree,
    setValueDegree,
    promptInput,
    setPromptInput,
    fetchParameters: fetchParametersFromServer,
    resetParameters,
  }
}

export default useProductSpecParameters
