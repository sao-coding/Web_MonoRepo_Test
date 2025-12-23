'use client'

import {
  CopyIcon,
  FileTextIcon,
  InfoIcon,
  MicIcon,
  SendHorizontalIcon,
  XIcon,
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
import { AppConfig, translateConfig } from '@/config/asr'

const AsrPage = () => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState<boolean>(false)
  const [selectedFileObj, setSelectedFileObj] = React.useState<File | null>(
    null,
  )
  const [message, setMessage] = React.useState<string>('')
  const [selectedFile, setSelectedFile] = React.useState<string>('')
  const [language, setLanguage] = React.useState<string>(
    translateConfig.default_language,
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const [history, setHistory] = React.useState<
    Array<{ file: string, text: string }>
  >([])
  const [selectedHistoryItem, setSelectedHistoryItem] = React.useState<
    { file: string, text: string } | null
  >(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false)

  // 處理文件拖拽事件
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    }
    else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleHistoryItemClick = (item: { file: string, text: string }, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // 如果文字長度超過100字符，則顯示彈窗
    if (item.text.length > 100) {
      setSelectedHistoryItem(item)
      setIsDialogOpen(true)
    }
    else {
      // 短文字直接複製到剪貼板
      navigator.clipboard.writeText(item.text)
      toast.success('已複製到剪貼板')
    }
  }

  const handleCopyFromDialog = () => {
    if (selectedHistoryItem) {
      navigator.clipboard.writeText(selectedHistoryItem.text)
      toast.success('已複製到剪貼板')
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
          // Create a new DataTransfer object and add the file to it
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInputRef.current.files = dataTransfer.files
        }
      }
      else {
        toast.error('請選擇WAV格式的音檔')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFileObj(file)
      setSelectedFile(file.name)
    }
  }

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSendMessage = async () => {
    const inputFile
      = (fileInputRef?.current?.files?.[0] as File) || selectedFileObj
    // console.log('input:', inputFile)

    if (!inputFile) {
      toast.error('請選擇音檔')
      return
    }

    setMessage('')
    setIsLoading(true)
    // 更新所選文件名
    setSelectedFile(inputFile.name)

    // http://172.16.111.148:8090/asr
    // form-data
    const formData = new FormData()
    formData.append('file', inputFile)
    formData.append('language-code', language)
    formData.append('Token', '0UET8Lal6hBBqNSE')
    if (inputRef.current) {
      inputRef.current.value = ''
    }

    try {
      const res = await fetch(`${AppConfig.serviceApiUrl}/asr`, {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'multipart/form-data'
        // },
        body: formData,
      })
      // 輸出音檔
      const data = await res.json()
      if (!res.ok) {
        console.error('error:', data)
        if (data.error.includes('Input audio channel count must be 1')) {
          toast.error('請確認音檔是否為單聲道')
        }
        else {
          toast.error(data.error)
        }
        setIsLoading(false)
        return
      }

      // console.log('data:', data)
      setMessage(data.output)

      // 添加到歷史紀錄
      setHistory(prev => [
        ...prev,
        { file: inputFile.name, text: data.output },
      ])
    }
    catch (error) {
      console.error('ASR API 錯誤:', error)
      toast.error('識別過程中發生錯誤，請稍後重試')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[100vh]">
      <LeftSidebar
        headerDescription="將語音錄音轉換為文字，快速準確的語音識別服務。"
        showNewButton={false}
        showNoteButton={false}
        onNewButtonClick={() => {}}
        onNoteButtonClick={() => {}}
        RecordsSectionLabel="識別紀錄"
        showRecordsSection={true}
        recordsSectionContent={(
          <>
            {history.length > 0
              ? (
                  history
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 p-3 rounded-md text-sm mb-2 hover:bg-gray-200 transition-colors cursor-pointer relative group"
                        onClick={e => handleHistoryItemClick(item, e)}
                      >
                        <div className="font-medium text-blue-600 font-bold mb-1 truncate flex items-center justify-between">
                          <span>{item.file}</span>
                          {item.text.length > 100 && (
                            <span className="text-xs text-gray-400 px-1.5 py-0.5 line-clamp-2">
                              長文
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 line-clamp-2">{item.text}</p>
                        {item.text.length > 100 && (
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(item.text)
                                toast.success('已複製到剪貼板')
                              }}
                            >
                              快速複製
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                )
              : (
                  <div className="text-gray-300 text-center">
                    尚無識別紀錄
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
              識別結果詳情
            </DialogTitle>
            <DialogDescription>
              音頻檔案的完整識別結果，點擊複製按鈕保存文字內容
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryItem && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MicIcon className="w-4 h-4" />
                  <span className="font-medium">檔案名稱:</span>
                  <span className="truncate">{selectedHistoryItem.file}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {selectedHistoryItem.text}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCopyFromDialog}
                >
                  <FileTextIcon className="w-4 h-4 mr-2" />
                  複製文字
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                >
                  關閉
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex flex-col">
        <Banner><>&nbsp;</></Banner>
        <div className={`flex flex-col flex-1
          ${!selectedFile && !message && !isLoading && 'justify-center'}`}
        >
          <div
            className={`p-4 sm:p-6 sm:pt-4 overflow-y-auto
              ${!selectedFile && !message && !isLoading ? 'justify-center flex flex-col' : 'flex-1'}`}
          >
            {!selectedFile && !message && !isLoading && (
              <DefaltInfo
                title="語音轉文字服務"
              >
                選擇一個音頻文件，我們將快速將其轉換文字。
                當前支持WAV格式的單聲道文件。
              </DefaltInfo>
            )}

            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              {selectedFile && (
                <div className="flex justify-end mr-4">
                  <div className="max-w-[80%] bg-secondary p-4 rounded-xl whitespace-pre-wrap break-words shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <FileTextIcon className="h-4 w-4" />
                      <span className="font-medium">音频文件</span>
                    </div>
                    <p>{selectedFile}</p>
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
                <div className="flex px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
                  <div className="shrink-0 ltr:mr-3 rtl:ml-3 @lg:flex mt-1  svelte-1u5gq5j">
                    <img className="size-8 assistant-message-profile-image object-cover rounded-full" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" />
                  </div>
                  <div className="flex-1 flex-col flex gap-2">
                    <div className="break-words relative group">
                      {message}
                      <button
                        type="button"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded hover:bg-white shadow-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(message)
                          toast.success('已複製到剪貼板')
                        }}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={`mb-6 w-full flex-shrink-0 px-2.5 mx-auto inset-x-0
            ${!selectedFile && !message && !isLoading ? 'max-w-3xl' : 'max-w-6xl'}`}
          >
            <div className="mx-auto flex flex-col gap-2">
              <div className="flex-1 flex flex-col relative w-full shadow-lg rounded-3xl border border-gray-50 dark:border-gray-850 hover:border-gray-100 focus-within:border-gray-100 hover:dark:border-gray-800 focus-within:dark:border-gray-800 transition px-1 bg-white/90 dark:bg-gray-400/5 dark:text-gray-100 px-3 py-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 flex items-center gap-1"></div>

                  {/* 移除設置語言按鈕，因為左側已有下拉選單 */}
                </div>

                <div className="flex flex-col gap-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 relative hover:bg-gray-50 transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleFileUploadClick}
                  >
                    <input
                      type="file"
                      id="fileInput"
                      ref={fileInputRef}
                      accept=".wav"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="text-gray-400 mb-2">
                        <MicIcon className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-600">
                        點擊或拖放WAV檔到此處
                      </p>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <InfoIcon className="h-3.5 w-3.5" />
                        <span>目前只支持單聲道WAV格式文件</span>
                      </div>
                    </div>

                    {selectedFile && (
                      <div className="mt-3 flex items-center justify-center gap-2 bg-blue-50 p-2 rounded">
                        <FileTextIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                          {selectedFile}
                        </span>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFile('')
                            setSelectedFileObj(null)
                            if (fileInputRef.current)
                              fileInputRef.current.value = ''
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !selectedFile}
                      className="rounded-md px-4"
                    >
                      {isLoading
                        ? (
                            <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full mr-2"></div>
                          )
                        : (
                            <SendHorizontalIcon className="h-5 w-5 mr-2" />
                          )}
                      分析音頻
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AsrPage
