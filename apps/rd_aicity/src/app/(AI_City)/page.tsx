'use client'

import { useState } from 'react'
import AppCard from './AppCard'
import AppNavbar from './AppNavbar'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<number>(0)

  return (
    <div className="container mx-auto px-4 mb-6">
      <AppNavbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Main content area - 使用固定布局 */}
      <div className="flex-1 mt-4">
        <div className="flex flex-row">
          {/* 右側卡片區塊 - 增加寬度 */}
          <div className="grow ml-6">
            <AppCard categoryId={activeCategory} />
          </div>
        </div>
      </div>
    </div>
  )
}
