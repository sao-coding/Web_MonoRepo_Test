/**
 * 搜尋輸入框
 */
'use client'

import { useTranslations } from '@msi/i18n'
import { Input } from '@msi/ui/components/input'
import { Search } from 'lucide-react'
import { useLanguage } from '@/context/Language'

export function SearchInput() {
  const t = useTranslations('homepage')
  const { searchKeyword, setSearchKeyword } = useLanguage()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  return (
    <div className="relative max-w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={t('search')}
        value={searchKeyword}
        onChange={handleSearchChange}
        className="pl-9 pr-4 h-9 rounded-4xl border-border focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}
