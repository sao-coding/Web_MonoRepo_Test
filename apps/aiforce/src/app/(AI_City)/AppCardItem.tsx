'use client'

/**
 * AppCardItem 組件
 *
 * 單個應用程式卡片的渲染組件
 */

import type { AppType } from '@/types/app'
import { useTranslations } from '@msi/i18n'
import { Button } from '@msi/ui/components/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@msi/ui/components/tooltip'
import { Info, Star } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { useAppNavigation } from '@/hooks/use-app-navigation'

const DEFAULT_LOGO = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/aiforce-ai-print/logo.png'

interface AppCardItemProps {
  app: AppType
  isFavorite: boolean
  onInfoClick: () => void
  onToggleStar: () => void
}

export function AppCardItem({
  app,
  isFavorite,
  onInfoClick,
  onToggleStar,
}: AppCardItemProps) {
  const t = useTranslations('homepage')
  const { navigateToApp } = useAppNavigation()

  return (
    <div
      className="flex flex-col cursor-pointer items-center overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-black/30 dark:hover:shadow-white/20 relative bg-card border border-border"
      onClick={onInfoClick}
    >
      {/* 頂部背景區域 */}
      <div className="w-full h-20 bg-muted flex items-center justify-center relative">
        {/* Info 按鈕 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onInfoClick()
                }}
                aria-label={t('info')}
                variant="ghost"
                size="lg"
                className="absolute top-2 left-2 has-[>svg]:px-2 h-8 rounded-4xl p-0 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Info
                  className='has-[>svg]:w-6 has-[>svg]:h-6 [&_svg:not([class*="size-"])]:size-4'
                  size={20}
                  stroke="gray"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('info')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 收藏按鈕 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar()
                }}
                aria-label={t('addFavorite')}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 rounded-4xl p-0 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Star
                  className="w-8 h-8"
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('addFavorite')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Logo */}
      <div className="absolute z-10" style={{ top: '20px' }}>
        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-sm border border-border">
          <Image
            src={app.sysImgUrl || DEFAULT_LOGO}
            alt={app.sysName}
            width={64}
            height={64}
            className="rounded-full object-contain"
            unoptimized
          />
        </div>
      </div>

      {/* 卡片內容 */}
      <div className="w-full bg-card h-full pt-8 pb-4 px-4 flex flex-col items-center">
        <h3 className="text-center font-bold text-lg text-foreground mt-6 flex-1">
          {app.sysName}
        </h3>
        <div className="w-full">
          <Button
            className="w-full my-1 rounded-4xl"
            onClick={(e) => {
              e.stopPropagation()
              navigateToApp(app.sysUrl || null, app.sysName)
            }}
          >
            {t('sysLink')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AppCardItem
