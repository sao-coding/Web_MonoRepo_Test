'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { AppConfig, translateConfig } from '@/config/asr'

interface HistoryItem {
  file: string
  text: string
}

interface UseAsrReturn {
  selectedFile: string
  selectedFileObj: File | null
  message: string
  isLoading: boolean
  history: HistoryItem[]
  language: string
  dragActive: boolean
  setLanguage: (lang: string) => void
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSendMessage: () => Promise<void>
  clearSelectedFile: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export function useAsr(): UseAsrReturn {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [language, setLanguage] = useState(translateConfig.default_language)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  // 處理文件拖拽事件
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // 處理文件拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.name.toLowerCase().endsWith('.wav')) {
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
  }

  // 處理文件選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFileObj(file)
      setSelectedFile(file.name)
    }
  }

  // 清除已選文件
  const clearSelectedFile = () => {
    setSelectedFile('')
    setSelectedFileObj(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 發送識別請求
  const handleSendMessage = async () => {
    const inputFile = fileInputRef.current?.files?.[0] || selectedFileObj

    if (!inputFile) {
      toast.error('請選擇音檔')
      return
    }

    setMessage('')
    setIsLoading(true)
    setSelectedFile(inputFile.name)

    const formData = new FormData()
    formData.append('file', inputFile)
    formData.append('language-code', language)
    formData.append('Token', '0UET8Lal6hBBqNSE')

    try {
      const res = await fetch(`${AppConfig.serviceApiUrl}/asr`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!res.ok) {
        console.error('error:', data)
        if (data.error?.includes('Input audio channel count must be 1')) {
          toast.error('請確認音檔是否為單聲道')
        } else {
          toast.error(data.error || '識別失敗')
        }
        setIsLoading(false)
        return
      }

      setMessage(data.output)
      setHistory((prev) => [...prev, { file: inputFile.name, text: data.output }])
    } catch (error) {
      console.error('ASR API 錯誤:', error)
      toast.error('識別過程中發生錯誤，請稍後重試')
    } finally {
      setIsLoading(false)
    }
  }

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

export default useAsr
