'use client'

/**
 * useImg2Text Hook
 *
 * 管理圖片轉文字功能的狀態和邏輯
 */

import type { HistoryItem, ImageAnalysisResponse } from '../types'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import { analyzeImage, validateImageFormat } from '../services/img2text-service'

export interface UseImg2TextReturn {
  // 狀態
  data: ImageAnalysisResponse | null
  loading: boolean
  preview: string | null
  imgPreview: string | null
  history: HistoryItem[]

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement | null>
  typedRef: React.RefObject<HTMLSpanElement | null>

  // 方法
  previewFile: (file: File | undefined) => void
  handleSubmit: () => Promise<void>
  clearResults: () => void
  triggerFileInput: () => void
  cancelPreview: () => void
}

/**
 * 圖片轉文字狀態管理 Hook
 */
export function useImg2Text(): UseImg2TextReturn {
  const [data, setData] = useState<ImageAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const fileRef = useRef<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const typedRef = useRef<HTMLSpanElement | null>(null)

  const previewFile = useCallback((file: File | undefined) => {
    if (file) {
      if (!validateImageFormat(file)) {
        toast.error('請上傳 JPG 或 PNG 格式的圖片')
        setPreview(null)
        fileRef.current = null
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        fileRef.current = file
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
      fileRef.current = null
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!fileRef.current) {
      toast.error('請選擇檔案')
      return
    }

    setLoading(true)
    setImgPreview(preview)
    setPreview(null)

    try {
      const result = await analyzeImage(fileRef.current)
      setData(result)

      // 添加到歷史紀錄
      if (result.text && preview) {
        setHistory((prev) => [...prev, { text: result.text, imageUrl: preview }])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('提交圖片時發生錯誤')
    } finally {
      setLoading(false)
      fileRef.current = null
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [preview])

  const clearResults = useCallback(() => {
    setData(null)
    setImgPreview(null)
  }, [])

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const cancelPreview = useCallback(() => {
    setPreview(null)
    fileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  return {
    data,
    loading,
    preview,
    imgPreview,
    history,
    fileInputRef,
    typedRef,
    previewFile,
    handleSubmit,
    clearResults,
    triggerFileInput,
    cancelPreview
  }
}
