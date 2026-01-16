'use client'

/**
 * ASR Interface (Client Component)
 *
 * 封裝所有與 Audio API 相關的邏輯
 * 包含 useAuth、useAsr hooks 以及對話 UI
 */

import type { HistoryItem } from '@/features/asr'

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
import { CopyIcon, FileTextIcon, MicIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useAsr } from '@/features/asr'

import { AsrSidebar } from './asr-sidebar'
import { DefaultInfo } from './default-info'
import { FileUploadArea } from './file-upload-area'

const ASR_LOGO_URL = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-stt.png'

export function ASRInterface() {
  // Auth hook
  const { user, logout } = useAuth()

  // ASR hook - 管理語音識別核心邏輯
  const {
    selectedFile,
    message,
    isLoading,
    history,
    language,
    setLanguage,
    handleDrag,
    handleDrop,
    handleFileChange,
    handleSendMessage,
    clearSelectedFile,
    fileInputRef
  } = useAsr()

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

  // 處理歷史項目點擊
  const handleHistoryItemClick = (item: HistoryItem) => {
    if (item.text.length > 100) {
      setSelectedHistoryItem(item)
      setIsDialogOpen(true)
    } else {
      navigator.clipboard.writeText(item.text)
      toast.success('已複製到剪貼板')
    }
  }

  // 從彈窗複製
  const handleCopyFromDialog = () => {
    if (selectedHistoryItem) {
      navigator.clipboard.writeText(selectedHistoryItem.text)
      toast.success('已複製到剪貼板')
    }
  }

  // 判斷是否顯示預設狀態
  const showDefaultInfo = !selectedFile && !message && !isLoading

  return (
    <>
      <ChatLayout
        leftSidebar={
          <AsrSidebar
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
                <DefaultInfo title='語音轉文字服務' avatarUrl={ASR_LOGO_URL}>
                  選擇一個音頻文件，我們將快速將其轉換文字。
                  當前支持WAV格式的單聲道文件。
                </DefaultInfo>
                <FileUploadArea
                  selectedFile={selectedFile}
                  isLoading={isLoading}
                  fileInputRef={fileInputRef}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                  onFileChange={handleFileChange}
                  onClearFile={clearSelectedFile}
                  onSubmit={handleSendMessage}
                />
              </div>
            ) : (
              <div className='mx-auto flex w-full max-w-4xl flex-col gap-4 pb-4'>
                {/* 已選檔案顯示 */}
                {selectedFile && (
                  <ChatMessage
                    type='user'
                    content={`📁 音频文件: ${selectedFile}`}
                  />
                )}

                {/* AI 正在思考 */}
                {isLoading && !message && (
                  <ChatMessage type='assistant' content='' avatarUrl={ASR_LOGO_URL} isLoading />
                )}

                {/* 識別結果 */}
                {message && (
                  <ChatMessage
                    type='assistant'
                    content={message}
                    avatarUrl={ASR_LOGO_URL}
                    actions={
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          navigator.clipboard.writeText(message)
                          toast.success('已複製到剪貼板')
                        }}
                      >
                        <CopyIcon className='size-4' />
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>

          {/* 底部上傳區域 (有訊息時顯示) */}
          {!showDefaultInfo && (
            <div className='shrink-0 bg-white p-4 dark:bg-background'>
              <FileUploadArea
                selectedFile={selectedFile}
                isLoading={isLoading}
                fileInputRef={fileInputRef}
                onDrag={handleDrag}
                onDrop={handleDrop}
                onFileChange={handleFileChange}
                onClearFile={clearSelectedFile}
                onSubmit={handleSendMessage}
                maxWidthClass='max-w-4xl'
              />
            </div>
          )}
        </div>
      </ChatLayout>

      {/* 詳情彈窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <FileTextIcon className='size-5 text-blue-500' />
              識別結果詳情
            </DialogTitle>
            <DialogDescription>
              音頻檔案的完整識別結果，點擊複製按鈕保存文字內容
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryItem && (
            <div className='space-y-4'>
              <div className='border-b pb-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <MicIcon className='size-4' />
                  <span className='font-medium'>檔案名稱:</span>
                  <span className='truncate'>{selectedHistoryItem.file}</span>
                </div>
              </div>

              <div className='rounded-lg bg-gray-50 p-4 dark:bg-zinc-800'>
                <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
                  {selectedHistoryItem.text}
                </p>
              </div>

              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={handleCopyFromDialog}>
                  <FileTextIcon className='mr-2 size-4' />
                  複製文字
                </Button>
                <Button onClick={() => { setIsDialogOpen(false) }}>
                  關閉
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
