'use client'

import type { AbstractIntlMessages } from 'next-intl'
import { NextIntlClientProvider } from 'next-intl'
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
} from 'react'

import type { Locale } from './config'
import { LOCALE_COOKIE_NAME } from './config'

/**
 * I18n Context 類型定義
 */
interface I18nContextType {
  /** 當前語系 */
  locale: Locale
  /** 切換語系（即時切換，不重整頁面） */
  setLocale: (locale: Locale) => void
  /** 是否正在切換中 */
  isPending: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

/**
 * 所有語系的翻譯訊息類型
 */
type AllMessages = Record<Locale, AbstractIntlMessages>

/**
 * I18nProvider Props
 */
interface I18nProviderProps {
  children: React.ReactNode
  /** 初始語系（從 Server 端傳入） */
  initialLocale: Locale
  /** 所有語系的翻譯訊息（預先載入，支援即時切換） */
  allMessages: AllMessages
}

/**
 * I18n Provider
 * 提供即時語系切換功能，無需頁面重整
 * 所有語系的翻譯預先載入，切換時直接使用
 */
export function I18nProvider({
  children,
  initialLocale,
  allMessages,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [isPending, startTransition] = useTransition()

  const setLocale = useCallback((newLocale: Locale) => {
    if (newLocale === locale || isPending) {
      return
    }

    startTransition(() => {
      setLocaleState(newLocale)

      // 同步更新 cookie（客戶端方式，下次 Server 請求會讀取）
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale};path=/;max-age=31536000;samesite=lax`
    })
  }, [locale, isPending])

  const messages = allMessages[locale]

  return (
    <I18nContext.Provider value={{ locale, setLocale, isPending }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  )
}

/**
 * 取得 I18n Context
 * 提供 locale、setLocale、isPending
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Re-export next-intl hooks for convenience
export { useLocale, useMessages, useTranslations } from 'next-intl'

