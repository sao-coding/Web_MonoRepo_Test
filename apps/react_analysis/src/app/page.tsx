'use client'

import { Button } from '@msi/ui/components/button'
import { Card, CardContent } from '@msi/ui/components/card'
import { Activity, ArrowDownRight, ArrowUpRight, MousePointer, TrendingUp, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface SystemAnalysisData {
  totalClick: number
  topSystemClick: string
  topSystemCount: number
  totalClickGrowth: string
  totalUsage: number
  topSystemUsage: string
  topSystemUsageCount: number
  totalUsageGrowth: string
}

interface DepartmentAnalysisData {
  topUnitUsage: string
  topUnitCount: number
  topUnitPercent: string
  topUnitUsageGrowth: string
  topUnitClick: string
  topUnitClickCount: number
  topUnitClickPercent: string
  topUnitClickGrowth: string
}

interface TrendData {
  year: number
  month: number
  day: number | null
  totalClickCount: number
  totalUsageCount: number
}

export default function HomePage() {
  const router = useRouter()
  const [systemData, setSystemData] = useState<SystemAnalysisData | null>(null)
  const [departmentData, setDepartmentData] = useState<DepartmentAnalysisData | null>(null)
  const [monthlyData, setMonthlyData] = useState<TrendData[]>([])
  const [dailyData, setDailyData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_analysis_API_URL

        // 獲取所有數據
        const [systemRes, departmentRes, monthlyRes, dailyRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/Statistics/summary/system-analysis`),
          fetch(`${apiBaseUrl}/api/Statistics/summary/department-analysis`),
          fetch(`${apiBaseUrl}/api/Statistics/summary/monthly`),
          fetch(`${apiBaseUrl}/api/Statistics/summary/daily`),
        ])

        const systemAnalysis = await systemRes.json()
        const departmentAnalysis = await departmentRes.json()
        const monthly = await monthlyRes.json()
        const daily = await dailyRes.json()

        setSystemData(systemAnalysis)
        setDepartmentData(departmentAnalysis)
        setMonthlyData(monthly)
        setDailyData(daily)
      }
      catch (error) {
        console.error('Failed to fetch data:', error)
      }
      finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleNavigateToAnalysis = () => {
    router.push('/clickrate')
  }

  // 格式化月份數據
  const formattedMonthlyData = monthlyData.map(item => ({
    name: `${item.month}月`,
    總點擊數: item.totalClickCount,
    總使用數: item.totalUsageCount,
  }))

  // 格式化日期數據
  const formattedDailyData = dailyData.map(item => ({
    name: `${item.month}/${item.day}`,
    總點擊數: item.totalClickCount,
    總使用數: item.totalUsageCount,
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">系統數據分析總覽</h1>
          <p className="text-gray-600">系統各功能點擊率與歷史使用數據整合</p>
        </div>

        {/* 主要數據區塊 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 左側：系統分析 */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">系統分析</h2>
                </div>
              </div>

              {systemData
                ? (
                    (() => {
                      const isClickGrowthNegative = systemData.totalClickGrowth?.startsWith('-')
                      const isUsageGrowthNegative = systemData.totalUsageGrowth?.startsWith('-')

                      return (
                        <>
                          {/* 點擊數據和使用量數據並排 */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* 點擊數據 */}
                            <div className="border-r border-gray-200 pr-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <MousePointer className="w-5 h-5 text-blue-500" />
                                <span className="text-xl font-bold text-gray-600">Total Clicks</span>
                                <span className="text-2xl font-bold text-gray-900 ml-2">
                                  {systemData.totalClick?.toLocaleString() || '0'}
                                </span>
                              </div>
                              <div
                                className={`flex items-center text-sm font-medium ${
                                  isClickGrowthNegative
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {isClickGrowthNegative
                                  ? (<ArrowDownRight className="mr-1 h-4 w-4" />)
                                  : (<ArrowUpRight className="mr-1 h-4 w-4" />
                                    )}
                                {systemData.totalClickGrowth || '+0%'}
                              </div>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs text-gray-500">{systemData.topSystemClick || 'N/A'}</span>
                                <span className="text-xs text-gray-400">
                                  (
                                  {systemData.topSystemCount?.toLocaleString() || '0'}
                                  {' '}
                                  次)
                                </span>
                              </div>
                            </div>

                            {/* 使用量數據 */}
                            <div className="pl-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <Activity className="w-5 h-5 text-purple-500" />
                                <span className="text-xl font-bold text-gray-600">Total Usage</span>
                                <span className="text-2xl font-bold text-gray-900 ml-2">
                                  {systemData.totalUsage?.toLocaleString() || '0'}
                                </span>
                              </div>
                              <div
                                className={`flex items-center text-sm font-medium ${
                                  isUsageGrowthNegative
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {isUsageGrowthNegative
                                  ? (<ArrowDownRight className="mr-1 h-4 w-4" />)
                                  : (<ArrowUpRight className="mr-1 h-4 w-4" />
                                    )}
                                {systemData.totalUsageGrowth || '+0%'}
                              </div>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs text-gray-500">{systemData.topSystemUsage || 'N/A'}</span>
                                <span className="text-xs text-gray-400">
                                  (
                                  {systemData.topSystemUsageCount?.toLocaleString() || '0'}
                                  {' '}
                                  次)
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )
                    })()
                  )
                : (
                    <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No Data</p>
                        <p className="text-gray-400 text-sm">系統數據尚未可用</p>
                      </div>
                    </div>
                  )}

              <Button
                onClick={handleNavigateToAnalysis}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
              >
                查看詳細分析
              </Button>
            </CardContent>
          </Card>

          {/* 右側：部門分析 */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h2 className="text-xl font-semibold text-gray-900">部門分析</h2>
                </div>
              </div>

              {departmentData
                ? (
                    <>
                      {/* 最高點擊數據和最高使用量數據並排 */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* 最高點擊數據 */}
                        <div className="border-r border-gray-200 pr-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <MousePointer className="w-5 h-5 text-orange-500" />
                            <span className="text-xl font-bold text-gray-600">Highest Clicks</span>
                            <span className="text-2xl font-bold text-gray-900 ml-2">
                              {departmentData.topUnitClickCount?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className={`flex items-center text-sm font-medium ${departmentData.topUnitClickGrowth?.startsWith('-')
                            ? 'text-red-600'
                            : 'text-green-600'}`}
                          >
                            {departmentData.topUnitClickGrowth?.startsWith('-')
                              ? (<ArrowDownRight className="mr-1 h-4 w-4" />)
                              : (<ArrowUpRight className="mr-1 h-4 w-4" />)}
                            {departmentData.topUnitClickGrowth || '+0%'}
                          </div>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-500">{departmentData.topUnitClick || 'N/A'}</span>
                            <span className="text-xs text-gray-400">
                              (
                              {departmentData.topUnitClickPercent || '0%'}
                              )
                            </span>
                          </div>
                        </div>

                        {/* 最高使用量數據 */}
                        <div className="pl-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="w-5 h-5 text-purple-500" />
                            <span className="text-xl font-bold text-gray-600">Highest Usage</span>
                            <span className="text-2xl font-bold text-gray-900 ml-2">
                              {departmentData.topUnitCount?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className={`flex items-center text-sm font-medium ${departmentData.topUnitUsageGrowth?.startsWith('-')
                            ? 'text-red-600'
                            : 'text-green-600'}`}
                          >
                            {departmentData.topUnitUsageGrowth?.startsWith('-')
                              ? (<ArrowDownRight className="mr-1 h-4 w-4" />)
                              : (<ArrowUpRight className="mr-1 h-4 w-4" />)}
                            {departmentData.topUnitUsageGrowth || '+0%'}
                          </div>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-500">{departmentData.topUnitUsage || 'N/A'}</span>
                            <span className="text-xs text-gray-400">
                              (
                              {departmentData.topUnitPercent || '0%'}
                              )
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )

                : (
                    <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                      <div className="text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No Data</p>
                        <p className="text-gray-400 text-sm">部門數據尚未可用</p>
                      </div>
                    </div>
                  )}

              <Button
                onClick={handleNavigateToAnalysis}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg"
              >
                查看詳細分析
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 趨勢圖表區域 */}
        <div className="grid grid-cols-1 gap-8">
          {/* 月份趨勢圖 */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">總點擊與使用率趨勢</h3>
                <span className="text-sm text-gray-500">Month</span>
              </div>
              {formattedMonthlyData.length > 0
                ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formattedMonthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                        />
                        <Line
                          type="monotone"
                          dataKey="總點擊數"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="總使用數"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )
                : (
                    <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No Data</p>
                        <p className="text-gray-400 text-sm">沒有月份趨勢數據可顯示</p>
                      </div>
                    </div>
                  )}
            </CardContent>
          </Card>

          {/* 日期趨勢圖 */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">總點擊與使用率趨勢</h3>
                <span className="text-sm text-gray-500">Day</span>
              </div>
              {formattedDailyData.length > 0
                ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formattedDailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                        />
                        <Line
                          type="monotone"
                          dataKey="總點擊數"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="總使用數"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )
                : (
                    <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">No Data</p>
                        <p className="text-gray-400 text-sm">沒有日期趨勢數據可顯示</p>
                      </div>
                    </div>
                  )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
