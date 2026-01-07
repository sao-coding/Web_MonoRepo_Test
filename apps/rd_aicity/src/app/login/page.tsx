'use client'

import { getAppConfig } from '@msi/config/env'
import { useTranslations } from '@msi/i18n'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import { LanguageSwitcher, LoginForm } from './_components'

/**
 * 登入頁面
 * 全螢幕背景圖 + 玻璃擬態登入卡片
 */
const LoginPage = () => {
  const config = useMemo(() => getAppConfig(), [])
  const t = useTranslations('login')
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
        className="w-[800px] max-w-full h-[623px] mx-4 px-10 py-8 rounded-4xl relative border border-border/50 backdrop-blur-xl overflow-hidden bg-card/60 dark:bg-card/80"
        style={{
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.3) inset,
            0 0 80px 0px rgba(255, 255, 255, 0.4),
            0 0 120px 30px rgba(255, 255, 255, 0.15),
            0 25px 60px -15px rgba(0, 0, 0, 0.2)
          `,
        }}
      >
        {/* Light mode background - 中間白色往外漸層透明 */}
        <div
          className="absolute inset-0 -z-10 dark:hidden"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0.3) 100%)' }}
        />
        {/* Logo 區塊 - 放大圖片並增加間距 */}
        <div className="flex flex-col items-center mb-10 mt-4">
          <Image
            src={`${config.NEXT_PUBLIC_BASE_PATH_URL}/images/msi-aiforce-new.png`}
            alt="MSI AIforce"
            width={340}
            height={40}
            className="object-contain dark:invert"
            priority
          />
          {/* 標題 - 18px，淺色深黑/深色純白 */}
          <p
            className="text-gray-900 dark:text-white font-semibold mt-5"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", "Meiryo UI", Helvetica, Arial, sans-serif',
              letterSpacing: '10px',
              fontSize: '18px',
            }}
          >
            {t('title')}
          </p>
        </div>

        {/* 登入表單 */}
        <LoginForm config={config} />
      </div>
    </div>
  )
}

export default LoginPage
