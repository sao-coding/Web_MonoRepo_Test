'use client'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
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
  CheckIcon,
  CopyIcon,
  Repeat,
  SendHorizontalIcon
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

// Translation configuration
const translateConfig = {
  default_source_language: { code: 'en', label: 'English' },
  default_target_language: { code: 'zh-TW', label: '繁體中文' },
  languages: [
    { code: 'en', label: 'English' },
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
    { code: 'it', label: 'Italiano' },
    { code: 'ru', label: 'Русский' },
    { code: 'th', label: 'ไทย' },
    { code: 'vi', label: 'Tiếng Việt' }
  ]
}

const AppConfig = {
  serviceApiUrl: process.env.NEXT_PUBLIC_TRANSLATE_API_URL || 'https://rd_service.msi.com.tw/ai_api'
}

export default function TranslatePage() {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [userMessage, setUserMessage] = useState('')
  const [userInput, setUserInput] = useState('')
  const [message, setMessage] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState(translateConfig.default_source_language.code)
  const [targetLanguage, setTargetLanguage] = useState(translateConfig.default_target_language.code)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<Array<{ input: string; output: string }>>([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{ input: string; output: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSendMessage = async () => {
    const input = inputRef.current?.value
    if (!input?.trim()) {
      toast.error('請輸入訊息')
      return
    }

    setMessage('')
    setUserMessage(input)
    inputRef.current!.value = ''
    setUserInput('')
    setIsLoading(true)

    try {
      const res = await fetch(`${AppConfig.serviceApiUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
          source_language_code: sourceLanguage,
          target_language_code: targetLanguage,
          Token: '0UET8Lal6hBBqNSE'
        })
      })

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

      const data = await res.json()
      setMessage(data.output)
      setHistory((prev) => [...prev, { input, output: data.output }])
    } catch (error) {
      console.error('翻譯錯誤:', error)
      toast.error('翻譯過程中發生錯誤，請稍後重試')
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

  const swapLanguages = () => {
    const temp = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(temp)
    toast.info('已交換翻譯語言')
  }

  const copyToClipboard = () => {
    if (message) {
      navigator.clipboard.writeText(message)
      setCopied(true)
      toast.success('已複製翻譯結果')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className='bg-background flex min-h-screen'>
      {/* Sidebar */}
      <div className='bg-muted/30 flex w-80 flex-col gap-4 border-r p-4'>
        <div className='text-center'>
          <h1 className='text-xl font-bold'>AI 翻譯</h1>
          <p className='text-muted-foreground text-sm'>跨越語言障礙，實現無縫溝通</p>
        </div>

        {/* Language Selection */}
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm'>語言設定</CardTitle>
              <Button variant='outline' size='sm' onClick={swapLanguages}>
                <Repeat className='mr-1 size-3.5' />
                交換
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center gap-2 text-sm'>
              <span className='w-14 font-medium'>原文:</span>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className='flex-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {translateConfig.languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <span className='w-14 font-medium'>譯文:</span>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className='flex-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {translateConfig.languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card className='flex-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm'>翻譯紀錄</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[400px]'>
              {history.length > 0 ? (
                <div className='space-y-2'>
                  {history.slice().reverse().map((item, index) => (
                    <div
                      key={index}
                      className='bg-muted cursor-pointer rounded-md p-3 text-sm hover:bg-muted/80'
                      onClick={() => setSelectedHistoryItem(item)}
                    >
                      <p className='text-primary line-clamp-1 font-medium'>{item.input}</p>
                      <p className='text-muted-foreground line-clamp-2'>{item.output}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-center'>尚無翻譯紀錄</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className='flex flex-1 flex-col'>
        {/* Translation Display */}
        <div className='flex-1 overflow-auto p-6'>
          {!userMessage && !message && !isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='max-w-md text-center'>
                <h2 className='mb-2 text-2xl font-bold'>專業翻譯服務</h2>
                <p className='text-muted-foreground'>
                  在下方輸入文字，選擇所需的語言，我們將為您提供高品質的翻譯結果。
                  支援 {translateConfig.languages.length} 種語言！
                </p>
              </div>
            </div>
          ) : (
            <div className='mx-auto max-w-3xl space-y-4'>
              {userMessage && (
                <div className='flex justify-end'>
                  <div className='bg-primary/10 max-w-[80%] rounded-2xl p-4'>
                    <p className='whitespace-pre-wrap'>{userMessage}</p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className='flex gap-3'>
                  <img className='size-8 rounded-full' src='https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png' alt='' />
                  <div className='bg-muted size-5 animate-bounce rounded-full'></div>
                </div>
              )}

              {message && (
                <div className='group flex gap-3'>
                  <img className='size-8 rounded-full' src='https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png' alt='' />
                  <Card className='relative flex-1'>
                    <CardContent className='p-4'>
                      <p className='whitespace-pre-wrap'>{message}</p>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='absolute top-2 right-2 opacity-0 group-hover:opacity-100'
                        onClick={copyToClipboard}
                      >
                        {copied ? <CheckIcon className='size-4' /> : <CopyIcon className='size-4' />}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className='border-t p-4'>
          <div className='mx-auto max-w-3xl'>
            <div className='bg-background flex items-end gap-2 rounded-2xl border p-3 shadow-lg'>
              <Textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='在此輸入需要翻譯的文字...'
                className='min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0'
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                size='icon'
                className='size-10 shrink-0 rounded-full'
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
      <Dialog open={!!selectedHistoryItem} onOpenChange={(open) => !open && setSelectedHistoryItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>翻譯詳情</DialogTitle>
          </DialogHeader>
          {selectedHistoryItem && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-muted-foreground mb-1 text-sm font-medium'>原文:</h3>
                <div className='bg-muted rounded-md p-3'>{selectedHistoryItem.input}</div>
              </div>
              <div>
                <h3 className='text-muted-foreground mb-1 text-sm font-medium'>譯文:</h3>
                <div className='bg-muted rounded-md p-3'>{selectedHistoryItem.output}</div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    navigator.clipboard.writeText(selectedHistoryItem.output)
                    toast.success('已複製譯文')
                  }}
                >
                  <CopyIcon className='mr-1 size-4' />
                  複製譯文
                </Button>
                <Button size='sm' onClick={() => setSelectedHistoryItem(null)}>關閉</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
