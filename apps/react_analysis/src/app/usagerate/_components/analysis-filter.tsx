'use client'

import { Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useEffect, useState } from 'react'

// 分析類型選項
const analysisTypeOptions = [
  { value: 'clickrate', label: '點擊率分析' },
  { value: 'usage', label: '使用率分析' }
]

// 功能模式選項 - 根據 API 文檔
const functionModeOptions = [
  { value: 'SystemCentric', label: 'SystemCentric (系統分析)' },
  { value: 'UnitCentric', label: 'UnitCentric (部門分析)' }
]

interface YearMonthOption {
  year: number
  month: number
}

interface AnalysisFilterProps {
  filters?: {
    AnalysisType: string
    FunctionMode: string
    Year: number
    Month: number // 改回單選
    FilterBU: string // BU篩選
    FilterLOB: string // LOB篩選，支持多選，用逗號分隔
    FilterSystems: string[] // 保持陣列支援複選
  }
  onFilterChange?: (filters: any) => void
}

const AnalysisFilter: React.FC<AnalysisFilterProps> = ({
  filters = {
    AnalysisType: 'usage',
    FunctionMode: 'SystemCentric',
    Year: 2025,
    Month: 8, // 預設選擇8月
    FilterBU: 'ALL',
    FilterLOB: 'ALL',
    FilterSystems: ['ALL'] // 預設選擇全部
  }, onFilterChange
}) => {
  const router = useRouter()

  // 確保 FilterSystems 是陣列格式
  const normalizedFilters = {
    ...filters,
    FilterSystems: Array.isArray(filters.FilterSystems) ? filters.FilterSystems : [filters.FilterSystems]
  }

  const [buOptions, setBuOptions] = useState([
    { value: 'ALL', label: '全部' }
  ])

  const [lobOptions, setLobOptions] = useState([
    { value: 'ALL', label: '全部' }
  ])

  const [systemOptions, setSystemOptions] = useState([
    { value: 'ALL', label: '全部系統' }
  ])

  // 新增：年份和月份選項的狀態
  const [yearMonthOptions, setYearMonthOptions] = useState<YearMonthOption[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [availableMonths, setAvailableMonths] = useState<number[]>([])

  // 根據選中的年份更新可用月份
  const updateAvailableMonths = (data: YearMonthOption[], selectedYear: number) => {
    const monthsForYear = data
      .filter((item) => item.year === selectedYear)
      .map((item) => item.month)
      .sort((a, b) => a - b)

    setAvailableMonths(monthsForYear)
  }

  // 處理篩選條件變更
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }

    // 如果變更的是會影響BU、LOB或系統選項的條件，重置這些篩選
    if (['FunctionMode', 'Year', 'Month'].includes(key)) {
      newFilters.FilterBU = 'ALL'
      newFilters.FilterLOB = 'ALL'
      newFilters.FilterSystems = ['ALL']
    }
    // 如果變更BU，重置LOB和系統篩選
    else if (key === 'FilterBU') {
      newFilters.FilterLOB = 'ALL'
      newFilters.FilterSystems = ['ALL']
    }

    onFilterChange?.(newFilters)
  }

  // 獲取年份月份選項
  const fetchYearMonthOptions = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_analysis_API_URL
      const response = await fetch(`${baseUrl}/api/Statistics/getusagerate/yearmonth-options`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: YearMonthOption[] = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        setYearMonthOptions(data)

        // 提取唯一的年份，並按降序排列
        const uniqueYears = [...new Set(data.map((item) => item.year))].sort((a, b) => b - a)
        setAvailableYears(uniqueYears)

        // 根據當前選中的年份，設定可用的月份
        updateAvailableMonths(data, filters.Year)
      }
      else {
        // 如果沒有資料，設定預設值
        setYearMonthOptions([])
        setAvailableYears([2025])
        setAvailableMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      }
    }
    catch (error) {
      console.error('獲取年份月份選項失敗:', error)
      // 發生錯誤時設定預設值
      setYearMonthOptions([])
      setAvailableYears([2025])
      setAvailableMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    }
  }

  // 獲取篩選選項的函數
  const fetchFilterOptions = async () => {
    try {
      const params = new URLSearchParams({
        FunctionMode: filters.FunctionMode,
        Year: filters.Year.toString(),
        Month: filters.Month.toString(), // 使用選中的月份
        FilterBU: filters.FilterBU, // 使用選中的BU來獲取對應的LOB
        FilterLOB: 'ALL',
        FilterSystems: 'ALL'
      })

      const baseUrl = process.env.NEXT_PUBLIC_analysis_API_URL
      const response = await fetch(`${baseUrl}/api/Statistics/getusagerate?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        // 提取唯一的 BU 選項
        const uniqueBUs = data
          .filter((item) => item.bu && item.bu !== null) // 過濾掉沒有 bu 欄位或為 null 的項目
          .map((item) => item.bu)
          .filter((bu, index, arr) => arr.indexOf(bu) === index) // 去重

        const buOptionsList = [
          { value: 'ALL', label: '全部' },
          ...uniqueBUs.map((bu) => ({ value: bu, label: bu }))
        ]

        // 根據選擇的BU來篩選LOB選項
        let filteredData = data
        if (filters.FilterBU !== 'ALL') {
          filteredData = data.filter((item) => item.bu === filters.FilterBU)
        }

        // 提取唯一的 LOB 選項 (包含null值的處理)
        const uniqueLOBs = filteredData
          .map((item) => item.lob) // 包含 null 值
          .filter((lob, index, arr) => arr.indexOf(lob) === index) // 去重
          .filter((lob) => lob !== null) // 過濾掉 null 值

        const lobOptionsList = [
          { value: 'ALL', label: '全部' },
          ...uniqueLOBs.map((lob) => ({ value: lob, label: lob }))
        ]

        // 提取唯一的 System 選項 (檢查 system 欄位是否存在)
        const uniqueSystems = data // 系統選項不受BU限制，使用全部數據
          .filter((item) => item.system) // 過濾掉沒有 system 欄位的項目
          .map((item) => item.system)
          .filter((system, index, arr) => arr.indexOf(system) === index) // 去重

        const sysOptions = [
          { value: 'ALL', label: '全部系統' },
          ...uniqueSystems.map((system) => ({ value: system, label: system }))
        ]

        setBuOptions(buOptionsList)
        setLobOptions(lobOptionsList)
        setSystemOptions(sysOptions)
      }
      else {
        // 如果沒有資料，重置為預設選項
        setBuOptions([{ value: 'ALL', label: '全部' }])
        setLobOptions([{ value: 'ALL', label: '全部' }])
        setSystemOptions([{ value: 'ALL', label: '全部系統' }])
      }
    }
    catch (error) {
      console.error('獲取篩選選項失敗:', error)
      // 發生錯誤時重置為預設選項
      setBuOptions([{ value: 'ALL', label: '全部' }])
      setLobOptions([{ value: 'ALL', label: '全部' }])
      setSystemOptions([{ value: 'ALL', label: '全部系統' }])
    }
  }

  // 單獨獲取LOB選項的函數
  const fetchLOBOptions = async () => {
    try {
      const params = new URLSearchParams({
        FunctionMode: filters.FunctionMode,
        Year: filters.Year.toString(),
        Month: filters.Month.toString(),
        FilterBU: 'ALL', // 先獲取所有數據
        FilterLOB: 'ALL',
        FilterSystems: 'ALL'
      })

      const baseUrl = process.env.NEXT_PUBLIC_analysis_API_URL
      const response = await fetch(`${baseUrl}/api/Statistics/getusagerate?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        // 根據選擇的BU來篩選LOB選項
        let filteredData = data
        if (filters.FilterBU !== 'ALL') {
          filteredData = data.filter((item) => item.bu === filters.FilterBU)
        }

        // 提取唯一的 LOB 選項 (包含null值的處理)
        const uniqueLOBs = filteredData
          .map((item) => item.lob) // 包含 null 值
          .filter((lob, index, arr) => arr.indexOf(lob) === index) // 去重
          .filter((lob) => lob !== null) // 過濾掉 null 值

        const lobOptionsList = [
          { value: 'ALL', label: '全部' },
          ...uniqueLOBs.map((lob) => ({ value: lob, label: lob }))
        ]

        setLobOptions(lobOptionsList)
      }
      else {
        setLobOptions([{ value: 'ALL', label: '全部' }])
      }
    }
    catch (error) {
      console.error('獲取LOB選項失敗:', error)
      setLobOptions([{ value: 'ALL', label: '全部' }])
    }
  }

  // 組件初始化時獲取年份月份選項
  useEffect(() => {
    fetchYearMonthOptions()
  }, [])

  // 當年份改變時，更新可用月份並重置月份選擇
  useEffect(() => {
    if (yearMonthOptions.length > 0) {
      updateAvailableMonths(yearMonthOptions, filters.Year)

      // 檢查當前選中的月份是否在新年份的可用月份中
      const monthsForYear = yearMonthOptions
        .filter((item) => item.year === filters.Year)
        .map((item) => item.month)

      if (!monthsForYear.includes(filters.Month)) {
        // 如果當前月份不可用，選擇該年份的第一個可用月份
        const firstAvailableMonth = Math.min(...monthsForYear)
        handleFilterChange('Month', firstAvailableMonth)
      }
    }
  }, [filters.Year, yearMonthOptions])

  // 當關鍵篩選條件變更時重新獲取選項
  useEffect(() => {
    fetchFilterOptions()
  }, [filters.FunctionMode, filters.Year, filters.Month]) // 移除 FilterBU，因為BU改變時不需要重新獲取BU選項

  // 當BU改變時，單獨更新LOB選項
  useEffect(() => {
    if (buOptions.length > 1) { // 確保BU選項已經載入
      fetchLOBOptions()
    }
  }, [filters.FilterBU])

  // 處理分析類型變更（路由跳轉）
  const handleAnalysisTypeChange = (analysisType: string) => {
    if (analysisType === 'clickrate') {
      router.push('/clickrate')
    }
    else if (analysisType === 'usage') {
      router.push('/usagerate')
    }
  }

  return (
    <div className='w-80 border-l border-gray-200 bg-white shadow-lg'>
      {/* Header */}
      <div className='border-b border-gray-200 p-4'>
        <h2 className='flex items-center gap-2 text-lg font-semibold text-gray-800'>
          <Filter className='text-gray-600' />
          篩選器
        </h2>
      </div>

      {/* Content */}
      <div className='space-y-6 p-5'>
        {/* 分析類型 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-900'>
            分析類型
          </label>
          <select
            className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            value={filters.AnalysisType}
            onChange={(e) => { handleAnalysisTypeChange(e.target.value) }}
          >
            {analysisTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 功能模式 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-900'>
            功能模式
          </label>
          <select
            className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            value={filters.FunctionMode}
            onChange={(e) => {
              handleFilterChange('FunctionMode', e.target.value)
            }}
          >
            {functionModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className='mt-1 text-xs text-gray-500'>
            當前選擇:
            {' '}
            {filters.FunctionMode}
          </div>
        </div>

        {/* 年份 - 改為下拉選單 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-900'>
            年份
          </label>
          <select
            className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            value={filters.Year}
            onChange={(e) => { handleFilterChange('Year', Number.parseInt(e.target.value)) }}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
                年
              </option>
            ))}
          </select>
        </div>

        {/* 月份 - 單選下拉，基於選中年份的可用月份 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-900'>
            月份
          </label>
          <select
            className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            value={filters.Month}
            onChange={(e) => { handleFilterChange('Month', Number.parseInt(e.target.value)) }}
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}
                月
              </option>
            ))}
          </select>
          {availableMonths.length === 0 && (
            <div className='mt-1 text-xs text-red-500'>
              該年份暫無可用月份資料
            </div>
          )}
        </div>

        {/* BU選擇 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-900'>
            BU選擇
          </label>
          <select
            className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            value={filters.FilterBU}
            onChange={(e) => { handleFilterChange('FilterBU', e.target.value) }}
          >
            {buOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* LOB過濾 - 複選框形式 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-900'>
            LOB過濾
            {lobOptions.length > 1 && (
              <span className='font-normal text-gray-500'> (可複選)</span>
            )}
          </label>
          <div className='max-h-48 overflow-y-auto rounded-md border border-gray-300 bg-white p-2'>
            {lobOptions.map((option) => (
              <div key={option.value} className='flex items-center space-x-2 py-1'>
                <input
                  type='checkbox'
                  id={`lob-${option.value}`}
                  className='size-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500'
                  checked={filters.FilterLOB === 'ALL'
                    ? option.value === 'ALL'
                    : (filters.FilterLOB || '').split(',').includes(option.value)}
                  onChange={(e) => {
                    if (option.value === 'ALL') {
                      // 如果點擊"全部"，則清除其他選項
                      handleFilterChange('FilterLOB', 'ALL')
                    }
                    else {
                      const currentLOBs = filters.FilterLOB === 'ALL' ? [] : (filters.FilterLOB || '').split(',').filter((l) => l !== 'ALL')

                      if (e.target.checked) {
                        // 添加新選項
                        const newLOBs = [...currentLOBs, option.value]
                        handleFilterChange('FilterLOB', newLOBs.join(','))
                      }
                      else {
                        // 移除選項
                        const newLOBs = currentLOBs.filter((l) => l !== option.value)
                        handleFilterChange('FilterLOB', newLOBs.length > 0 ? newLOBs.join(',') : 'ALL')
                      }
                    }
                  }}
                  disabled={lobOptions.length <= 1}
                />
                <label
                  htmlFor={`lob-${option.value}`}
                  className='flex-1 cursor-pointer text-sm text-gray-700'
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          <div className='mt-2 text-xs text-gray-500'>
            已選擇:
            {' '}
            {filters.FilterLOB === 'ALL' ? '全部' : `${(filters.FilterLOB || '').split(',').length} 個LOB`}
          </div>
        </div>

        {/* 系統篩選 - 複選框形式 */}
        <div>
          <label className='mb-2 block text-sm font-medium'>
            <span className='text-gray-900'>系統篩選 </span>
            {systemOptions.length > 1 && (
              <span className='font-normal text-gray-500'> (可複選)</span>
            )}
          </label>
          <div className='max-h-48 overflow-y-auto rounded-md border border-gray-300 bg-white p-2'>
            {systemOptions.map((option) => (
              <div key={option.value} className='flex items-center space-x-2 py-1'>
                <input
                  type='checkbox'
                  id={`system-${option.value}`}
                  className='size-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500'
                  checked={normalizedFilters.FilterSystems.includes(option.value)}
                  onChange={(e) => {
                    if (option.value === 'ALL') {
                      // 如果點擊"全部系統"，則清除其他選項
                      handleFilterChange('FilterSystems', ['ALL'])
                    }
                    else {
                      const currentSystems = normalizedFilters.FilterSystems.filter((s) => s !== 'ALL')

                      if (e.target.checked) {
                        // 添加新選項
                        const newSystems = [...currentSystems, option.value]
                        handleFilterChange('FilterSystems', newSystems)
                      }
                      else {
                        // 移除選項
                        const newSystems = currentSystems.filter((s) => s !== option.value)
                        handleFilterChange('FilterSystems', newSystems.length > 0 ? newSystems : ['ALL'])
                      }
                    }
                  }}
                  disabled={systemOptions.length <= 1}
                />
                <label
                  htmlFor={`system-${option.value}`}
                  className='flex-1 cursor-pointer text-sm text-gray-700'
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          <div className='mt-2 text-xs text-gray-500'>
            已選擇:
            {' '}
            {normalizedFilters.FilterSystems.length}
            {' '}
            個系統
            {normalizedFilters.FilterSystems.includes('ALL') ? ' (全部)' : ` (${normalizedFilters.FilterSystems.join(', ')})`}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisFilter
