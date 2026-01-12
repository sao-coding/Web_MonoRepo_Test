/**
 * 深色模式切換按鈕
 */
'use client'

import { Button } from '@msi/ui/components/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full"
      aria-label="切換深色模式"
    >
      {theme === 'dark'
        ? (
            <Sun className="h-5 w-5" />
          )
        : (
            <Moon className="h-5 w-5" />
          )}
    </Button>
  )
}
