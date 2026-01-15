import Image from 'next/image'
import Link from 'next/link'

import { ImageUploadForm } from '../components/image-upload-form'
import { UserAvatar } from '../components/user-avatar'

export default function Img2TextPage() {
  return (
    <div className='bg-background min-h-screen'>
      {/* Header */}
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
        <UserAvatar />
      </header>

      {/* Main Content */}
      <main className='p-6'>
        <div className='mx-auto max-w-4xl'>
          <ImageUploadForm />
        </div>
      </main>
    </div>
  )
}
