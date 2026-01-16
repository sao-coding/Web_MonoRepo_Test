'use client'

/**
 * useTts Hook
 *
 * 管理 TTS 功能的狀態和邏輯
 */

import type { HistoryItem, TTSConfig } from '../types'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { convertTextToSpeech, validateLanguageMatch } from '../services/tts-service'

/** TTS 設定 */
export const ttsConfig: TTSConfig = {
  defaultLanguage: 'zh-TW',
  languages: [
    { code: 'zh-TW', label: '中文（臺灣）' },
    { code: 'zh-CN', label: '中文（簡體）' },
    { code: 'en-US', label: '英文（美國）' },
    { code: 'en-GB', label: '英文（英國）' },
    { code: 'ja-JP', label: '日語' },
    { code: 'ko-KR', label: '韓語' },
    { code: 'de-DE', label: '德語' },
    { code: 'fr-FR', label: '法語' },
    { code: 'es-ES', label: '西班牙語' }
  ]
}

export interface UseTtsReturn {
  // 狀態
  userInput: string
  setUserInput: (value: string) => void
  userMessage: string
  audioUrl: string
  language: string
  setLanguage: (value: string) => void
  isLoading: boolean
  history: HistoryItem[]

  // 方法
  sendMessage: () => Promise<void>
  showDefaultInfo: boolean
}

/**
 * TTS 狀態管理 Hook
 */
export function useTts(): UseTtsReturn {
  const [userInput, setUserInput] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [language, setLanguage] = useState(ttsConfig.defaultLanguage)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const sendMessage = useCallback(async () => {
    const input = userInput.trim()
    if (!input) {
      toast.error('請輸入訊息')
      return
    }

    const validation = validateLanguageMatch(input, language, ttsConfig.languages)
    if (!validation.isValid) {
      toast.error(validation.message || '語言不匹配，請檢查語言設定')
      return
    }

    setAudioUrl('')
    setUserMessage(input)
    setUserInput('')
    setIsLoading(true)

    try {
      const url = await convertTextToSpeech(input, language)
      setAudioUrl(url)
      setHistory((prev) => [...prev, { text: input, audioUrl: url }])
    } catch (error) {
      console.error('TTS API 錯誤:', error)
      toast.error('生成語音時發生錯誤，請稍後重試')
    } finally {
      setIsLoading(false)
    }
  }, [userInput, language])

  const showDefaultInfo = !userMessage && !audioUrl && !isLoading

  return {
    userInput,
    setUserInput,
    userMessage,
    audioUrl,
    language,
    setLanguage,
    isLoading,
    history,
    sendMessage,
    showDefaultInfo
  }
}
