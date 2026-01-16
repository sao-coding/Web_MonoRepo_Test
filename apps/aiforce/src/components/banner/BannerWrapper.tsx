/**
 * Banner Wrapper - 首頁 Header
 * 使用模組化的 hooks 和 components
 */
'use client'

import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import { useTranslations } from '@msi/i18n'
import { Banner } from '@msi/ui/components/banner'
import { Button } from '@msi/ui/components/button'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { BannerActions } from '@/components/homepage'
import { titleConfig } from '@/config/title'
import { redirectToForum } from '@/lib/forum-redirect'

export default function BannerWrapper() {
  const t = useTranslations('homepage')
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // 處理 AI 論壇跳轉 - 使用 Form POST 方式傳遞認證資訊
  const handleForumClick = () => {
    const success = redirectToForum()
    if (!success) {
      // 認證資訊不足，提示用戶
      toast.error('請先登入後再前往 AI 論壇')
    }
  }

  // 取得頁面設定
  const config = titleConfig.find(item => pathname.startsWith(item.pathname))
  const title = config?.title
  const basePath = getAppConfig().NEXT_PUBLIC_BASE_PATH_URL

  // 雙 logo 路徑
  const msiLogoUrl = `${basePath}/images/msi-black.png`
  const aiforceLogoUrl = `${basePath}/images/aiforce-logo.png`

  // 登出處理
  const handleLogout = () => {
    const success = logout()
    if (success) {
      toast.success('已登出')
      const { protocol, hostname, port } = window.location
      const portSuffix = port ? `:${port}` : ''
      window.location.href = `${protocol}//${hostname}${portSuffix}/aiforce/login`
    }
    else {
      toast.error('登出失敗')
    }
  }

  if (!config?.banner) {
    return null
  }

  return (
    <Banner
      userName={user?.name}
      userId={user?.userId}
      title={title}
      msiLogoUrl={msiLogoUrl}
      aiforceLogoUrl={aiforceLogoUrl}
      titleClassName="hidden"
      homeUrl={getAppConfig().NEXT_PUBLIC_RD_SITE_URL || '/'}
      centerContent={pathname === '/' && (
        <div className="flex items-center gap-8">
          <span className="inline-block py-2 px-1 border-b-3 border-primary font-bold text-md text-foreground">
            {t('AIagent')}
          </span>
          <Button
            variant="ghost"
            className="font-bold py-2 px-1 text-muted-foreground hover:text-foreground text-md hover:bg-transparent"
            onClick={handleForumClick}
          >
            {t('AIforum')}
          </Button>
        </div>
      )}
      rightContent={pathname === '/' && <BannerActions />}
      onLogout={handleLogout}
    />
  )
}
