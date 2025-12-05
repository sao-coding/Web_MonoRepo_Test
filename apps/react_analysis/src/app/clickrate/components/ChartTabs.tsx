'use client'

interface ChartTabsProps {
  activeTab: 'bar' | 'pie'
  onTabChange: (tab: 'bar' | 'pie') => void
}

export default function ChartTabs({ activeTab, onTabChange }: ChartTabsProps) {
  return (
    <div className="flex justify-end mb-4 space-x-2">
      <button
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          activeTab === 'bar'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
        }`}
        onClick={() => onTabChange('bar')}
      >
        長條圖
      </button>
      <button
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          activeTab === 'pie'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
        }`}
        onClick={() => onTabChange('pie')}
      >
        圓餅圖
      </button>
    </div>
  )
}
