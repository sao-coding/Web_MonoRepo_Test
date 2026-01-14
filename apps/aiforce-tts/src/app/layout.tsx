import type { Metadata } from 'next'

import './globals.css'

import { AuthProvider } from '@msi/auth'
import { SidebarProvider } from '@msi/ui/components/sidebar'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: '說書人 TTS | RD AI City',
  description: '將文字轉換為自然流暢的語音，支援多種語言和聲音風格',
  icons: {
    icon: 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/TTS/logo-tts.png'
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
          <AuthProvider>
            <SidebarProvider>
              {children}
              <Toaster richColors position='top-center' />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
