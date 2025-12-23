'use client'

import { BarChart3, PieChart } from 'lucide-react'
import { useState } from 'react'

import BarChartComponent from './bar-chart'
import PieChartComponent from './pie-chart'

interface ChartData {
  name: string
  value: number
  percent: string
  fullName: string

}

interface FilterState {
  FunctionMode: string
  Year: number
  Month: number
  FilterBU: string // BU篩選
  FilterLOB: string // LOB篩選，支持多選，用逗號分隔
  FilterSystems: string[]
}

interface ChartContainerProps {
  filters: FilterState
  chartData: ChartData[]
  loading: boolean
  error: string | null
}

type ChartType = 'bar' | 'pie'

export default function ChartContainer({ filters, chartData, loading, error }: ChartContainerProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')

  if (loading) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='animate-pulse'>
          <div className='h-64 rounded-sm bg-gray-200'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='text-center text-red-500'>
          <p>
            錯誤:
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='relative rounded-lg bg-white shadow-sm'>
      {/* 切換按鈕 - 位於右上角 */}
      <div className='absolute top-4 right-4 z-10'>
        <div className='flex rounded-lg bg-gray-100 p-1'>
          <button
            type='button'
            onClick={() => { setChartType('bar') }}
            className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className='size-4' />
            <span>長條圖</span>
          </button>
          <button
            type='button'
            onClick={() => { setChartType('pie') }}
            className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              chartType === 'pie'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PieChart className='size-4' />
            <span>圓餅圖</span>
          </button>
        </div>
      </div>

      {/* 圖表內容 */}
      <div className='pt-6'>
        {chartType === 'bar'
          ? (
              <BarChartComponent
                filters={filters}
                chartData={chartData}
                loading={loading}
                error={error}
              />
            )
          : (
              <PieChartComponent
                filters={filters}
                chartData={chartData}
                loading={loading}
                error={error}
              />
            )}
      </div>
    </div>
  )
}
