'use client'

/**
 * TTS (文字轉語音) 首頁
 *
 * 此頁面作為 TTS Zone 的入口點
 * 路徑: /AI_City/tts
 */

import { useAuth } from '@msi/auth'
import { Button } from '@msi/ui/components/button'
import { ChatHeader, ChatLayout, ChatMessage } from '@msi/ui/components/chat-layout'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@msi/ui/components/dialog'
import { CopyIcon, FileTextIcon, Volume2Icon } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { DefaltInfo } from '@/components/defalt-info'
import { TextInputArea } from '@/components/text-input-area'
import { ttsConfig, TtsSidebar } from '@/components/tts-sidebar'

interface HistoryItem {
  text: string
  audioUrl: string
}

const TTS_LOGO_URL = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-tts.png'

const AppConfig = {
  serviceApiUrl: process.env.NEXT_PUBLIC_TTS_API_URL || 'https://rd_service.msi.com.tw/ai_api'
}

export default function TTSPage() {
  // Auth hook
  const { user, logout } = useAuth()

  // TTS states
  const [userInput, setUserInput] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [language, setLanguage] = useState(ttsConfig.default_language)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Dialog state
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 登出處理
  const handleLogout = () => {
    const success = logout()
    if (success) {
      toast.success('已登出')
      const { protocol, hostname, port } = window.location
      const portSuffix = port ? `:${port}` : ''
      window.location.href = `${protocol}//${hostname}${portSuffix}/AI_City/login`
    } else {
      toast.error('登出失敗')
    }
  }

  // 語言偵測
  const detectLanguage = (text: string): 'zh' | 'en' => {
    const chineseRatio = (text.match(/[\u4E00-\u9FFF]/g) || []).length / text.length
    const englishRatio = (text.match(/[a-z]/gi) || []).length / text.length
    if (chineseRatio > 0.3) return 'zh'
    if (englishRatio > 0.3) return 'en'
    return 'en'
  }

  // 驗證語言匹配
  const validateLanguageMatch = (inputText: string, selectedLanguage: string) => {
    const detected = detectLanguage(inputText)
    const normalizedSelected = selectedLanguage.split('-')[0]
    if (detected === normalizedSelected) return { isValid: true }
    const langNames: Record<string, string> = { zh: '中文', en: '英文' }
    const detectedLangName = langNames[detected]
    const selectedLangName = ttsConfig.languages.find((l) => l.code === selectedLanguage)?.label || selectedLanguage
    return {
      isValid: false,
      message: `偵測到您輸入的是${detectedLangName}，但您選擇的語言是${selectedLangName}。請檢查語言設定。`
    }
  }

  // 發送訊息處理
  const handleSendMessage = async () => {
    const input = userInput.trim()
    if (!input) {
      toast.error('請輸入訊息')
      return
    }

    const validation = validateLanguageMatch(input, language)
    if (!validation.isValid) {
      toast.error(validation.message || '語言不匹配，請檢查語言設定')
      return
    }

    setAudioUrl('')
    setUserMessage(input)
    setUserInput('')
    setIsLoading(true)

    try {
      const res = await fetch(`${AppConfig.serviceApiUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
          'language-code': language,
          Token: '0UET8Lal6hBBqNSE'
        })
      })

      if (!res.ok) {
        toast.error(`伺服器錯誤: ${res.status}`)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setHistory((prev) => [...prev, { text: input, audioUrl: url }])
    } catch (error) {
      console.error('TTS API 錯誤:', error)
      toast.error('生成語音時發生錯誤，請稍後重試')
    } finally {
      setIsLoading(false)
    }
  }

  // 處理歷史項目點擊
  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedHistoryItem(item)
    setIsDialogOpen(true)
  }

  // 判斷是否顯示預設狀態
  const showDefaultInfo = !userMessage && !audioUrl && !isLoading

  return (
    <>
      <ChatLayout
        leftSidebar={
          <TtsSidebar
            history={history}
            language={language}
            onLanguageChange={setLanguage}
            onHistoryItemClick={handleHistoryItemClick}
          />
        }
        header={
          <ChatHeader
            userName={user?.name}
            userId={user?.userId}
            onLogout={handleLogout}
          />
        }
      >
        <div className='flex h-full flex-col overflow-hidden'>
          {/* 對話內容區 */}
          <div
            className={`flex-1 overflow-y-auto p-4 sm:p-6 ${
              showDefaultInfo ? 'flex flex-col items-center justify-center' : ''
            }`}
          >
            {showDefaultInfo ? (
              <div className='mt-[-10vh] flex w-full max-w-3xl flex-col items-center justify-center gap-8'>
                <DefaltInfo title='說書人' avatarUrl={TTS_LOGO_URL}>
                  在下方輸入任何文字，AI 將轉換為自然的語音。
                  支援多種語言和聲音風格。
                </DefaltInfo>
                <TextInputArea
                  value={userInput}
                  onChange={setUserInput}
                  onSubmit={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className='mx-auto flex w-full max-w-4xl flex-col gap-4 pb-4'>
                {/* 使用者輸入 */}
                {userMessage && (
                  <ChatMessage type='user' content={userMessage} />
                )}

                {/* AI 正在思考 */}
                {isLoading && !audioUrl && (
                  <ChatMessage type='assistant' content='' avatarUrl={TTS_LOGO_URL} isLoading />
                )}

                {/* 語音結果 */}
                {audioUrl && (
                  <ChatMessage
                    type='assistant'
                    content=''
                    avatarUrl={TTS_LOGO_URL}
                    actions={
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          navigator.clipboard.writeText(userMessage)
                          toast.success('已複製文字到剪貼板')
                        }}
                      >
                        <CopyIcon className='size-4' />
                      </Button>
                    }
                    extraContent={
                      <div className='mt-2 w-full'>
                        <audio src={audioUrl} controls className='w-full' />
                      </div>
                    }
                  />
                )}
              </div>
            )}
          </div>

          {/* 底部輸入區域 (有訊息時顯示) */}
          {!showDefaultInfo && (
            <div className='dark:bg-background shrink-0 bg-white p-4'>
              <TextInputArea
                value={userInput}
                onChange={setUserInput}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                maxWidthClass='max-w-4xl'
              />
            </div>
          )}
        </div>
      </ChatLayout>

      {/* 歷史詳情彈窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Volume2Icon className='size-5 text-blue-500' />
              轉換紀錄詳情
            </DialogTitle>
            <DialogDescription>
              查看完整文字內容並播放語音
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryItem && (
            <div className='space-y-4'>
              <div className='rounded-lg bg-gray-50 p-4 dark:bg-zinc-800'>
                <p className='text-sm leading-relaxed break-words whitespace-pre-wrap'>
                  {selectedHistoryItem.text}
                </p>
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    navigator.clipboard.writeText(selectedHistoryItem.text)
                    toast.success('已複製到剪貼板')
                  }}
                >
                  <FileTextIcon className='mr-2 size-4' />
                  複製文字
                </Button>
              </div>

              <div className='border-t pt-4'>
                <audio src={selectedHistoryItem.audioUrl} controls className='w-full' />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
