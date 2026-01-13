'use client'

import React, { createContext, use, useState } from 'react'

interface LanguageType {
  langCode: string
  setLangCode: (code: string) => void
  searchKeyword: string
  setSearchKeyword: (v: string) => void
}

const Language = createContext<LanguageType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [langCode, setLangCode] = useState('zh') // 預設語言
  const [searchKeyword, setSearchKeyword] = useState('') // 搜尋功能
  return (
    <Language value={{ langCode, setLangCode, searchKeyword, setSearchKeyword }}>
      {children}
    </Language>
  )
}

export const useLanguage = () => {
  const context = use(Language)
  if (!context)
    throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
