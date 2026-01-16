'use client'

import type { TranscriptionData } from '@/types'

import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import {
  ChatHeader,
  ChatLayout
} from '@msi/ui/components/chat-layout'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AudioToolbar } from '@/components/audio-toolbar'
import { InstantContent } from '@/components/instant-content'
import { InstantSidebar } from '@/components/instant-sidebar'
import { ResultToolbar } from '@/components/result-toolbar'
import { SearchRightBar } from '@/components/search-right-bar'
// import { useTranscriptionWS } from '@/hooks'
import { useInstant } from '@/hooks/use-instant'

const HomePage = () => {
  // Auth
  const { user, logout } = useAuth()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [isUpload, setIsUpload] = useState(false)
  const [isApiLoading, setIsApiLoading] = useState(false)
  const [resultList, setResultList] = useState<TranscriptionData | null>(null)
  // 即時錄音控制
  // const { isRecording, startRecording, stopRecording } = useTranscriptionWS('openai', 'zh')

  // Conversation hook
  const {
    // records,
    activeRecordId,
    // isLoadingRecord,
    fetchRecords,
    selectRecord
  } = useInstant({
    apiBaseUrl: getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL,
    userId: user?.userId
  })

  useEffect(() => {
    if (mode === 'upload') {
      setIsUpload(true)
    } else if (mode === 'instant') {
      setIsUpload(false)
    } else {
      setIsUpload(false)
    }
  }, [mode])

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

  // 處理上傳結果：直接將回傳物件包成陣列第一項
  const handleUploadResult = (data: TranscriptionData) => {
    setResultList(data)
  }

  return (
    <ChatLayout
      leftSidebar={
        <InstantSidebar
          isUpload={isUpload}
          setIsUpload={setIsUpload}
          activeRecordId={activeRecordId}
          onSelectRecord={selectRecord}
          // isLoadingRecord={isLoadingRecord}
          records={[]}
          onRecordsChange={fetchRecords}
          homeUrl={getAppConfig().NEXT_PUBLIC_RD_SITE_URL || '/'}
        />
      }
      header={
        <ChatHeader
          userName={user?.name}
          userId={user?.userId}
          onLogout={handleLogout}
          leftContent={
            <AudioToolbar
              isUpload={isUpload}
              onResult={handleUploadResult}
              onLoadingStatus={setIsApiLoading}
            />
          }
          className='h-16'
        />
      }
      rightSidebar={
        <SearchRightBar />
      }
    >
      <>
        <div className='flex h-full flex-col overflow-y-auto bg-linear-to-br from-gray-100 via-blue-50 to-gray-100 pb-2'>
          <div className='m-4 flex-1 rounded-2xl bg-white py-2 shadow-xl' style={{ paddingBottom: '100px' }}>
            <div className='grid h-full flex-1'>
              <InstantContent dataList={resultList} isLoading={isApiLoading} />
            </div>
          </div>
        </div>
        {resultList && <ResultToolbar />}
      </>
    </ChatLayout>
  )
}

export default function SafeHomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  )
}
