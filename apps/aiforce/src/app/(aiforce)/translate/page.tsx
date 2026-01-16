'use client'

import {
  CheckIcon,
  CopyIcon,
  Repeat,
  SendHorizontalIcon,
} from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import BannerWrapper from '@/components/banner/BannerWrapper'
import DefaltInfo from '@/components/chat-robot/defalt-info'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import LeftSidebar from '@/components/ui/left-sidebar'
import { Textarea } from '@/components/ui/textarea'
import { AppConfig, translateConfig } from '@/config/translate'

const HomePage = () => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [userMessage, setUserMessage] = React.useState<string>('')
  const [userInput, setUserInput] = React.useState<string>('')
  const [message, setMessage] = React.useState<string>('')
  const [sourceLanguage, setSourceLanguage] = React.useState<string>(
    translateConfig.default_source_language.code,
  )
  const [targetLanguage, setTargetLanguage] = React.useState<string>(
    translateConfig.default_target_language.code,
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [history, setHistory] = useState<
    Array<{ input: string, output: string }>
  >([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{
    input: string
    output: string
  } | null>(null)
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input,
          source_language_code: sourceLanguage,
          target_language_code: targetLanguage,
          Token: '0UET8Lal6hBBqNSE',
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const data = await res.json()
      setMessage(data.output)

      // 添加到翻譯歷史
      setHistory(prev => [...prev, { input, output: data.output }])
    }
    catch (error) {
      console.error('翻譯錯誤:', error)
      toast.error('翻譯過程中發生錯誤，請稍後重試')
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value)
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
    <div className="flex h-[100vh]">
      <LeftSidebar
        headerDescription="跨越語言障礙，實現無縫溝通。支援33種語言的高品質翻譯。"
        showNewButton={false}
        showNoteButton={false}
        onNewButtonClick={() => {}}
        onNoteButtonClick={() => {}}
        RecordsSectionLabel="翻譯紀錄"
        showRecordsSection={true}
        recordsSectionContent={(
          <>
            {history.length > 0
              ? (
                  <>
                    {history
                      .slice()
                      .reverse()
                      .map((item, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 p-3 mb-2 rounded-md text-sm cursor-pointer hover:bg-gray-200"
                          onClick={() => setSelectedHistoryItem(item)}
                        >
                          <p className="text-blue-600 font-bold mb-1 line-clamp-1">
                            {item.input}
                          </p>
                          <p className="text-gray-400 line-clamp-2">{item.output}</p>
                        </div>
                      ))}
                    {/* 历史记录详情对话框 */}
                    <Dialog
                      open={!!selectedHistoryItem}
                      onOpenChange={open => !open && setSelectedHistoryItem(null)}
                    >
                      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader className="sticky top-0 bg-white z-10">
                          <DialogTitle>翻譯詳情</DialogTitle>
                        </DialogHeader>

                        {selectedHistoryItem && (
                          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-1">
                                原文:
                              </h3>
                              <div className="bg-gray-50 p-3 rounded-md text-gray-800 whitespace-pre-wrap break-words">
                                {selectedHistoryItem.input}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-1">
                                譯文:
                              </h3>
                              <div className="bg-gray-50 p-3 rounded-md text-gray-800 whitespace-pre-wrap break-words">
                                {selectedHistoryItem.output}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    selectedHistoryItem.output,
                                  )
                                  toast.success('已複製譯文')
                                }}
                              >
                                <CopyIcon className="h-4 w-4 mr-1" />
                                複製譯文
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setSelectedHistoryItem(null)}
                              >
                                關閉
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </>
                )
              : (
                  <div className="text-gray-300 text-center">
                    尚無翻譯紀錄
                  </div>
                )}
          </>
        )}
      >
        <>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                當前語言
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={swapLanguages}
                className="h-7 px-2 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Repeat className="h-3.5 w-3.5 mr-1" />
                交換
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="font-medium w-16 text-gray-600">原文:</span>
              <select
                className="flex-1 bg-gray-50 p-1.5 rounded border"
                value={sourceLanguage}
                onChange={e => setSourceLanguage(e.target.value)}
              >
                {translateConfig.languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium w-16 text-gray-600">譯文:</span>
              <select
                className="flex-1 bg-gray-50 p-1.5 rounded border"
                value={targetLanguage}
                onChange={e => setTargetLanguage(e.target.value)}
              >
                {translateConfig.languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </>
      </LeftSidebar>

      {/* 主要內容區域 */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <BannerWrapper />
        {/* 翻譯內容顯示區域 */}
        <div className={`flex flex-col flex-1
          ${!userMessage && !message && !isLoading && 'justify-center'}`}
        >
          <div
            className={`p-4 sm:p-6 sm:pt-4 overflow-y-auto
              ${!userMessage && !message && !isLoading ? 'justify-center flex flex-col' : 'flex-1'}`}
          >
            {!userMessage && !message && !isLoading && (
              <DefaltInfo
                title="專業翻譯服務"
              >
                在下方輸入文字，選擇所需的語言，我們將為您提供高品質的翻譯結果。支援
                {translateConfig.languages.length}
                種語言！
              </DefaltInfo>
            )}
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              {userMessage && (
                <div className="flex justify-end ml-10">
                  <div className="bg-secondary p-3 rounded-xl inline-block whitespace-pre-wrap break-words">
                    {userMessage}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
                  <div className="shrink-0 ltr:mr-3 rtl:ml-3 @lg:flex mt-1  svelte-1u5gq5j">
                    <img className="size-8 assistant-message-profile-image object-cover rounded-full" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" />
                  </div>
                  <div className="bg-gray-300 p-2 rounded-full w-5 h-5 animate-bounce"></div>
                </div>
              )}

              {message && (
                <div className="flex justify-between px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
                  <div className="shrink-0 ltr:mr-3 rtl:ml-3 @lg:flex mt-1  svelte-1u5gq5j">
                    <img className="size-8 assistant-message-profile-image object-cover rounded-full" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" />
                  </div>
                  <div className="flex-1 flex-col flex gap-2">
                    <div className="break-words relative group">
                      {message}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded hover:bg-white shadow-sm"
                        onClick={copyToClipboard}
                      >
                        {copied
                          ? (
                              <CheckIcon className="h-4 w-4" />
                            )
                          : (
                              <CopyIcon className="h-4 w-4" />
                            )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 輸入區域 - 固定在底部 */}
          <div
            className={`mb-6 w-full flex-shrink-0 px-2.5 mx-auto inset-x-0
            ${!userMessage && !message && !isLoading ? 'max-w-3xl' : 'max-w-6xl'}`}
          >
            <div className="mx-auto flex flex-col gap-2">
              <div className="flex-1 flex flex-col relative w-full shadow-lg rounded-3xl border border-gray-50 dark:border-gray-850 hover:border-gray-100 focus-within:border-gray-100 hover:dark:border-gray-800 focus-within:dark:border-gray-800 transition px-1 bg-white/90 dark:bg-gray-400/5 dark:text-gray-100 px-3 py-2">
                <div className="flex gap-2 items-start">
                  <Textarea
                    id="input"
                    ref={inputRef}
                    onKeyDown={handleKeyDown}
                    onChange={handleInputChange}
                    rows={3}
                    value={userInput}
                    className="scrollbar-hidden rtl:text-right ltr:text-left bg-transparent dark:text-gray-100 outline-hidden w-full pt-2.5 pb-[5px] px-1 resize-none h-fit max-h-80 overflow-auto border-0 focus:ring-0 focus:outline-none shadow-none bg-transparent focus-visible:ring-0 shadow-none"
                    placeholder="在此輸入需要翻譯的文字..."
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                    size="icon"
                    className="h-10 w-10 rounded-full mt-1"
                  >
                    {isLoading
                      ? (
                          <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
                        )
                      : (
                          <SendHorizontalIcon className="h-5 w-5" />
                        )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
