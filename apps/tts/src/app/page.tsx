'use client'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@msi/ui'
import {
  FileTextIcon,
  InfoIcon,
  SendHorizontalIcon,
  Volume2Icon
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

// TTS configuration
const ttsConfig = {
  default_language: 'zh-TW',
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

const AppConfig = {
  serviceApiUrl: process.env.NEXT_PUBLIC_TTS_API_URL || 'https://rd_service.msi.com.tw/ai_api'
}

export default function TTSPage() {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [userMessage, setUserMessage] = useState('')
  const [userInput, setUserInput] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [language, setLanguage] = useState(ttsConfig.default_language)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<Array<{ text: string; audioUrl: string }>>([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{ text: string; audioUrl: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const detectLanguage = (text: string): 'zh' | 'en' => {
    const chineseRatio = (text.match(/[\u4E00-\u9FFF]/g) || []).length / text.length
    const englishRatio = (text.match(/[a-z]/gi) || []).length / text.length
    if (chineseRatio > 0.3) return 'zh'
    if (englishRatio > 0.3) return 'en'
    return 'en'
  }

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

  const handleSendMessage = async () => {
    const input = inputRef.current?.value
    if (!input?.trim()) {
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
    inputRef.current!.value = ''
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Sidebar */}
      <div className='w-80 border-r bg-muted/30 p-4 flex flex-col gap-4'>
        <div className='text-center'>
          <h1 className='text-xl font-bold'>語音合成 TTS</h1>
          <p className='text-sm text-muted-foreground'>將文字轉換為自然流暢的語音</p>
        </div>

        {/* Language Selection */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm flex items-center gap-1'>
              <InfoIcon className='size-4 text-blue-500' />
              語言設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ttsConfig.languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* History */}
        <Card className='flex-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm'>轉換紀錄</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[400px]'>
              {history.length > 0 ? (
                <div className='space-y-2'>
                  {history.slice().reverse().map((item, index) => (
                    <div
                      key={index}
                      className='rounded-md bg-muted p-3 text-sm cursor-pointer hover:bg-muted/80'
                      onClick={() => { setSelectedHistoryItem(item); setIsDialogOpen(true) }}
                    >
                      <div className='flex justify-between items-start'>
                        <p className='flex-1 line-clamp-2'>{item.text}</p>
                        <Volume2Icon className='size-4 text-blue-500 ml-2 shrink-0' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-center text-muted-foreground'>尚無轉換紀錄</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Content Display */}
        <div className='flex-1 p-6 overflow-auto'>
          {!userMessage && !audioUrl && !isLoading ? (
            <div className='h-full flex items-center justify-center'>
              <div className='text-center max-w-md'>
                <h2 className='text-2xl font-bold mb-2'>歡迎使用語音合成</h2>
                <p className='text-muted-foreground'>
                  在下方輸入任何文字，AI 將轉換為自然的語音。
                  支援 {ttsConfig.languages.length} 種語言！
                </p>
              </div>
            </div>
          ) : (
            <div className='max-w-3xl mx-auto space-y-4'>
              {userMessage && (
                <div className='flex justify-end'>
                  <div className='bg-primary/10 rounded-2xl p-4 max-w-[80%]'>
                    <p className='whitespace-pre-wrap'>{userMessage}</p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className='flex gap-3'>
                  <img className='size-8 rounded-full' src='https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png' alt='' />
                  <div className='animate-bounce size-5 rounded-full bg-muted'></div>
                </div>
              )}

              {audioUrl && (
                <div className='flex gap-3'>
                  <img className='size-8 rounded-full' src='https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png' alt='' />
                  <Card className='flex-1'>
                    <CardContent className='p-4'>
                      <audio src={audioUrl} controls className='w-full' />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className='p-4 border-t'>
          <div className='max-w-3xl mx-auto'>
            <div className='flex gap-2 items-end rounded-2xl border bg-background p-3 shadow-lg'>
              <Textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='在此輸入需要轉換為語音的文字...'
                className='min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0'
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                size='icon'
                className='size-10 rounded-full shrink-0'
              >
                {isLoading ? (
                  <div className='size-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <SendHorizontalIcon className='size-5' />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <FileTextIcon className='size-5 text-blue-500' />
              完整內容
            </DialogTitle>
            <DialogDescription>
              使用下方的音頻控制器聆聽語音
            </DialogDescription>
          </DialogHeader>
          {selectedHistoryItem && (
            <div className='space-y-4'>
              <div className='bg-muted p-4 rounded-lg'>
                <p className='whitespace-pre-wrap'>{selectedHistoryItem.text}</p>
              </div>
              <div className='flex gap-2 justify-end'>
                <Button
                  variant='outline'
                  onClick={() => {
                    navigator.clipboard.writeText(selectedHistoryItem.text)
                    toast.success('已複製到剪貼簿')
                  }}
                >
                  <FileTextIcon className='size-4 mr-2' />
                  複製文字
                </Button>
              </div>
              <div className='pt-2 border-t'>
                <audio src={selectedHistoryItem.audioUrl} controls className='w-full' />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
