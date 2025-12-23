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

// 層級模式選項 - 根據 API 文檔
const levelModeOptions = [
  { value: 'BU', label: '本部' },
  { value: 'DIV', label: '處級' },
  { value: 'DEPT', label: '部級' }
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
    LevelMode: string
    FilterUnits: string // 支持多選，用逗號分隔
    FilterSystems: string[] // 保持陣列支援複選
  }
  onFilterChange?: (filters: any) => void
}

const AnalysisFilter = ({
  filters = {
    AnalysisType: 'clickrate',
    FunctionMode: 'UnitCentric',
    Year: new Date().getFullYear(),
    Month: new Date().getMonth() + 1, // 預設選擇當前月份
    LevelMode: 'DIV',
    FilterUnits: 'all',
    FilterSystems: ['all'] // 預設選擇全部
  }, onFilterChange
}: AnalysisFilterProps) => {
  const router = useRouter()

  // 確保 FilterSystems 是陣列格式
  const normalizedFilters = {
    ...filters,
    FilterSystems: Array.isArray(filters.FilterSystems) ? filters.FilterSystems : [filters.FilterSystems]
  }

  const [unitOptions, setUnitOptions] = useState([
    { value: 'all', label: '全部' }
  ])

  const [systemOptions, setSystemOptions] = useState([
    { value: 'all', label: '全部系統' }
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

    // 如果變更的是會影響單位或系統選項的條件，重置這兩個篩選
    if (['FunctionMode', 'Year', 'Month', 'LevelMode'].includes(key)) {
      newFilters.FilterUnits = 'all'
      newFilters.FilterSystems = ['all']
    }

    onFilterChange?.(newFilters)
  }

  // 獲取年份月份選項
  const fetchYearMonthOptions = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_analysis_API_URL
      const response = await fetch(`${baseUrl}/api/Statistics/getclickrate/yearmonth-options`)

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
        LevelMode: filters.LevelMode,
        FilterUnits: 'all',
        FilterSystems: 'all'
      })

      const baseUrl = process.env.NEXT_PUBLIC_analysis_API_URL
      const response = await fetch(`${baseUrl}/api/Statistics/getclickrate?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        // 提取唯一的 BU 選項 (檢查 bu 欄位是否存在)
        const uniqueBUs = data
          .filter((item) => item.bu) // 過濾掉沒有 bu 欄位的項目
          .map((item) => item.bu)
          .filter((bu, index, arr) => arr.indexOf(bu) === index) // 去重

        const buOptions = [
          { value: 'all', label: '全部' },
          ...uniqueBUs.map((bu) => ({ value: bu, label: bu }))
        ]

        // 提取唯一的 System 選項 (檢查 system 欄位是否存在)
        const uniqueSystems = data
          .filter((item) => item.system) // 過濾掉沒有 system 欄位的項目
          .map((item) => item.system)
          .filter((system, index, arr) => arr.indexOf(system) === index) // 去重

        const sysOptions = [
          { value: 'all', label: '全部系統' },
          ...uniqueSystems.map((system) => ({ value: system, label: system }))
        ]

        setUnitOptions(buOptions)
        setSystemOptions(sysOptions)
      }
      else {
        // 如果沒有資料，重置為預設選項
        setUnitOptions([{ value: 'all', label: '全部' }])
        setSystemOptions([{ value: 'all', label: '全部系統' }])
      }
    }
    catch (error) {
      console.error('獲取篩選選項失敗:', error)
      // 發生錯誤時重置為預設選項
      setUnitOptions([{ value: 'all', label: '全部' }])
      setSystemOptions([{ value: 'all', label: '全部系統' }])
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
  }, [filters.FunctionMode, filters.Year, filters.Month, filters.LevelMode])

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

        {/* 層級模式 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-900'>
            層級模式
          </label>
          <select
            className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            value={filters.LevelMode}
            onChange={(e) => { handleFilterChange('LevelMode', e.target.value) }}
          >
            {levelModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 單位過濾 - 複選框形式 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-900'>
            單位過濾
            {unitOptions.length > 1 && (
              <span className='font-normal text-gray-500'> (可複選)</span>
            )}
          </label>
          <div className='max-h-48 overflow-y-auto rounded-md border border-gray-300 bg-white p-2'>
            {unitOptions.map((option) => (
              <div key={option.value} className='flex items-center space-x-2 py-1'>
                <input
                  type='checkbox'
                  id={`unit-${option.value}`}
                  className='size-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500'
                  checked={filters.FilterUnits === 'all'
                    ? option.value === 'all'
                    : filters.FilterUnits.split(',').includes(option.value)}
                  onChange={(e) => {
                    if (option.value === 'all') {
                      // 如果點擊"全部"，則清除其他選項
                      handleFilterChange('FilterUnits', 'all')
                    }
                    else {
                      const currentUnits = filters.FilterUnits === 'all' ? [] : filters.FilterUnits.split(',').filter((u) => u !== 'all')

                      if (e.target.checked) {
                        // 添加新選項
                        const newUnits = [...currentUnits, option.value]
                        handleFilterChange('FilterUnits', newUnits.join(','))
                      }
                      else {
                        // 移除選項
                        const newUnits = currentUnits.filter((u) => u !== option.value)
                        handleFilterChange('FilterUnits', newUnits.length > 0 ? newUnits.join(',') : 'all')
                      }
                    }
                  }}
                  disabled={unitOptions.length <= 1}
                />
                <label
                  htmlFor={`unit-${option.value}`}
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
            {filters.FilterUnits === 'all' ? '全部' : `${filters.FilterUnits.split(',').length} 個單位`}
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
                    if (option.value === 'all') {
                      // 如果點擊"全部系統"，則清除其他選項
                      handleFilterChange('FilterSystems', ['all'])
                    }
                    else {
                      const currentSystems = normalizedFilters.FilterSystems.filter((s) => s !== 'all')

                      if (e.target.checked) {
                        // 添加新選項
                        const newSystems = [...currentSystems, option.value]
                        handleFilterChange('FilterSystems', newSystems)
                      }
                      else {
                        // 移除選項
                        const newSystems = currentSystems.filter((s) => s !== option.value)
                        handleFilterChange('FilterSystems', newSystems.length > 0 ? newSystems : ['all'])
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
            {normalizedFilters.FilterSystems.includes('all') ? ' (全部)' : ` (${normalizedFilters.FilterSystems.join(', ')})`}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisFilter
