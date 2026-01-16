'use client'

/**
 * useAsr Hook
 *
 * 管理 ASR（語音辨識）功能的狀態和邏輯
 */

import type { HistoryItem } from '../types'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import { asrConfig, recognizeSpeech, validateAudioFormat } from '../services/asr-service'

export interface UseAsrReturn {
  // 狀態
  selectedFile: string
  selectedFileObj: File | null
  message: string
  isLoading: boolean
  history: HistoryItem[]
  language: string
  dragActive: boolean

  // 方法
  setLanguage: (lang: string) => void
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSendMessage: () => Promise<void>
  clearSelectedFile: () => void

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

/**
 * ASR 狀態管理 Hook
 */
export function useAsr(): UseAsrReturn {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [language, setLanguage] = useState(asrConfig.defaultLanguage)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  // 處理文件拖拽事件
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // 處理文件拖放
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0]
      if (validateAudioFormat(file)) {
        setSelectedFileObj(file)
        setSelectedFile(file.name)
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInputRef.current.files = dataTransfer.files
        }
      } else {
        toast.error('請選擇WAV格式的音檔')
      }
    }
  }, [])

  // 處理文件選擇
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setSelectedFileObj(file)
      setSelectedFile(file.name)
    }
  }, [])

  // 清除已選文件
  const clearSelectedFile = useCallback(() => {
    setSelectedFile('')
    setSelectedFileObj(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // 發送識別請求
  const handleSendMessage = useCallback(async () => {
    const inputFile = fileInputRef.current?.files?.[0] || selectedFileObj

    if (!inputFile) {
      toast.error('請選擇音檔')
      return
    }

    setMessage('')
    setIsLoading(true)
    setSelectedFile(inputFile.name)

    try {
      const data = await recognizeSpeech(inputFile, language)
      setMessage(data.output)
      setHistory((prev) => [...prev, { file: inputFile.name, text: data.output }])
    } catch (error) {
      console.error('ASR API 錯誤:', error)
      const errorMessage = error instanceof Error ? error.message : '識別過程中發生錯誤'
      if (errorMessage.includes('Input audio channel count must be 1')) {
        toast.error('請確認音檔是否為單聲道')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedFileObj, language])

  return {
    selectedFile,
    selectedFileObj,
    message,
    isLoading,
    history,
    language,
    dragActive,
    setLanguage,
    handleDrag,
    handleDrop,
    handleFileChange,
    handleSendMessage,
    clearSelectedFile,
    fileInputRef
  }
}

export { asrConfig }
