'use client'

import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import {
  ChatHeader,
  ChatLayout
} from '@msi/ui/components/chat-layout'
import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { AudioToolbar } from '@/components/audio-toolbar'
import { InstantSidebar } from '@/components/instant-sidebar'
import { useInstant } from '@/hooks/use-instant'

const HomePage = () => {
  // Auth
  const { user, logout } = useAuth()
  const [isUpload, setIsUpload] = useState(false)

  // Conversation hook
  const {
    records,
    activeRecordId,
    isLoadingRecord,
    fetchRecords,
    selectRecord,
    startNewInstant: baseStartNewInstant
  } = useInstant({
    apiBaseUrl: getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL,
    userId: user?.userId
  })

  // 登出處理
  const handleLogout = () => {
    const success = logout()
    if (success) {
      toast.success('已登出')
      // 動態計算登入頁 URL - 使用當前瀏覽器的 port
      const { protocol, hostname, port } = window.location
      const portSuffix = port ? `:${port}` : ''
      const redirectUrl = `${protocol}//${hostname}${portSuffix}/AI_City/login`
      console.log('Logout redirect:', { hostname, protocol, port, redirectUrl })
      window.location.href = redirectUrl
    } else {
      toast.error('登出失敗')
    }
  }

  const handleStartNewInstant = () => {
    setIsUpload(false)
    baseStartNewInstant()
  }

  const handleStartNewUpload = () => {
    setIsUpload(true)
  }

  return (
    <ChatLayout
      leftSidebar={
        <InstantSidebar
          isUpload={isUpload}
          activeRecordId={activeRecordId}
          onSelectRecord={selectRecord}
          onStartNewInstant={handleStartNewInstant}
          onStartNewUpload={handleStartNewUpload}
          isLoadingRecord={isLoadingRecord}
          records={records}
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
            <AudioToolbar isUpload={isUpload} />
          }
          className='h-16'
        />
      }
      // rightSidebar={
      //   <></>
      // }
    >
      <div>頁面內容</div>
    </ChatLayout>
  )
}

export default HomePage
