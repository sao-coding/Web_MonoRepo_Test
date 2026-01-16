'use client'

/**
 * TTS Interface (Client Component)
 *
 * 封裝所有與 Audio API 相關的邏輯
 * 包含 useAuth、useTts hooks 以及對話 UI
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
import { useState } from 'react'
import { toast } from 'sonner'

import type { HistoryItem } from '@/features/tts'
import { ttsConfig, useTts } from '@/features/tts'

import { DefaultInfo } from './default-info'
import { TextInputArea } from './text-input-area'
import { TtsSidebar } from './tts-sidebar'

const TTS_LOGO_URL = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-tts.png'

export function TTSInterface() {
  // Auth hook
  const { user, logout } = useAuth()

  // TTS hook
  const {
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
  } = useTts()

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
    setSelectedHistoryItem(item)
    setIsDialogOpen(true)
  }

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
                <DefaultInfo title='說書人' avatarUrl={TTS_LOGO_URL}>
                  在下方輸入任何文字，AI 將轉換為自然的語音。
                  支援多種語言和聲音風格。
                </DefaultInfo>
                <TextInputArea
                  value={userInput}
                  onChange={setUserInput}
                  onSubmit={sendMessage}
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
            <div className='shrink-0 bg-white p-4 dark:bg-background'>
              <TextInputArea
                value={userInput}
                onChange={setUserInput}
                onSubmit={sendMessage}
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
                <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
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
