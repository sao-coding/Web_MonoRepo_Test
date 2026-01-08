'use client'

import type { AppType } from '@/types/app'
import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import { useTranslations } from '@msi/i18n'
import { Button } from '@msi/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@msi/ui/components/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@msi/ui/components/tooltip'
import {
  Info,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { useLanguage } from '@/context/Language'

const AppCard = (
  {
    categoryId,
  }: {
    categoryId: number | 0
  }) => {
  const t = useTranslations('homepage')
  const { isAuthenticated, user } = useAuth()
  const { langCode, searchKeyword } = useLanguage()
  const [apps, setApps] = useState<AppType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<AppType | null>(null)
  const [addStar, setAddStar] = useState<{ [key: number]: boolean }>({})
  const DEFAULT_LOGO = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/aiforce-ai-print/logo.png'

  const fetchApp = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_AIforce_API_URL}/api/AIForce/Systems?userId=${user?.userId}&deptId=${user?.deptId}&category=${categoryId}&lang=${langCode}`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        setApps(data)

        const initialStarMap: { [key: number]: boolean } = {}
        data.forEach((app: AppType) => {
          initialStarMap[app.seqNo] = app.isFavorite
        })

        setAddStar(prev => ({
          ...prev, // 保留其他 category 已經記錄的狀態
          ...initialStarMap,
        }))
      }
    }
    catch (err) {
      console.error('獲取應用程式失敗:', err)
      toast.error('獲取應用程式失敗')
    }
    finally {
      setIsLoading(false)
    }
  }

  const filteredApps = useMemo(() => {
    if (!searchKeyword.trim())
      return apps

    const lowerKeyword = searchKeyword.toLowerCase()

    return apps.filter((app) => {
      // 條件 1：名稱匹配
      const nameMatch = app.sysName.toLowerCase().includes(lowerKeyword)
      // 條件 2：介紹內容 (info.value) 匹配
      const infoMatch = app.infos.some(info =>
        info.value.toLowerCase().includes(lowerKeyword),
      )
      return nameMatch || infoMatch
    })
  }, [apps, searchKeyword])

  useEffect(() => {
    if (user?.userId) {
      fetchApp()
    }
  }, [categoryId, langCode, user?.userId, user?.deptId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="text-lg font-medium text-gray-600">{t('loading')}</div>
      </div>
    )
  }

  // 檢查是否有應用程序數據
  if (apps.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">{t('noAvailable')}</p>
          <p>{t('noAvailableD')}</p>
        </div>
      </div>
    )
  }

  if (filteredApps.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">{t('noRelated')}</p>
          <p>
            {t('noRelatedD')}
            {searchKeyword}
            {t('noRelatedDt')}
          </p>
        </div>
      </div>
    )
  }

  const handleStar = async (sysId: number) => {
    try {
      await fetch(`${getAppConfig().NEXT_PUBLIC_AIforce_API_URL}/api/AIForce/FavoriteToggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sysId, // 應用程式ID
          userId: user?.userId, // 使用者工號
        }),
      })
    }
    catch (err) {
      console.error('POST 反饋API錯誤:', err)
    }
  }

  const toggleStarEnabled = (sysId: number, currentIsFavorite: boolean) => {
    const currentState = addStar[sysId] !== undefined ? addStar[sysId] : currentIsFavorite
    const nextState = !currentState
    handleStar(sysId)
    setAddStar(prev => ({
      ...prev,
      [sysId]: nextState,
    }))
  }

  // 處理轉址的核心邏輯 (對應 Vue 的邏輯) ---
  const handleAuthRedirect = async (targetUrl: string) => {
    // A. 檢查登入
    if (!isAuthenticated || !user) {
      return
    }

    try {
    // 改成呼叫新的 redirect API
      const response = await fetch('/AI_City/api/apps/auth/redirect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ targetUrl }),
      })

      if (!response.ok) {
        throw new Error('redirect API 呼叫失敗')
      }

      const data = await response.json()

      if (!data.success || !data.redirectUrl) {
        throw new Error('redirect URL 取得失敗')
      }

      // 🔴 由 server 回來的完整 URL，直接開
      window.open(data.redirectUrl, '_blank')
    }
    catch (e) {
      console.error('開啟應用程式失敗:', e)
    }
  }

  return (
    <div className="p-2 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 mx-auto" style={{ maxWidth: '1100px' }}>
        {filteredApps.map((app: AppType) => {
          const isFilled = addStar[app.seqNo] !== undefined
            ? addStar[app.seqNo]
            : app.isFavorite
          return (
            <div
              key={app.seqNo}
              className="flex flex-col cursor-pointer items-center overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-black/30 relative"
              onClick={() => {
                setSelectedApp(app)
              }}
            >
              <div className="w-full h-20 bg-gray-200 flex items-center justify-center relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          setSelectedApp(app)
                        }}
                        aria-label={t('info')}
                        variant="ghost"
                        size="lg"
                        className="absolute top-2 left-2 has-[>svg]:px-2 h-8 rounded-4xl p-0 hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Info
                          className="has-[>svg]:w-6 has-[>svg]:h-6 [&_svg:not([class*='size-'])]:size-4"
                          size={20}
                          stroke="gray"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('info')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => toggleStarEnabled(app.seqNo, app.isFavorite)}
                        aria-label={t('addFavorite')}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 rounded-4xl p-0 hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Star
                          className="w-8 h-8"
                          fill={isFilled ? 'black' : 'none'}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('addFavorite')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="absolute z-10" style={{ top: '40px' }}>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {app.logo
                    ? (
                        <img
                          src={app.logo}
                          alt={`${app.name} 圖標`}
                          className="w-16 h-16 rounded-full object-contain"
                          onError={(e) => {
                            const imgElement = e.target as HTMLImageElement
                            imgElement.src
                              = 'https://via.placeholder.com/64?text=AI'
                          }}
                        />
                      )
                    : (
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xl">
                          {app.name?.[0]?.toUpperCase() || 'AI'}
                        </div>
                      )}
                </div>
              </div>

              <div className="w-full bg-white pt-16 pb-6 px-4 flex flex-col items-center flex-grow h-full">
                <h3 className="text-center font-bold text-lg text-gray-800 mt-2">
                  {app.name}
                </h3>
                <div className="w-full">
                  <Button
                    className="hover:bg-white hover:text-black w-full my-1 rounded-4xl hover:border"
                    onClick={() => handleAuthRedirect(app.sysUrl || '')}
                  >
                    {t('sysLink')}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AppCard
