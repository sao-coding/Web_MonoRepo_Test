'use client'

import { useAuth } from '@msi/auth'
import { useQuery } from '@tanstack/react-query'
import { FilterIcon, SearchIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import Banner from '@/components/banner-b'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createSearchContainer, fetchPatentFilters } from '@/lib/api/patents'

interface FilterItem {
  name: string
  value: string
}

interface SelectedFilters {
  patentType: string[]
  caseType: string[]
  year: string[]
  country: string[]
}

const PatentsPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    patentType: [],
    caseType: [],
    year: [],
    country: [],
  })
  const [isSearching, setIsSearching] = useState(false)

  const router = useRouter()
  const { user } = useAuth()

  // 使用 useQuery 獲取篩選選項資料
  const { data: filterData, isLoading, error } = useQuery({
    queryKey: ['patentFilters'],
    queryFn: fetchPatentFilters,
    staleTime: 5 * 60 * 1000, // 5分鐘內資料視為新鮮
    gcTime: 10 * 60 * 1000, // 10分鐘後清除快取
  })

  // 專利類型名稱對應表
  const patentTypeNameMap: Record<string, string> = {
    I: '發明專利',
    M: '新型專利',
    D: '設計專利',
  }

  // 案件類型名稱對應表
  const caseTypeNameMap: Record<string, string> = {
    A: '公開案',
    B: '公告案',
  }

  // 從 API 獲取的專利類型資料，轉換為 FilterItem 格式
  const patentTypes: FilterItem[] = filterData?.status === 'success'
    ? (filterData.data as any).patentTypes.map((type: string) => ({
        name: patentTypeNameMap[type] || type,
        value: type,
      }))
    : []

  // 從 API 獲取的案件類型資料，轉換為 FilterItem 格式
  const caseTypes: FilterItem[] = filterData?.status === 'success'
    ? (filterData.data as any).caseTypes.map((type: string) => ({
        name: caseTypeNameMap[type] || type,
        value: type,
      }))
    : []

  // 從 API 獲取的年份資料，轉換為 FilterItem 格式
  const years: FilterItem[] = filterData?.status === 'success'
    ? (filterData.data as any).years.map((year: number) => ({
        name: `${year}年`,
        value: year.toString(),
      }))
    : []

  // 從 API 獲取的國家資料，轉換為 FilterItem 格式
  const countries: FilterItem[] = filterData?.status === 'success'
    ? (filterData.data as any).countries.map((country: string) => ({
        name: country,
        value: country,
      }))
    : []

  const handleFilterSelect = (category: keyof SelectedFilters, value: string) => {
    setSelectedFilters((prev) => {
      const currentCategory = prev[category]
      const isSelected = currentCategory.includes(value)

      return {
        ...prev,
        [category]: isSelected
          ? currentCategory.filter(item => item !== value)
          : [...currentCategory, value],
      }
    })
  }

  const clearFilters = () => {
    setSelectedFilters({
      patentType: [],
      caseType: [],
      year: [],
      country: [],
    })
  }

  const startSearch = async () => {
    if (!user?.userName) {
      // 如果用戶未登入，可以顯示錯誤訊息或導向登入頁面
      console.error('用戶未登入')
      return
    }

    if (!searchTerm.trim()) {
      toast.error('請輸入搜尋關鍵字，該欄位為必填！')
      return
    }

    setIsSearching(true)

    try {
      const searchData = {
        keyword: searchTerm.trim(),
        title: searchTerm.trim() || '搜尋結果', // 預設關鍵字設定成標題
        patentTypes: selectedFilters.patentType,
        caseTypes: selectedFilters.caseType,
        years: selectedFilters.year.map(year => Number.parseInt(year)),
        countries: selectedFilters.country,
      }

      const response = await createSearchContainer(searchData)

      if (response.status === 'success') {
        // 構建 URL 查詢參數
        const queryParams: Array<[string, string]> = []

        // 添加搜尋關鍵字
        queryParams.push(['q', searchTerm.trim()])

        // 添加篩選條件
        Object.entries(selectedFilters).forEach(([key, values]) => {
          values.forEach((value: string) => {
            queryParams.push([key, value])
          })
        })

        // 構建完整 URL
        const baseUrl = `/patents/${response.data.seqNo}`
        const url = queryParams.length > 0
          ? `${baseUrl}?${new URLSearchParams(queryParams).toString()}`
          : baseUrl

        router.push(url)
      }
      else {
        console.error('創建搜尋容器失敗:', response.message)
      }
    }
    catch (error) {
      console.error('搜尋時發生錯誤:', error)
    }
    finally {
      setIsSearching(false)
    }
  }

  const renderFilterButtons = (items: FilterItem[], category: keyof SelectedFilters) => {
    return (
      <div className="flex flex-wrap gap-2 ml-4">
        {items.map(item => (
          <button
            key={item.value}
            type="button"
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              selectedFilters[category].includes(item.value)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => handleFilterSelect(category, item.value)}
          >
            {item.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Banner><>&nbsp;</></Banner>
      <div className="p-4 sm:p-6 w-full flex flex-col items-center space-y-4" style={{ margin: 'auto 0' }}>
        <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center">
          <SearchIcon className="text-blue-600 size-8" />
        </div>
        <span className="text-2xl font-bold">
          歡迎使用專利搜尋系統
        </span>
        <span className="text-gray-500 text-center">
          開始您的專利搜尋之旅!輸入關鍵字、專利號、申請人或發明人姓名,即可搜尋全球專利資料庫,獲得詳細的專利資訊和AI生成摘要。
        </span>
        <div className="relative flex w-full items-center">
          <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="輸入關鍵字、專利號、申請人或發明人姓名"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 h-9 w-9 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">清除搜尋</span>
            </Button>
          )}
        </div>

        <div className="bg-gray-100 rounded-xl w-full p-4">
          <div className="flex items-center space-x-2 mb-4">
            <FilterIcon className="size-5" />
            <span className="font-bold">篩選條件</span>
            {isLoading && <span className="text-sm text-gray-500">載入篩選選項中...</span>}
            {error && <span className="text-sm text-red-500">載入篩選選項失敗</span>}
          </div>
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-medium mb-2">專利類型</span>
              {isLoading
                ? (
                    <div className="ml-4 text-sm text-gray-500">載入中...</div>
                  )
                : (
                    renderFilterButtons(patentTypes, 'patentType')
                  )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium mb-2">案件類型</span>
              {isLoading
                ? (
                    <div className="ml-4 text-sm text-gray-500">載入中...</div>
                  )
                : (
                    renderFilterButtons(caseTypes, 'caseType')
                  )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium mb-2">年份</span>
              {isLoading
                ? (
                    <div className="ml-4 text-sm text-gray-500">載入中...</div>
                  )
                : (
                    renderFilterButtons(years, 'year')
                  )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium mb-2">國家</span>
              {isLoading
                ? (
                    <div className="ml-4 text-sm text-gray-500">載入中...</div>
                  )
                : (
                    renderFilterButtons(countries, 'country')
                  )}
            </div>
          </div>
          <div className="border-t pt-4 mt-4 flex justify-between">
            <Button variant="outline" onClick={clearFilters}>
              清除所有篩選
            </Button>
            <Button onClick={startSearch} disabled={isSearching}>
              {isSearching ? '搜尋中...' : '開始搜尋'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatentsPage
