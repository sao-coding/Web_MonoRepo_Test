'use client'

/**
 * useApps Hook
 *
 * 管理首頁應用程式列表的資料獲取和收藏邏輯
 */

import type { AppType } from '@/types/app'
import { useAuth } from '@msi/auth'

import { getAppConfig } from '@msi/config/env'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { toast } from 'sonner'
import { useLanguage } from '@/context/Language'

export interface UseAppsReturn {
  // 狀態
  apps: AppType[]
  filteredApps: AppType[]
  isLoading: boolean
  starStates: Record<number, boolean>

  // 方法
  toggleStar: (sysId: number, sourceTable: string, currentIsFavorite: boolean) => void
  refetch: () => Promise<void>
}

/**
 * 應用程式列表狀態管理 Hook
 */
export function useApps(categoryId: number): UseAppsReturn {
  const { user } = useAuth()
  const { langCode, searchKeyword } = useLanguage()
  const [apps, setApps] = useState<AppType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [starStates, setStarStates] = useState<Record<number, boolean>>({})

  // 獲取應用程式列表
  const fetchApps = useCallback(async () => {
    if (!user?.userId)
      return

    setIsLoading(true)
    try {
      const res = await fetch(
        `${getAppConfig().NEXT_PUBLIC_AIforce_API_URL}/api/AIForce/Systems?userId=${user.userId}&deptId=${user.deptId}&category=${categoryId}&lang=${langCode}`,
        { method: 'GET' },
      )
      if (res.ok) {
        const data = await res.json()
        setApps(data)

        // 初始化收藏狀態
        const initialStarMap: Record<number, boolean> = {}
        data.forEach((app: AppType) => {
          initialStarMap[app.seqNo] = app.isFavorite
        })
        setStarStates(prev => ({
          ...prev,
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
  }, [user?.userId, user?.deptId, categoryId, langCode])

  // 切換收藏
  const handleStar = useCallback(
    async (masterId: number, sourceTable: string) => {
      try {
        await fetch(`${getAppConfig().NEXT_PUBLIC_AIforce_API_URL}/api/AIForce/FavoriteToggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.userId,
            masterId,
            sourceTable,
          }),
        })
      }
      catch (err) {
        console.error('POST 收藏 API 錯誤:', err)
      }
    },
    [user?.userId],
  )

  const toggleStar = useCallback(
    (sysId: number, sourceTable: string, currentIsFavorite: boolean) => {
      const currentState = starStates[sysId] !== undefined ? starStates[sysId] : currentIsFavorite
      const nextState = !currentState
      handleStar(sysId, sourceTable)
      setStarStates(prev => ({
        ...prev,
        [sysId]: nextState,
      }))
    },
    [starStates, handleStar],
  )

  // 過濾應用程式
  const filteredApps = useMemo(() => {
    if (!searchKeyword.trim())
      return apps

    const lowerKeyword = searchKeyword.toLowerCase()

    return apps.filter((app) => {
      const nameMatch = app.sysName.toLowerCase().includes(lowerKeyword)
      const infoMatch = app.infos.some(info => info.value.toLowerCase().includes(lowerKeyword))
      return nameMatch || infoMatch
    })
  }, [apps, searchKeyword])

  // 當相關依賴改變時重新獲取
  useEffect(() => {
    if (user?.userId) {
      fetchApps()
    }
  }, [fetchApps, user?.userId])

  return {
    apps,
    filteredApps,
    isLoading,
    starStates,
    toggleStar,
    refetch: fetchApps,
  }
}
