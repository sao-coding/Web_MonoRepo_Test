'use client'

import type { AppType } from '@/types/app'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

const AppCard = () => {
  const { status, data: apps = [] } = useQuery<AppType[]>({
    queryKey: ['apps'],
    queryFn: async () => {
      const response = await fetch('/AI_City/api/apps')

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`)
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        return data
      }
      else if (data && data.test) {
        // console.log('收到測試回應:', data)
        return []
      }
      else {
        throw new Error('伺服器回應不是有效的應用列表數組')
      }
    },
    refetchOnWindowFocus: false,
  })

  const isLoading = status === 'pending'

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

  // 根據 F_Stat 獲取按鈕配置
  const getButtonConfig = (app: AppType) => {
    // 將 F_Stat 轉換為數字進行比較
    const status = Number.parseInt(app.F_Stat)

    switch (status) {
      case 1:
        // 正常狀態 - 可點擊開啟
        return {
          type: 'link',
          text: '開啟',
          className: 'bg-gray-600 text-white hover:bg-gray-700',
          href: app.link || '#',
          disabled: false,
        }
      case 2:
        // 維護中狀態 - 不可點擊
        return {
          type: 'button',
          text: '維護中',
          className: 'bg-orange-200 text-orange-800 cursor-not-allowed',
          disabled: true,
        }
      case 3:
      default:
        // 即將推出或其他狀態 - 不可點擊
        return {
          type: 'button',
          text: '即將推出',
          className: 'bg-gray-300 text-gray-600 cursor-not-allowed',
          disabled: true,
        }
    }
  }

  return (
    <div className="p-2 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
        {apps.map((app: AppType) => {
          const buttonConfig = getButtonConfig(app)

          return (
            <div
              key={app.app_id}
              className="flex flex-col items-center overflow-hidden rounded-lg transition-shadow relative h-[330px]"
              style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="w-full h-32 bg-gray-200 flex items-center justify-center"></div>

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

                <div className="h-16 overflow-y-auto mb-4 w-full">
                  <p className="text-center text-gray-600 text-sm">
                    {app.description || '無描述'}
                  </p>
                </div>

                <div className="mt-auto">
                  {buttonConfig.type === 'link'
                    ? (
                        <a
                          href={buttonConfig.href || '#'}
                          className={`${buttonConfig.className} text-sm py-2 px-8 rounded-md transition-colors inline-block`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {buttonConfig.text}
                        </a>
                      )
                    : (
                        <button
                          type="button"
                          className={`${buttonConfig.className} text-sm py-2 px-8 rounded-md`}
                          disabled={buttonConfig.disabled}
                        >
                          {buttonConfig.text}
                        </button>
                      )}
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
