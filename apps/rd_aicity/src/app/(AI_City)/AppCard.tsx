'use client'

import type { AppType } from '@/types/app'
import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import { Button } from '@msi/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@msi/ui/components/dialog'
import {
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
        <div className="text-lg font-medium text-gray-600">載入中...</div>
      </div>
    )
  }

  // 檢查是否有應用程序數據
  if (apps.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">無可用應用</p>
          <p>目前沒有可用的應用程序。</p>
        </div>
      </div>
    )
  }

  if (filteredApps.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">無相關應用</p>
          <p>
            找不到與「
            {searchKeyword}
            」相關的應用。
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
        {filteredApps.map((app: AppType) => {
          const isFilled = addStar[app.seqNo] !== undefined
            ? addStar[app.seqNo]
            : app.isFavorite
          return (
            <div
              key={app.seqNo}
              className="flex flex-col items-center overflow-hidden rounded-lg transition-shadow relative"
              style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="w-full h-20 bg-gray-200 flex items-center justify-center relative">
                <Button
                  onClick={() => toggleStarEnabled(app.seqNo, app.isFavorite)}
                  aria-label="加入我的最愛"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 rounded-4xl p-0 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Star
                    className="w-8 h-8"
                    fill={isFilled ? 'black' : 'none'}
                  />
                </Button>
              </div>

              <div className="absolute z-10" style={{ top: '20px' }}>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Image
                    src={app.sysImgUrl
                      ? app.sysImgUrl
                      : DEFAULT_LOGO}
                    alt={app.sysName}
                    width={64}
                    height={64}
                    className="rounded-full object-contain"
                    unoptimized
                  />
                </div>
              </div>

              <div className="w-full bg-white h-full pt-8 pb-4 px-4 flex flex-col items-center">
                <h3 className="text-center font-bold text-lg text-gray-800 mt-6 flex-1">
                  {app.sysName}
                </h3>
                <div className="w-full">
                  <Button
                    className="hover:bg-black hover:text-white w-full my-1 rounded-4xl hover:border-none"
                    variant="outline"
                    onClick={() => {
                      setSelectedApp(app)
                    }}
                  >
                    查看介紹
                  </Button>
                  <Button
                    className="hover:bg-white hover:text-black w-full my-1 rounded-4xl hover:border"
                    onClick={() => handleAuthRedirect(app.sysUrl || '')}
                  >
                    進入對話
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
        <Dialog open={!!selectedApp} onOpenChange={open => !open && setSelectedApp(null)}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader className="justify-center">
              <DialogTitle>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Image
                      src={selectedApp?.sysImgUrl && selectedApp.sysImgUrl !== null
                        ? selectedApp.sysImgUrl
                        : DEFAULT_LOGO}
                      alt={`${selectedApp?.sysName}`}
                      width={64}
                      height={64}
                      className="rounded-full object-contain"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement
                        if (imgElement.src !== DEFAULT_LOGO) {
                          imgElement.src = DEFAULT_LOGO
                        }
                      }}
                      unoptimized
                    />
                  </div>
                  <h2 className="text-2xl font-bold">{selectedApp?.sysName}</h2>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6 grid gap-4 overflow-y-auto">
              {selectedApp?.infos.map(info => (
                <div key={info.name}>
                  <div className="mb-4 flex">
                    <span
                      className="text-white rounded-[30px] px-4 py-2 font-bold text-lg"
                      style={{ background: 'linear-gradient(to right,#000,#868789,#000)' }}
                    >
                      {info.name}
                    </span>
                  </div>
                  <ReactMarkdown
                    className="max-w-none dark:prose-invert grid"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    skipHtml={false}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4 border rounded-lg max-w-full" style={{ maxWidth: '100%' }}>
                          <div className="max-w-5xl overflow-x-auto">
                            <table className="border-collapse table-auto w-full" {...props} style={{ minWidth: '600px', tableLayout: 'auto', margin: '0' }} />
                          </div>
                        </div>
                      ),
                      th: ({ node, ...props }) => (
                        <th className="border bg-gray-100 p-2 text-left font-bold whitespace-nowrap" {...props} style={{ minWidth: '80px', verticalAlign: 'middle' }} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border p-2" {...props} style={{ minWidth: '60px', maxWidth: '200px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-2 last:mb-0" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0" {...props} />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic" {...props} />
                      ),
                      code: ({ node, ...props }) => (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
                      ),
                    }}
                  >
                    {info.value}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AppCard
