'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@msi/ui/components/avatar'

interface DefaltInfoProps {
  title: string
  children: React.ReactNode
  avatarUrl?: string
}

export function DefaltInfo({
  title,
  children,
  avatarUrl = 'https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png'
}: DefaltInfoProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <Avatar className='size-16'>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>
        {title}
      </h1>
      <p className='max-w-md text-center text-gray-600 dark:text-gray-400'>
        {children}
      </p>
    </div>
  )
}

export default DefaltInfo
