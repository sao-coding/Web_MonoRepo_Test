import type { Metadata } from 'next'

import './globals.css'

import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: '語音合成 TTS - RD AI City',
  description: '將文字轉換為自然流暢的語音',
  icons: {
    icon: 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-City.png'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-TW'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
