import type { Metadata } from 'next'

import Image from 'next/image'
import Link from 'next/link'

import { ImageUploadForm } from '@/components/image-upload-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'

/**
 * Img2Text 頁面 SEO Metadata (SSG)
 */
export const metadata: Metadata = {
  title: '圖意探險家 - AI 圖片轉文字',
  description: '使用 AI 識別圖片內容並生成文字描述。支持 JPG 和 PNG 格式。',
  keywords: ['Image-to-Text', '圖片辨識', 'AI', '圖意探險家', '圖片描述'],
  openGraph: {
    title: '圖意探險家 - AI 圖片轉文字',
    description: '使用 AI 識別圖片內容並生成文字描述。支持 JPG 和 PNG 格式。',
    type: 'website'
  }
}

/**
 * Img2Text 首頁 (Server Component with Client Islands)
 *
 * Header 使用靜態渲染 (SSG)
 * UserAvatar 和 ImageUploadForm 為 Client Components (Hydration)
 */
export default function Img2TextPage() {
  return (
    <div className='bg-background min-h-screen'>
      {/* Header (SSG) */}
      <header className='flex items-center justify-between border-b px-6 py-3'>
        <Link
          href={process.env.NEXT_PUBLIC_RD_SITE_URL ?? '/'}
          className='flex items-center gap-2'
        >
          <Image
            src='https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-City.png'
            alt='圖意探險家'
            width={32}
            height={32}
            className='rounded-full border border-gray-300'
            unoptimized
          />
          <span className='text-lg font-semibold'>圖意探險家</span>
        </Link>
        {/* Client Component for user auth */}
        <UserAvatar />
      </header>

      {/* Main Content */}
      <main className='p-6'>
        <div className='mx-auto max-w-4xl'>
          {/* Client Component for interactive upload */}
          <ImageUploadForm />
        </div>
      </main>
      {/* Theme Toggle - Bottom Left */}
      <ThemeToggle />
    </div>
  )
}
