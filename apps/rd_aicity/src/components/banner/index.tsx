'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import React from 'react'

import { titleConfig } from '@/config/title'
import { IconMsi } from '../icons/msi'
import UserMenu from './user-menu'

const Banner = () => {
  const pathname = usePathname()
  return (
    <>
      {titleConfig.find(item => pathname.startsWith(item.pathname))?.banner
        && (
          <div className="flex h-16 items-center justify-between border-b border-gray-300 px-4 md:px-6">
            <Link href={process.env.NEXT_PUBLIC_RD_SITE_URL ?? '/'} className="flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
              <IconMsi className="h-5 w-auto md:h-auto" />
              <span
                className="truncate text-2xl font-bold text-black md:text-3xl"
                style={{
                  fontFamily: '微軟正黑體',
                }}
              >
                {titleConfig.find(
                  item => pathname.startsWith(item.pathname),
                )?.title}
              </span>
            </Link>
            <UserMenu />
          </div>
        )}
    </>
  )
}

export default Banner
