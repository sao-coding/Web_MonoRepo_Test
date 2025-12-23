'use client'

import type { PatentFilterMeta } from '../_types'
import type { Patent } from '../_types/patent'
import type { ApiResponse } from '@/types/api'
import { useQuery } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { Info } from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { usePatentsAiSummaryStore } from '@/store/patents-ai-summary'
import Pagination from './pagination'
import PatentsCard from './patents-card'

const SearchResults = ({
  maxVisiblePages = 5,
  pk,
  onSendMessage,
  selectedSeqNo,
  onSelectCard,
  onClearSelect,
}: {
  maxVisiblePages?: number
  pk: boolean
  selectedSeqNo?: number[]
  onSelectCard?: (seqNo: number, patentNumber: string, pk?: boolean) => void
  onClearSelect?: () => void
  onSendMessage?: (input: string, isSelectCard?: number[]) => void
}) => {
  const { setSearchContainer } = usePatentsAiSummaryStore()
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const [page, setPage] = useQueryState('page', {
    defaultValue: '1',
  })
  const [isHoveringInfo, setIsHoveringInfo] = useState(false)
  const [hoveredInfo, setHoveredInfo] = useState<{ x: number, y: number }>({
    x: 0,
    y: 0,
  })
  const infoBoxRef = useRef<HTMLDivElement>(null)

  // API 查詢
  const { data, isLoading, error } = useQuery<ApiResponse<Patent[], PatentFilterMeta>>({
    queryKey: [
      'searchResults',
      id,
      page,
    ],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicitypatents/search/${id}?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setSearchContainer(data.meta.searchContainer)
      return data
    },
  })

  // 分頁處理
  const handlePageChange = (newPage: number) => {
    setPage(String(newPage))
  }

  // 派生狀態
  const currentPage = Number(page)
  const totalPages = data?.meta?.totalPages || 1
  const searchContainer = data?.meta?.searchContainer as PatentFilterMeta['searchContainer'] || {
    id: 0,
    title: '',
    keyword: '',
    createDate: '',
    keyinUser: '',
    conditions: {
      patentTypes: [],
      caseTypes: [],
      years: [],
      countries: [],
    },
  }

  const patentsData = data?.data || []

  // 載入狀態
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="text-red-500">
          載入失敗：
          {error instanceof Error ? error.message : '未知錯誤'}
        </div>
      </div>
    )
  }

  // 無資料狀態
  if (patentsData.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="text-gray-500">沒有找到相關專利資料</div>
      </div>
    )
  }

  const handleMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsHoveringInfo(true)
    setHoveredInfo({
      x: e.pageX - 255,
      y: e.clientY + 10,
    })
  }

  const handleMouseLeave = () => {
    setIsHoveringInfo(false)
  }

  const handleClearSelect = () => {
    onClearSelect?.()
  }

  return (
    <>
      {pathname.includes('/chat') && !pk && (
        <div className="p-2">
          <div className="flex justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                搜尋結果
              </h2>
              <Info
                fill="#000"
                stroke="#fff"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
              {isHoveringInfo && (
                <div
                  ref={infoBoxRef}
                  className="absolute z-10 w-[250px] bg-white border border-gray-300 shadow-lg p-4 inline-block"
                  style={{
                    borderRadius: '10px 0 10px 10px',
                    left: hoveredInfo.x,
                    top: hoveredInfo.y,
                  }}
                >
                  選取如下多個專利項目後，於對話區塊下方送出訊息發問，即可針對所選項目進行多筆詢問。
                </div>
              )}
            </div>
            <Button
              onClick={handleClearSelect}
              disabled={selectedSeqNo?.length === 0}
            >
              清除所選 (
              {selectedSeqNo?.length || 0}
              )
            </Button>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            關鍵字:
            {' '}
            {searchContainer.keyword || '無'}
          </div>
          <div className="text-sm text-gray-500">
            搜尋條件:
            {' '}
            {/* 只顯示條件值，並將 patentTypes、caseTypes 轉換為中文 */}
            {searchContainer.conditions.patentTypes?.map((pt) => {
              const patentTypes = [
                { name: '發明', value: 'I' },
                { name: '新型', value: 'M' },
                { name: '設計', value: 'D' },
              ]
              const found = patentTypes.find(item => item.value === pt)
              return (
                <span key={pt} className="mr-2">
                  {found ? found.name : pt}
                </span>
              )
            })}
            {searchContainer.conditions.caseTypes?.map((ct) => {
              const caseTypes = [
                { name: '公開案', value: 'A' },
                { name: '公告案', value: 'B' },
              ]
              const found = caseTypes.find(item => item.value === ct)
              return (
                <span key={ct} className="mr-2">
                  {found ? found.name : ct}
                </span>
              )
            })}
            {searchContainer.conditions.years?.map(year => (
              <span key={year} className="mr-2">
                {year}
              </span>
            ))}
            {searchContainer.conditions.countries?.map(country => (
              <span key={country} className="mr-2">
                {country}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className={`p-2 overflow-y-auto flex ${pk
        ? ''
        : 'flex-col'
        }`}
      >
        <div
          className={`flex-1 ${pk
            ? 'flex gap-4'
            : 'grid gap-4'
            }`}
        >
          {patentsData.map((item, index) => (
            <PatentsCard
              key={item.seqNo}
              index={(currentPage - 1) * 10 + index + 1}
              currentPage={currentPage}
              pk={pk}
              searchContainer={searchContainer}
              item={item}
              onSendMessage={onSendMessage}
              onSelectCard={(seqNo, patentNumber) => onSelectCard?.(seqNo, patentNumber, pk)}
              isSelected={selectedSeqNo?.includes(item.seqNo)}
            />
          ))}
        </div>
      </div>
      <div
        className={`p-2 ${pk
          ? ''
          : 'border-t'
          }`}
      >
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          maxVisiblePages={maxVisiblePages}
        />
      </div>
    </>
  )
}

export default SearchResults
