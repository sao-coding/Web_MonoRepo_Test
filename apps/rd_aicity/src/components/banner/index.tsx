'use client'

import { useAuth } from '@msi/auth/src/provider'
import { getAppConfig } from '@msi/config/env'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { titleConfig } from '@/config/title'
import { useLanguage } from '@/context/Language'
import { IconMsi } from '../icons/msi'
import UserMenu from './user-menu'

interface LanItem {
  seqNo: number
  langCode: string
  langName: string
  isDefault: boolean
  isShow: boolean
}

const Banner = () => {
  const { isAuthenticated, user } = useAuth()
  const config = useMemo(() => getAppConfig(), [])
  const pathname = usePathname()
  const { setLangCode, searchKeyword, setSearchKeyword } = useLanguage()
  const [selectedLan, setSelectedLan] = useState<string>('繁體中文')
  const [lanList, setLanList] = useState<LanItem[]>([])

  const fetchLan = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AIforce_API_URL}/api/AIForce/Languages`, {
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
      {titleConfig.find(item => pathname.startsWith(item.pathname))?.banner
        && (
          <div className="flex h-16 items-center justify-between border-b border-gray-300 px-4 md:px-6">
            <Link href={process.env.NEXT_PUBLIC_RD_SITE_URL ?? '/'} className="flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
              {pathname === '/'
                ? (
                    <Image
                      src={`${config.NEXT_PUBLIC_BASE_PATH_URL}/images/msi-aiforce.png`}
                      alt="MSI AIforce"
                      height={32}
                      width={280}
                      className="object-contain dark:invert w-auto h-8"
                      priority
                    />
                  )
                : (
                    <>
                      <IconMsi className="h-5 w-auto md:h-auto" />
                      <span
                        className="truncate text-2xl font-bold text-black md:text-3xl"
                        style={{
                          fontFamily: '微軟正黑體',
                        }}
                      >
                        {titleConfig.find(
                          item => pathname.startsWith(item.pathname),
                        )?.title}
                      </span>
                    </>
                  )}
            </Link>
            {pathname === '/' && (
              <div className="flex items-center gap-8">
                <span className="inline-block py-2 px-1 border-b-3 border-black font-bold text-md">
                  AI 智能助手
                </span>
                <Button
                  variant="ghost"
                  className="font-bold py-2 px-1 text-gray-400 hover:text-black text-md hover:bg-transparent"
                  onClick={() => handleAuthRedirect('https://aiforum.msi.com.tw/index.php')}
                >
                  AI 論壇
                </Button>
              </div>
            )}
            <div className="flex items-center gap-4">
              {pathname === '/' && (
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
                      placeholder="搜尋AI Agent"
                      value={searchKeyword}
                      onChange={handleSearchChange}
                      className="pl-9 pr-4 h-9 rounded-4xl border-gray-200 focus:ring-1 focus:ring-black"
                    />
                  </div>
                </>
              )}
              <UserMenu />
            </div>
          </div>
        )}
    </>
  )
}

export default Banner
