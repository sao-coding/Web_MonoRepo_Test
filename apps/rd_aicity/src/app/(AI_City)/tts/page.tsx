'use client'

import {
  FileTextIcon,
  InfoIcon,
  SendHorizontalIcon,
  Volume2Icon,
} from 'lucide-react'

import React from 'react'
import { toast } from 'sonner'
import Banner from '@/components/banner-b'
import DefaltInfo from '@/components/chat-robot/defalt-info'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import LeftSidebar from '@/components/ui/left-sidebar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AppConfig, translateConfig } from '@/config/tts'

const HomePage = () => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [userMessage, setUserMessage] = React.useState<string>('')
  const [userInput, setUserInput] = React.useState<string>('')
  const [url, setUrl] = React.useState<string>('')
  const [language, setLanguage] = React.useState<string>(
    translateConfig.default_language,
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [history, setHistory] = React.useState<
    Array<{ text: string, audioUrl: string }>
  >([])
  const [selectedHistoryItem, setSelectedHistoryItem] = React.useState<
    { text: string, audioUrl: string } | null
  >(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false)

  // 檢測文字是中文還是英文
  const detectLanguage = (text: string): 'zh' | 'en' => {
    const chineseRatio = (text.match(/[\u4E00-\u9FFF]/g) || []).length / text.length
    const englishRatio = (text.match(/[a-z]/gi) || []).length / text.length

    // 判斷主要語言 (佔比超過 30%)
    if (chineseRatio > 0.3)
      return 'zh'
    if (englishRatio > 0.3)
      return 'en'

    // 預設返回英文
    return 'en'
  }

  // 驗證語言是否匹配
  const validateLanguageMatch = (
    inputText: string,
    selectedLanguage: string,
  ): { isValid: boolean, message?: string } => {
    const detected = detectLanguage(inputText)

    // 將語言代碼標準化 (en-US -> en, zh-CN -> zh)
    const normalizedSelected = selectedLanguage.split('-')[0]

    // 檢查是否匹配
    if (detected === normalizedSelected) {
      return { isValid: true }
    }

    // 產生錯誤訊息
    const langNames: Record<string, string> = {
      zh: '中文',
      en: '英文',
    }

    const detectedLangName = langNames[detected]
    const selectedLangName = translateConfig.languages.find(l => l.code === selectedLanguage)?.label || selectedLanguage

    return {
      isValid: false,
      message: `偵測到您輸入的是${detectedLangName},但您選擇的語言是${selectedLangName}。請檢查語言設定。`,
    }
  }

  const handleSendMessage = async () => {
    // if (!user) {
    //   toast.error('請先登入')
    //   return
    // }

    const input = inputRef.current?.value

    if (!input?.trim()) {
      toast.error('請輸入訊息')
      return
    }

    // 驗證語言是否匹配
    const validation = validateLanguageMatch(input, language)
    if (!validation.isValid) {
      toast.error(validation.message || '語言不匹配,請檢查語言設定')
      return
    }

    setUrl('')
    setUserMessage(input)
    inputRef.current!.value = ''
    setUserInput('')
    setIsLoading(true)

    try {
      const res = await fetch(`${AppConfig.serviceApiUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'text': input,
          'language-code': language,
          'Token': '0UET8Lal6hBBqNSE',
        }),
      })

      if (!res.ok) {
        // 嘗試讀取錯誤訊息
        let errorMessage = `HTTP 錯誤: ${res.status}`
        try {
          const errorData = await res.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
          else if (errorData.message) {
            errorMessage = errorData.message
          }
        }
        catch {
          // 如果無法解析 JSON，嘗試讀取文字
          try {
            const errorText = await res.text()
            if (errorText) {
              errorMessage = errorText
            }
          }
          catch {
            // 如果都失敗，使用預設錯誤訊息
            console.error('無法讀取錯誤訊息')
          }
        }

        console.error('伺服器錯誤:', errorMessage)

        // 根據狀態碼顯示不同的錯誤訊息
        if (res.status === 500) {
          toast.error('伺服器內部錯誤，請稍後重試或聯繫管理員')
        }
        else if (res.status === 400) {
          toast.error('請求參數錯誤，請檢查輸入內容')
        }
        else if (res.status === 401) {
          toast.error('身份驗證失敗，請重新登入')
        }
        else if (res.status === 403) {
          toast.error('沒有權限使用此功能')
        }
        else if (res.status >= 500) {
          toast.error('伺服器錯誤，請稍後重試')
        }
        else {
          toast.error(`請求失敗: ${errorMessage}`)
        }

        setIsLoading(false)
        return
      }

      // 輸出音檔
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setUrl(url)
      // const audio = new Audio(url)
      // audio.play()
      setIsLoading(false)

      // 添加到歷史記錄
      setHistory(prev => [...prev, { text: input, audioUrl: url }])

      // 自動播放要改到audio元素加載後才能調用
    }
    catch (error) {
      console.error('TTS API 錯誤:', error)

      // 檢查是否為網路連接問題
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('網路連接失敗，請檢查網路狀態')
      }
      else if (error instanceof Error) {
        // 顯示具體錯誤訊息
        toast.error(`生成語音時發生錯誤: ${error.message}`)
      }
      else {
        toast.error('生成語音時發生未知錯誤，請稍後重試')
      }
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

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const handleHistoryItemClick = (item: { text: string, audioUrl: string }, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // 所有文字都可以開啟彈窗
    setSelectedHistoryItem(item)
    setIsDialogOpen(true)
  }

  React.useEffect(() => {
    adjustTextareaHeight()
  }, [userInput])

  return (
    <div className="flex h-[100vh] overflow-y-auto">
      {/* 左側面板 */}
      <LeftSidebar
        headerDescription="將文字轉換為自然流暢的語音，支援多種語言和聲音風格。"
        showNewButton={false}
        showNoteButton={false}
        onNewButtonClick={() => {}}
        onNoteButtonClick={() => {}}
        RecordsSectionLabel="轉換紀錄"
        showRecordsSection={true}
        recordsSectionContent={(
          <>
            {history.length > 0
              ? (
                  <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 p-3 mb-2 rounded-md text-sm cursor-pointer hover:bg-gray-200"
                        onClick={e => handleHistoryItemClick(item, e)}
                      >
                        <div className="flex justify-between items-start">
                          <p className="line-clamp-2 flex-1">{item.text}</p>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <Volume2Icon className="w-4 h-4 text-blue-500" />
                          </div>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              playAudio(item.audioUrl)
                            }}
                          >
                            直接播放
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              : (
                  <div className="text-gray-300 text-center">
                    尚無轉換紀錄
                  </div>
                )}
          </>
        )}
      >
        <>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <InfoIcon className="w-4 h-4 text-blue-500" />
              當前語言
            </h3>
            <div className="bg-white p-2 rounded-md border text-sm">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full border-0 p-0 h-8 font-normal text-sm shadow-none hover:bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {translateConfig.languages.map(item => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      </LeftSidebar>

      {/* 彈跳视窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-blue-500" />
              完整內容
            </DialogTitle>
            <DialogDescription>
              使用下方的音頻控制器聆聽語音，或點擊複製按鈕保存文字內容
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {selectedHistoryItem.text}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedHistoryItem.text)
                    toast.success('已複製到剪貼板')
                  }}
                >
                  <FileTextIcon className="w-4 h-4 mr-2" />
                  複製文字
                </Button>
              </div>

              <div className="pt-2 border-t">
                <audio
                  src={selectedHistoryItem.audioUrl}
                  controls
                  className="w-full"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 主要內容區域 */}
      <div className="flex-1 flex flex-col">
        <Banner><>&nbsp;</></Banner>
        {/* 聊天/生成內容顯示區域 - 使用與翻譯頁面相同的樣式 */}
        <div className={`flex flex-col flex-1
          ${!userMessage && !url && !isLoading && 'justify-center'}`}
        >
          <div
            className={`p-4 sm:p-6 sm:pt-10 overflow-y-auto
              ${!userMessage && !url && !isLoading ? 'justify-center flex flex-col' : 'flex-1'}`}
          >
            {/* 歡迎提示，只在沒有對話內容時顯示 */}
            {!userMessage && !url && !isLoading && (
              <DefaltInfo
                title="歡迎使用說書人"
              >
                在下方輸入任何文字，AI
                將轉換為自然的語音。支援多種語言，讓您的文字有聲有色！
              </DefaltInfo>
            )}
            {/* 对话式显示 - 增加左右分隔 */}
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              {/* 用户消息 - 靠右顯示並增加右邊距 */}
              {userMessage && (
                <div className="flex justify-end ml-10">
                  <div className="bg-secondary p-3 rounded-xl inline-block whitespace-pre-wrap break-words">
                    {userMessage}
                  </div>
                </div>
              )}

              {/* 加载状态 */}
              {isLoading && (
                <div className="flex px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
                  <div className="shrink-0 ltr:mr-3 rtl:ml-3 @lg:flex mt-1  svelte-1u5gq5j">
                    <img className="size-8 assistant-message-profile-image object-cover rounded-full" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" />
                  </div>
                  <div className="bg-gray-300 p-2 rounded-full w-5 h-5 animate-bounce"></div>
                </div>
              )}

              {/* 语音結果 - 靠左顯示並增加左邊距 */}
              {url && (
                <div className="flex px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
                  <div className="shrink-0 ltr:mr-3 rtl:ml-3 @lg:flex mt-1  svelte-1u5gq5j">
                    <img className="size-8 assistant-message-profile-image object-cover rounded-full" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" />
                  </div>
                  <div className="flex-1 flex-col flex gap-2">
                    <div className="break-words relative group">
                      <audio src={url} controls className="w-full"></audio>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 輸入區域 */}
          <div
            className={`mb-6 w-full flex-shrink-0 px-2.5 mx-auto inset-x-0
            ${!userMessage && !url && !isLoading ? 'max-w-3xl' : 'max-w-6xl'}`}
          >
            <div className="mx-auto flex flex-col gap-2">
              <div className="flex-1 flex flex-col relative w-full shadow-lg rounded-3xl border border-gray-50 dark:border-gray-850 hover:border-gray-100 focus-within:border-gray-100 hover:dark:border-gray-800 focus-within:dark:border-gray-800 transition px-1 bg-white/90 dark:bg-gray-400/5 dark:text-gray-100 px-3 py-2">
                {/* <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <InfoIcon className="h-3.5 w-3.5" />
                    <span>輸入要轉換為語音的文字</span>
                  </div>
                </div> */}

                <div className="flex gap-2 items-start">
                  <Textarea
                    id="input"
                    ref={inputRef}
                    onKeyDown={handleKeyDown}
                    onChange={handleInputChange}
                    rows={3}
                    value={userInput}
                    className="scrollbar-hidden rtl:text-right ltr:text-left bg-transparent dark:text-gray-100 outline-hidden w-full pt-2.5 pb-[5px] px-1 resize-none h-fit max-h-80 overflow-auto border-0 focus:ring-0 focus:outline-none shadow-none bg-transparent focus-visible:ring-0 shadow-none"
                    placeholder="在此輸入需要轉換為語音的文字..."
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

                {/* <div className="text-xs text-gray-400 text-right">
                  按 Enter 發送, Shift+Enter 換行
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
