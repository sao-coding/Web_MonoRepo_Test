/**
 * Banner 右側操作區
 * 整合深色模式、語系切換、搜尋功能
 */
'use client'

import { LanguageDropdown } from './language-dropdown'
import { SearchInput } from './search-input'
import { ThemeToggle } from './theme-toggle'

export function BannerActions() {
  return (
    <>
      <ThemeToggle />
      <LanguageDropdown />
      <SearchInput />
    </>
  )
}
