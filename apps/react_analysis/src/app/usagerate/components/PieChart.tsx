'use client'

import { useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import BarChartComponent from './BarChart'

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
  FilterBU: string // BU篩選
  FilterLOB: string // LOB篩選，支持多選，用逗號分隔
  FilterSystems: string[] // 改為陣列類型
}

interface PieChartComponentProps {
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
  '#6B7280', // 灰色
]

export default function PieChartComponent({ filters, chartData, loading, error }: PieChartComponentProps) {
  const [activeTab] = useState<'pie' | 'bar'>('pie') // tab 狀態

  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.fullName}</p>
          <p className="text-blue-600">
            數量:
            {data.value}
          </p>
          <p className="text-green-600">
            比例:
            {data.percent}
          </p>
        </div>
      )
    }
    return null
  }

  // 自定義 Legend
  const renderCustomLegend = (props: any) => {
    const { payload } = props

    // 按照百分比大小排序（從高到低）
    const sortedPayload = payload.sort((a: any, b: any) => {
      const aPercent = Number.parseFloat(a.payload.percent.replace('%', ''))
      const bPercent = Number.parseFloat(b.payload.percent.replace('%', ''))
      return bPercent - aPercent
    })

    return (
      <div className="grid grid-cols-4 gap-2 mt-4 text-sm">
        {sortedPayload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 truncate" title={entry.payload.fullName}>
              {entry.payload.name}
              {' '}
              (
              {entry.payload.percent}
              )
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold mb-2">載入失敗</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
          {filters.FunctionMode === 'SystemCentric'
            ? '系統使用率分布'
            : '部門使用率分布'}
        </h3>
        <div className="text-sm text-gray-600 mt-1">
          分析模式：
          {filters.FunctionMode === 'SystemCentric'
            ? '以系統為中心，分析各系統的使用情況'
            : '以部門為中心，分析各部門的使用情況'}
        </div>
      </div>

      {chartData.length > 0
        ? (
            <div>
              {activeTab === 'pie'
                ? (
                    <div style={{ width: '100%', height: '800px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={250}
                            dataKey="value"
                            labelLine={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend content={renderCustomLegend} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )
                : (
                    <BarChartComponent
                      filters={filters}
                      chartData={chartData}
                      loading={loading}
                      error={error}
                    />
                  )}
            </div>
          )
        : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-500">暫無數據</p>
            </div>
          )}
    </div>
  )
}
