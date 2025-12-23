'use client'

import { getAppConfig } from '@msi/config/env'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher, LoginForm } from './_components'

/**
 * 登入頁面
 * 全螢幕背景圖 + 玻璃擬態登入卡片
 */
const LoginPage = () => {
  const config = useMemo(() => getAppConfig(), [])
  const { t } = useI18n()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient)
    return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${config.NEXT_PUBLIC_BASE_PATH_URL}/images/AIforce_v10_full.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 語系切換 */}
      <LanguageSwitcher />

      {/* 登入卡片 - 玻璃擬態、支援深色模式 */}
      <div
        className="w-full max-w-[720px] mx-4 px-16 py-12 rounded-[2.5rem] relative border border-border/50 backdrop-blur-xl overflow-hidden bg-card/60 dark:bg-card/80"
        style={{
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.3) inset,
            0 0 80px 0px rgba(255, 255, 255, 0.4),
            0 0 120px 30px rgba(255, 255, 255, 0.15),
            0 25px 60px -15px rgba(0, 0, 0, 0.2)
          `,
        }}
      >
        {/* Light mode background - 更透明 */}
        <div
          className="absolute inset-0 -z-10 dark:hidden"
          style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.55) 100%)' }}
        />
        {/* Logo 區塊 */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src={`${config.NEXT_PUBLIC_BASE_PATH_URL}/images/msi-aiforce.png`}
            alt="MSI AIforce"
            width={320}
            height={70}
            className="object-contain dark:invert"
            priority
          />
          {/* 標題 - 放大加粗 */}
          <p className="text-muted-foreground text-base font-semibold tracking-[0.2em] mt-4">
            {t('login.title')}
          </p>
        </div>

        {/* 登入表單 */}
        <LoginForm config={config} />
      </div>
    </div>
  )
}

export default LoginPage
