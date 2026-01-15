'use client'

import { Button } from '@msi/ui/components/button'
import { Download, Mail, Star } from 'lucide-react'
import * as React from 'react'

export const ResultToolbar = () => {
  return (
    <div className='fixed inset-x-0 bottom-8 z-30 flex justify-center'>
      <div className='relative flex items-center gap-6 rounded-full border border-gray-200 bg-blue-100 px-6 py-2 shadow-lg'>
          <Button
            className='gap-2 rounded-4xl bg-gray-600 whitespace-nowrap hover:bg-gray-700'
          >
            <Download />
            匯出逐字稿
          </Button>
          <Button
            className='gap-2 rounded-4xl bg-gray-600 whitespace-nowrap hover:bg-gray-700'
          >
            <Star />
            會議總結
          </Button>
          <Button
            className='gap-2 rounded-4xl bg-gray-600 whitespace-nowrap hover:bg-gray-700'
          >
            <Mail />
            透過信件寄出
          </Button>
      </div>
    </div>
  )
}
