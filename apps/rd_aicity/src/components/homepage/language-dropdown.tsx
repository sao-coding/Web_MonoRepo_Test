/**
 * 語系選擇下拉選單
 */
'use client'

import { Button } from '@msi/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@msi/ui/components/dropdown-menu'
import { useLanguage } from '@/context/Language'
import { useLanguageSwitcher } from '@/hooks/use-language-switcher'

export function LanguageDropdown() {
  const { languages, selectedLanguage, switchLanguage } = useLanguageSwitcher()
  const { setLangCode } = useLanguage()

  const handleLanguageSelect = (langCode: string, langName: string) => {
    switchLanguage(langCode, langName)
    setLangCode(langCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {selectedLanguage}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        {languages.map(item => (
          <DropdownMenuItem
            key={item.seqNo}
            onSelect={() => handleLanguageSelect(item.langCode, item.langName)}
          >
            {item.langName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
