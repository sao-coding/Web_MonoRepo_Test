'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ChartData {
  name: string
  value: number
  percent: string
  fullName: string
  [key: string]: any // 添加字符串索引簽名，允許任意字符串鍵
}

interface FilterState {
  FunctionMode: string
  Year: number
  Month: number
  LevelMode: string
  FilterUnits: string
  FilterSystems: string[]
}

interface BarChartComponentProps {
  filters: FilterState
  chartData: ChartData[]
  loading: boolean
  error: string | null
}

// 顏色配置
const COLORS = [
  '#3B82F6', // 藍色
  '#10B981', // 綠色
  '#F59E0B', // 橙色
  '#EF4444', // 紅色
  '#8B5CF6', // 紫色
  '#06B6D4', // 青色
  '#F97316', // 深橙色
  '#84CC16', // 萊姆綠
  '#EC4899', // 粉紅色
  '#6B7280' // 灰色
]

export default function BarChartComponent({ chartData, filters, loading, error }: BarChartComponentProps) {
  // 為 filters 提供預設值
  const safeFilters = filters || {
    FunctionMode: 'SystemCentric',
    Year: new Date().getFullYear(),
    Month: new Date().getMonth() + 1,
    LevelMode: 'ALL',
    FilterUnits: 'ALL',
    FilterSystems: ['ALL']
  }

  // 處理載入狀態
  if (loading) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='animate-pulse'>
          <div className='h-64 rounded-sm bg-gray-200'></div>
        </div>
      </div>
    )
  }

  // 處理錯誤狀態
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
  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0].payload
      return (
        <div className='rounded-lg border border-gray-200 bg-white p-3 shadow-lg'>
          <p className='font-semibold text-gray-800'>{data.fullName}</p>
          <p className='text-blue-600'>
            數量:
            {' '}
            {data.value.toLocaleString()}
          </p>
          <p className='text-green-600'>
            比例:
            {' '}
            {data.percent}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className='rounded-lg bg-white p-6 shadow-sm'>
      <div className='mb-4'>
        <h3 className='flex items-center text-lg font-bold text-gray-800'>
          <span className='mr-2 size-3 rounded-full bg-black'></span>
          {safeFilters.FunctionMode === 'SystemCentric'
            ? '系統點擊率分布'
            : '部門點擊率分布'}
        </h3>
        <div className='mt-1 text-sm text-gray-600'>
          分析模式：
          {safeFilters.FunctionMode === 'SystemCentric'
            ? '以系統為中心，分析各系統的點擊情況'
            : '以部門為中心，分析各部門的點擊情況'}
        </div>
      </div>

      <div style={{ width: '100%', height: '600px' }}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 100
            }}
          >
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={100}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey='value' name='數量'>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
