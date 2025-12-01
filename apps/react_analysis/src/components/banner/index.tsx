'use client'

import React from 'react'
import { IconMsi } from '../icons/msi'
import UserMenu from './user-menu'

const Banner = () => {
  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-300 px-4 md:px-6">
      <div className="flex items-center gap-2 overflow-hidden">
        <IconMsi className="h-5 w-auto md:h-auto" />
        <span
          className="truncate text-2xl font-bold text-black md:text-3xl"
          style={{
            fontFamily: '微軟正黑體',
          }}
        >
          數據圖形化系統
        </span>
      </div>
      <UserMenu />
    </div>
  )
}

export default Banner
