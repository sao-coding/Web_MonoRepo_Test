'use client'

import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import { useI18n, useTranslations } from '@msi/i18n'
import { Banner } from '@msi/ui/components/banner'
import { Button } from '@msi/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@msi/ui/components/dropdown-menu'
import { Input } from '@msi/ui/components/input'
import { Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { titleConfig } from '@/config/title'
import { useLanguage } from '@/context/Language'

interface LanItem {
  seqNo: number
  langCode: string
  langName: string
  isDefault: boolean
  isShow: boolean
}

export default function BannerWrapper() {
  const t = useTranslations('homepage')
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const { setLocale } = useI18n()
  const { setLangCode, searchKeyword, setSearchKeyword } = useLanguage()
  const [selectedLan, setSelectedLan] = useState<string>('繁體中文')
  const [lanList, setLanList] = useState<LanItem[]>([])

  // Get page config
  const config = titleConfig.find(item => pathname.startsWith(item.pathname))
  const title = config?.title
  let logoUrl = ''

  if (pathname === '/') {
    logoUrl = `${getAppConfig().NEXT_PUBLIC_BASE_PATH_URL}/images/msi-aiforce-new.png`
  }
  else {
    logoUrl = 'https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/msi_black.png'
  }

  const fetchLan = async () => {
    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_AIforce_API_URL}/api/AIForce/Languages`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        setLanList(data)

        // 根據 API 的 isDefault 設定初始顯示名稱
        const defaultLan = data.find((item: LanItem) => item.isDefault)
        if (defaultLan) {
          setSelectedLan(defaultLan.langName)
        }
      }
      else {
        console.error(`Failed to fetch Languages: ${res.status}`)
      }
    }
    catch (err) {
      console.error('語系列表--獲取失敗:', err)
    }
  }

  useEffect(() => {
    fetchLan()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchKeyword(value)
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
    <>
      {config?.banner && (
        <Banner
          userName={user?.name}
          userId={user?.userId}
          title={title}
          logoUrl={logoUrl}
          className={`${pathname === '/' && 'h-7'}`}
          titleClassName={`${pathname === '/' && 'hidden'}`}
          homeUrl={getAppConfig().NEXT_PUBLIC_RD_SITE_URL || '/'}
          centerContent={pathname === '/' && (
            <div className="flex items-center gap-8">
              <span className="inline-block py-2 px-1 border-b-3 border-black font-bold text-md">
                {t('AIagent')}
              </span>
              <Button
                variant="ghost"
                className="font-bold py-2 px-1 text-gray-400 hover:text-black text-md hover:bg-transparent"
                onClick={() => handleAuthRedirect('https://aiforum.msi.com.tw/index.php')}
              >
                {t('AIforum')}
              </Button>
            </div>
          )}
          rightContent={pathname === '/' && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    {selectedLan}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {lanList.map(item => (
                    <DropdownMenuItem
                      key={item.seqNo}
                      onSelect={() => {
                        let targetLang = item.langCode
                        if (targetLang === 'zh') {
                          targetLang = 'zh-TW'
                        }
                        setLocale(targetLang as any)
                        setSelectedLan(item.langName)
                        setLangCode(item.langCode)
                        console.warn(`切換至: ${item.langCode}`)
                      }}
                    >
                      {item.langName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative max-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('search')}
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  className="pl-9 pr-4 h-9 rounded-4xl border-gray-200 focus:ring-1 focus:ring-black"
                />
              </div>
            </>
          )}
          onLogout={() => toast.info('登出功能')}
        />
      )}
    </>
  )
}
