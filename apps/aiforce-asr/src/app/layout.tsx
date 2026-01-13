import type { Metadata } from 'next'

import './globals.css'

import { AuthProvider } from '@msi/auth'
import { PostHogProvider } from '@msi/ui'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: '語音轉文字服務 | ASR',
  description: '將語音錄音轉換為文字，快速準確的語音識別服務',
  icons: {
    icon: 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/msi-asr/Logo-stt.png'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='zh-TW' suppressHydrationWarning>
      <body className='min-h-screen antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableColorScheme
          disableTransitionOnChange
        >
          <PostHogProvider>
            <AuthProvider>
              {children}
              <Toaster richColors position='top-center' />
            </AuthProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
