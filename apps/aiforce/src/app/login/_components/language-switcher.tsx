'use client'

import type { Locale } from '@msi/i18n'
import { mdiKeyboardCaps } from '@mdi/js'
import Icon from '@mdi/react'
import { useI18n, useTranslations } from '@msi/i18n'

import { ThemeToggle } from './theme-toggle'

/**
 * 語系切換組件
 * 採用與登入卡片相同的玻璃擬態風格
 * 支援即時切換，無需頁面重整
 */
export function LanguageSwitcher() {
  const { locale, setLocale, isPending } = useI18n()
  const t = useTranslations('language')

  const handleLocaleChange = (newLocale: Locale) => {
    if (isPending)
      return
    setLocale(newLocale)
  }

  return (
    <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
      {/* 主題切換 */}
      <ThemeToggle />

      {/* 語系切換 - 參考中間區塊風格，含發光效果 */}
      <div
        className="rounded-2xl px-2 py-1.5 flex items-center gap-1 backdrop-blur-xl overflow-hidden relative border border-border/50"
        style={{
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.3) inset,
            0 0 30px 0px rgba(255, 255, 255, 0.3),
            0 0 50px 10px rgba(255, 255, 255, 0.1),
            0 8px 20px -5px rgba(0, 0, 0, 0.15)
          `,
        }}
      >
        {/* 淺色模式背景 - 更明亮 */}
        <div
          className="absolute inset-0 -z-10 dark:hidden"
          style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)' }}
        />
        {/* 深色模式背景 */}
        <div
          className="absolute inset-0 -z-10 hidden dark:block"
          style={{ background: 'rgba(30, 30, 35, 0.85)' }}
        />

        <button
          type="button"
          onClick={() => handleLocaleChange('zh-TW')}
          disabled={isPending}
          className={`px-3 py-1 text-sm rounded-lg transition-all ${
            locale === 'zh-TW'
              ? 'text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('zhTW')}
        </button>

        {/* 分隔線 */}
        <span className="text-gray-300 dark:text-white/50 select-none">|</span>

        <button
          type="button"
          onClick={() => handleLocaleChange('zh-CN')}
          disabled={isPending}
          className={`px-3 py-1 text-sm rounded-lg transition-all ${
            locale === 'zh-CN'
              ? 'text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('zhCN')}
        </button>

        {/* 分隔線 */}
        <span className="text-gray-300 dark:text-white/50 select-none">|</span>

        <button
          type="button"
          onClick={() => handleLocaleChange('en')}
          disabled={isPending}
          className={`px-3 py-1 text-sm rounded-lg transition-all ${
            locale === 'en'
              ? 'text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('en')}
        </button>
      </div>
    </div>
  )
}

// Caps Lock 圖標組件 - 顏色與其他 icon 一致
export function CapsLockIndicator({ show }: { show: boolean }) {
  const t = useTranslations('login')

  if (!show)
    return null

  return (
    <div
      className="flex items-center text-muted-foreground"
      title={t('capsLockOn')}
    >
      <Icon path={mdiKeyboardCaps} size={0.8} />
    </div>
  )
}
