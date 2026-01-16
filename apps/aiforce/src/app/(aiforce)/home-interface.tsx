'use client'

/**
 * HomeInterface (Client Component)
 *
 * 封裝首頁的互動邏輯
 * 包含分類切換狀態和應用程式卡片
 */

import { useState } from 'react'

import AppCard from './AppCard'
import AppNavbar from './AppNavbar'

export function HomeInterface() {
  const [activeCategory, setActiveCategory] = useState<number>(0)

  return (
    <div className="container mx-auto px-4 mb-6">
      <AppNavbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Main content area */}
      <div className="flex-1 mt-4">
        <div className="flex flex-row">
          {/* 右側卡片區塊 */}
          <div className="grow ml-6">
            <AppCard categoryId={activeCategory} />
          </div>
        </div>
      </div>
    </div>
  )
}
