'use client'

import { Button } from '@msi/ui/components/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 避免 hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant='outline'
        size='icon'
        className='fixed bottom-4 left-4 z-50 size-10 rounded-full shadow-lg'
      >
        <Sun className='size-5' />
      </Button>
    )
  }

  return (
    <Button
      variant='outline'
      size='icon'
      className='fixed bottom-4 left-4 z-50 size-10 rounded-full shadow-lg'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
    >
      {theme === 'dark' ? <Sun className='size-5' /> : <Moon className='size-5' />}
    </Button>
  )
}
