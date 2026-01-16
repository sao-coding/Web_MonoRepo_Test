/**
 * 語系切換 Hook
 * 封裝語系 API 呼叫與狀態管理
 */
'use client'

import type { Locale } from '@msi/i18n'
import { getAppConfig } from '@msi/config/env'
import { useI18n } from '@msi/i18n'
import { useCallback, useEffect, useState } from 'react'

export interface LanguageItem {
  seqNo: number
  langCode: string
  langName: string
  isDefault: boolean
  isShow: boolean
}

interface UseLanguageSwitcherReturn {
  languages: LanguageItem[]
  selectedLanguage: string
  isLoading: boolean
  switchLanguage: (langCode: string, langName: string) => void
}

export function useLanguageSwitcher(): UseLanguageSwitcherReturn {
  const { setLocale } = useI18n()
  const [languages, setLanguages] = useState<LanguageItem[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string>('繁體中文')
  const [isLoading, setIsLoading] = useState(true)

  // 獲取語系列表
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const apiUrl = getAppConfig().NEXT_PUBLIC_AIforce_API_URL
        if (!apiUrl) {
          console.warn('AIforce API URL 未設定')
          setIsLoading(false)
          return
        }

        const res = await fetch(`${apiUrl}/api/AIForce/Languages`, {
          method: 'GET',
        })

        if (res.ok) {
          const data: LanguageItem[] = await res.json()
          setLanguages(data)

          // 設定預設語系
          const defaultLang = data.find(item => item.isDefault)
          if (defaultLang) {
            setSelectedLanguage(defaultLang.langName)
          }
        }
        else {
          console.error(`Failed to fetch Languages: ${res.status}`)
        }
      }
      catch (err) {
        console.error('語系列表獲取失敗:', err)
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  // 切換語系
  const switchLanguage = useCallback((langCode: string, langName: string) => {
    // 轉換語系代碼格式 (API 回傳 'zh'，需轉換為 'zh-TW')
    let targetLocale = langCode
    if (targetLocale === 'zh') {
      targetLocale = 'zh-TW'
    }

    setLocale(targetLocale as Locale)
    setSelectedLanguage(langName)
  }, [setLocale])

  return {
    languages,
    selectedLanguage,
    isLoading,
    switchLanguage,
  }
}
