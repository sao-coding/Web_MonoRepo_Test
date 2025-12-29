'use client'

import { usePathname } from 'next/navigation'
import * as React from 'react'

import { titleConfig } from '@/config/title'

const Banner = ({
  children,
  title
}: {
  children?: React.ReactNode
  title?: string
}) => {
  const pathname = usePathname()
  const titleDefalt = titleConfig.find((item) => pathname.startsWith(item.pathname))?.title
  const titleImageUrl = titleConfig.find((item) => pathname.startsWith(item.pathname))?.logoUrl
  return (
    <div className='flex items-center justify-center'>
      <div className='max-w-md text-center'>
        <div className='mx-auto mb-2 flex w-fit max-w-xl flex-row items-center justify-center gap-3 @sm:gap-3.5'>
          <img
            src={titleImageUrl}
            alt={title || titleDefalt || 'Logo'}
            className='size-10 rounded-full border-[1px] border-gray-100 @sm:size-10 dark:border-none'
          />
          <div className='line-clamp-1 flex items-center text-3xl font-bold @sm:text-3xl'>
            {title || titleDefalt}
          </div>
        </div>
        <div className='markdown mt-1.5 mb-2 line-clamp-2 max-w-xl px-2 text-sm font-normal text-gray-500 dark:text-gray-400'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Banner
