'use client'

import type { ReactNode } from 'react'
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'

import enTranslations from './en.json'
import zhTWTranslations from './zh-TW.json'

export type Locale = 'zh-TW' | 'en'

type TranslationValue = string | { [key: string]: TranslationValue }
type Translations = typeof zhTWTranslations

const translations: Record<Locale, Translations> = {
  'zh-TW': zhTWTranslations,
  'en': enTranslations,
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = 'rd-ai-city-locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined')
    return 'zh-TW'
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
  if (savedLocale && (savedLocale === 'zh-TW' || savedLocale === 'en')) {
    return savedLocale
  }
  return 'zh-TW'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-TW')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 從 localStorage 讀取語言設定
    const initialLocale = getInitialLocale()
    setLocaleState(initialLocale)
    setIsInitialized(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
  }, [])

  const t = useCallback((key: string): string => {
    const keys = key.split('.')
    let value: TranslationValue = translations[locale]

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k as keyof typeof value] as TranslationValue
      }
      else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    if (typeof value === 'string') {
      return value
    }

    console.warn(`Translation key returned non-string value: ${key}`)
    return key
  }, [locale])

  const contextValue = useMemo(() => ({
    locale,
    setLocale,
    t,
  }), [locale, setLocale, t])

  // 避免 hydration 不一致
  if (!isInitialized) {
    return null
  }

  return (
    <I18nContext value={contextValue}>
      {children}
    </I18nContext>
  )
}

export function useI18n() {
  const context = use(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
