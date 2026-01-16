'use client'

import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import { Button } from '@msi/ui/components/button'
import {
  ChatHeader,
  ChatLayout
} from '@msi/ui/components/chat-layout'
import {
  AudioLines,
  Download,
  LetterTextIcon,
  Mic,
  Play,
  Square
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { InstantSidebar } from '@/components/instant-sidebar'

const Recording = () => {
  const { user, logout } = useAuth()
  const [isRecording, setIsRecording] = useState(false)

  // 登出處理
  const handleLogout = () => {
    const success = logout()
    if (success) {
      toast.success('已登出')
      // 動態計算登入頁 URL - 使用當前瀏覽器的 port
      const { protocol, hostname, port } = window.location
      const portSuffix = port ? `:${port}` : ''
      const redirectUrl = `${protocol}//${hostname}${portSuffix}/aiforce/login`
      console.log('Logout redirect:', { hostname, protocol, port, redirectUrl })
      window.location.href = redirectUrl
    } else {
      toast.error('登出失敗')
    }
  }

  return (
      <ChatLayout
        leftSidebar={
          <InstantSidebar
            records={[]}
            homeUrl={getAppConfig().NEXT_PUBLIC_RD_SITE_URL || '/'}
          />
        }
        header={
          <ChatHeader
            userName={user?.name}
            userId={user?.userId}
            onLogout={handleLogout}
            leftContent={
              <>
                <AudioLines size={16} />
                <span className='flex items-center font-bold whitespace-nowrap text-gray-600'>語音錄製</span>
              </>
            }
            className='h-16'
          />
        }
      >
        <div className='flex flex-1 flex-col overflow-hidden px-4 py-2'>
          {isRecording ? (
            <div className='flex flex-1 items-center justify-center'>
              <span className='text-gray-500'>錄音中...</span>
            </div>
          ) : (
            <div className='scrollbar-hidden flex flex-col items-center justify-between overflow-y-auto text-center' style={{ margin: 'auto 0' }}>
              <div className='mb-20 flex items-center justify-between gap-4'>
                <AudioLines size={200} stroke='#51a2ff' style={{ transform: 'rotateY(180deg)' }} />
                <div className='inline-flex items-center justify-between rounded-full bg-blue-400 px-1'>
                  <Mic size={200} stroke='white' />
                </div>
                <AudioLines size={200} stroke='#51a2ff' />
              </div>
              <div className='flex items-center gap-6'>
                <Button
                  onClick={setIsRecording.bind(null, !isRecording)}
                  disabled={isRecording ? true : false}
                  className={`flex gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 ${isRecording ? 'animate-pulse' : ''}`}
                >
                  {isRecording ? <Square className='mr-2 size-4 fill-current' /> : <Play className='mr-2 size-4' />}
                  {isRecording ? '錄音中' : '開始錄音'}
                </Button>
                {!isRecording && (
                  <>
                    <Button
                      className='gap-2 bg-blue-500 whitespace-nowrap hover:bg-blue-600'
                    >
                      <LetterTextIcon />
                      生成逐字稿
                    </Button>
                    <Button
                      className='gap-2 bg-gray-600 whitespace-nowrap hover:bg-gray-700'
                    >
                      <Download />
                      匯出音檔
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </ChatLayout>
  )
}

export default Recording
