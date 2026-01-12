'use client'

import { mdiMoonWaxingCrescent, mdiWeatherSunny } from '@mdi/js'
import Icon from '@mdi/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * 主題切換組件
 * 切換深色/淺色模式
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted)
    return null

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-full text-gray-600 dark:text-white/70 hover:text-gray-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 transition-all"
      title={isDark ? '切換至淺色模式' : '切換至深色模式'}
    >
      <Icon
        path={isDark ? mdiWeatherSunny : mdiMoonWaxingCrescent}
        size={0.9}
      />
    </button>
  )
}
