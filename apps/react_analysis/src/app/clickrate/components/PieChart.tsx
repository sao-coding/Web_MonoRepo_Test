'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface ChartData {
  name: string
  value: number
  percent: string
  fullName: string
  [key: string]: any // Add index signature to allow any string key
}

interface FilterState {
  FunctionMode: string
  Year: number
  Month: number
  LevelMode: string
  FilterUnits: string
  FilterSystems: string[]
}

interface PieChartComponentProps {
  chartData: ChartData[]
  filters?: FilterState // 改為可選參數
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

export default function PieChartComponent({ chartData, filters }: PieChartComponentProps) {
  // 為 filters 提供預設值
  const safeFilters = filters || {
    FunctionMode: 'SystemCentric',
    Year: new Date().getFullYear(),
    Month: new Date().getMonth() + 1,
    LevelMode: 'ALL',
    FilterUnits: 'ALL',
    FilterSystems: ['ALL'],
  }

  // 動態計算容器高度的函數
  const calculateContainerHeight = (dataLength: number) => {
    // 基礎高度：圓餅圖本身需要的空間
    const baseHeight = 600

    // 每個 legend 項目大約需要的高度（考慮 grid-cols-4）
    const itemsPerRow = 4
    const itemHeight = 32 // 包含 gap 和 padding
    const rows = Math.ceil(dataLength / itemsPerRow)

    // Legend 需要的額外高度
    const legendHeight = rows * itemHeight + 60 // 60px 是額外的 padding 和 margin

    // 如果項目很少（<=12個），使用基礎高度
    if (dataLength <= 12) {
      return Math.max(baseHeight, 500 + legendHeight)
    }

    // 項目很多時，適當增加高度
    return baseHeight + legendHeight
  }
  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.fullName}</p>
          <p className="text-blue-600">
            數量:
            {' '}
            {data.value.toLocaleString()}
          </p>
          <p className="text-green-600">
            比例:
            {' '}
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

    // 根據數據量調整 grid 列數
    const getGridCols = (dataLength: number) => {
      if (dataLength <= 8) {
        return 'grid-cols-2'
      }
      if (dataLength <= 20) {
        return 'grid-cols-3'
      }
      return 'grid-cols-4'
    }

    return (
      <div className={`grid ${getGridCols(sortedPayload.length)} gap-2 mt-4 text-sm px-4`}>
        {sortedPayload.map((entry: any, _index: number) => (
          <div key={`legend-${entry.payload.name}`} className="flex items-center space-x-2 min-h-[24px]">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span
              className="text-gray-700 truncate text-xs"
              title={entry.payload.fullName}
              style={{ fontSize: '11px', lineHeight: '1.2' }}
            >
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
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
          {safeFilters.FunctionMode === 'SystemCentric'
            ? '系統點擊率分布'
            : '部門點擊率分布'}
        </h3>
        <div className="text-sm text-gray-600 mt-1">
          分析模式：
          {safeFilters.FunctionMode === 'SystemCentric'
            ? '以系統為中心，分析各系統的點擊情況'
            : '以部門為中心，分析各部門的點擊情況'}
        </div>
      </div>

      <div style={{ width: '100%', height: `${calculateContainerHeight(chartData.length)}px` }}>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              // label={({ name, percent }) => `${name} ${percent}`}
              outerRadius={250}
              fill="#8884d8"
              dataKey="value"

            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderCustomLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
