'use client'

import React from 'react'
import UserMenu from '../banner/user-menu'

const Banner = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="justify-between pl-4 pr-6 py-2 z-30 w-full flex flex-row items-center drag-region bg-white" style={{ boxShadow: '0 5px 10px white' }}>
      {children}
      <UserMenu />
    </div>
  )
}

export default Banner
