import type { Locale } from '@msi/i18n'
import type { Metadata } from 'next'
import { I18nProvider } from '@msi/i18n'
import { PostHogProvider } from '@msi/ui'
import { getLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'
import BannerWrapper from '@/components/banner/BannerWrapper'
import { LanguageProvider } from '@/context/Language'

// 預先載入所有語系的翻譯
import enMessages from '../../messages/en.json'
import zhCNMessages from '../../messages/zh-CN.json'
import zhTWMessages from '../../messages/zh-TW.json'

import Providers from './providers'
import './globals.css'

const allMessages = {
  'en': enMessages,
  'zh-CN': zhCNMessages,
  'zh-TW': zhTWMessages,
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MSI AIforce',
  description: 'aiforce系統',
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale() as Locale

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased grid grid-rows-[auto_1fr] min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="leight"
          // enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <LanguageProvider>
            <PostHogProvider>
              <NuqsAdapter>
                <I18nProvider
                  initialLocale={locale}
                  allMessages={allMessages}
                >
                  <Providers>
                    <BannerWrapper />
                    {children}
                    <Toaster richColors />
                  </Providers>
                </I18nProvider>
              </NuqsAdapter>
            </PostHogProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
