'use client'

import { usePathname } from 'next/navigation'
import * as React from 'react'

import { titleConfig } from '@/config/title'

const Banner = ({ children, title }: { children?: React.ReactNode; title?: string }) => {
  const pathname = usePathname()
  const titleDefalt = titleConfig.find((item) => pathname.startsWith(item.pathname))?.title
  const titleImageUrl = titleConfig.find((item) => pathname.startsWith(item.pathname))?.logoUrl
  return (
    <div className='flex items-center justify-center'>
      <div className='max-w-md text-center'>
        <div className='@sm:gap-3.5 mx-auto mb-2 flex w-fit max-w-xl flex-row items-center justify-center gap-3'>
          <img
            src={titleImageUrl}
            alt={title || titleDefalt || 'Logo'}
            className='@sm:size-10 size-10 rounded-full border-[1px] border-gray-100 dark:border-none'
          />
          <div className='@sm:text-3xl line-clamp-1 flex items-center text-3xl font-bold'>
            {title || titleDefalt}
          </div>
        </div>
        <div className='markdown mb-2 mt-1.5 line-clamp-2 max-w-xl px-2 text-sm font-normal text-gray-500 dark:text-gray-400'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Banner
