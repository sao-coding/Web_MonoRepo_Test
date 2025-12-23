'use client'

import { getAppConfig } from '@msi/config/env'
import { useCallback, useEffect, useState } from 'react'

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

export interface UseModelsOptions {
  /** API 基礎 URL */
  apiBaseUrl?: string
  /** 自動載入 */
  autoLoad?: boolean
}

export interface UseModelsReturn {
  /** 模型列表 */
  models: Model[]
  /** 選中的模型 ID */
  selectedModelId: number | null
  /** 設定選中的模型 ID */
  setSelectedModelId: React.Dispatch<React.SetStateAction<number | null>>
  /** 選中的模型物件 */
  selectedModel: Model | undefined
  /** 是否正在載入 */
  isLoading: boolean
  /** 載入模型列表 */
  fetchModels: () => Promise<void>
  /** 選擇預設模型 */
  selectDefaultModel: () => void
}

/**
 * useModels Hook
 *
 * 管理 AI 模型列表的獲取和選擇
 *
 * @example
 * ```tsx
 * const { models, selectedModel, setSelectedModelId } = useModels({
 *   apiBaseUrl: process.env.NEXT_PUBLIC_API_URL,
 * })
 * ```
 */
export function useModels({ apiBaseUrl, autoLoad = true }: UseModelsOptions = {}): UseModelsReturn {
  const [models, setModels] = useState<Model[]>([])
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchModels = useCallback(async () => {
    const baseUrl = apiBaseUrl || getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL
    if (!baseUrl) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/aicity/productspec/models`, {
        method: 'GET',
      })
      const data: Model[] = await response.json()
      setModels(data)

      // 自動選擇預設模型
      const defaultModel = data.find(model => model.isDefault === '1')
      if (defaultModel) {
        setSelectedModelId(defaultModel.id)
      }
      else if (data.length > 0) {
        setSelectedModelId(data[0].id)
      }
    }
    catch (error) {
      console.error('Error fetching models:', error)
    }
    finally {
      setIsLoading(false)
    }
  }, [apiBaseUrl])

  const selectDefaultModel = useCallback(() => {
    const defaultModel = models.find(model => model.isDefault === '1')
    if (defaultModel) {
      setSelectedModelId(defaultModel.id)
    }
    else if (models.length > 0) {
      setSelectedModelId(models[0].id)
    }
  }, [models])

  const selectedModel = models.find(model => model.id === selectedModelId)

  useEffect(() => {
    if (autoLoad) {
      fetchModels()
    }
  }, [autoLoad, apiBaseUrl, fetchModels])

  return {
    models,
    selectedModelId,
    setSelectedModelId,
    selectedModel,
    isLoading,
    fetchModels,
    selectDefaultModel,
  }
}

export default useModels
