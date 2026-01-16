'use client'

/**
 * AppCard 組件
 *
 * 應用程式卡片列表容器組件
 * 使用 useApps hook 獲取資料，使用 AppCardItem 渲染單個卡片
 */

import type { AppType } from '@/types/app'
import { useTranslations } from '@msi/i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@msi/ui/components/dialog'
import Image from 'next/image'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { useLanguage } from '@/context/Language'
import { useApps } from '@/hooks/use-apps'

import { AppCardItem } from './AppCardItem'

const DEFAULT_LOGO = 'https://rd_service.msi.com.tw/sdqaFile/AI%20Platform_Test/aiforce-ai-print/logo.png'

interface AppCardProps {
  categoryId: number
}

const AppCard = ({ categoryId }: AppCardProps) => {
  const t = useTranslations('homepage')
  const { searchKeyword } = useLanguage()
  const { apps, filteredApps, isLoading, starStates, toggleStar } = useApps(categoryId)

  const [selectedApp, setSelectedApp] = useState<AppType | null>(null)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="text-lg font-medium text-gray-600">{t('loading')}</div>
      </div>
    )
  }

  // No apps available
  if (apps.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">{t('noAvailable')}</p>
          <p>{t('noAvailableD')}</p>
        </div>
      </div>
    )
  }

  // No matching apps after filter
  if (filteredApps.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">{t('noRelated')}</p>
          <p>
            {t('noRelatedD')}
            {searchKeyword}
            {t('noRelatedDt')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 w-full">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 mx-auto"
        style={{ maxWidth: '1100px' }}
      >
        {filteredApps.map((app: AppType) => {
          const isFavorite = starStates[app.seqNo] !== undefined
            ? starStates[app.seqNo]
            : app.isFavorite

          return (
            <AppCardItem
              key={app.seqNo}
              app={app}
              isFavorite={isFavorite}
              onInfoClick={() => setSelectedApp(app)}
              onToggleStar={() => toggleStar(app.seqNo, app.sourceTable, app.isFavorite)}
            />
          )
        })}

        {/* App Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={open => !open && setSelectedApp(null)}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader className="justify-center">
              <DialogTitle>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Image
                      src={selectedApp?.sysImgUrl || DEFAULT_LOGO}
                      alt={`${selectedApp?.sysName}`}
                      width={64}
                      height={64}
                      className="rounded-full object-contain"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement
                        if (imgElement.src !== DEFAULT_LOGO) {
                          imgElement.src = DEFAULT_LOGO
                        }
                      }}
                      unoptimized
                    />
                  </div>
                  <h2 className="text-2xl font-bold">{selectedApp?.sysName}</h2>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6 grid gap-4 overflow-y-auto">
              {selectedApp?.infos.map(info => (
                <div key={info.name}>
                  <div className="mb-4 flex">
                    <span
                      className="text-white rounded-[30px] px-4 py-2 font-bold text-lg"
                      style={{ background: 'linear-gradient(to right,#000,#868789,#000)' }}
                    >
                      {info.name}
                    </span>
                  </div>
                  <ReactMarkdown
                    className="max-w-none dark:prose-invert grid"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    skipHtml={false}
                    components={{
                      table: ({ node, ...props }) => (
                        <div
                          className="overflow-x-auto my-4 border rounded-lg max-w-full"
                          style={{ maxWidth: '100%' }}
                        >
                          <div className="max-w-5xl overflow-x-auto">
                            <table
                              className="border-collapse table-auto w-full"
                              style={{ minWidth: '600px', tableLayout: 'auto', margin: '0' }}
                              {...props}
                            />
                          </div>
                        </div>
                      ),
                      th: ({ node, ...props }) => (
                        <th
                          className="border bg-gray-100 p-2 text-left font-bold whitespace-nowrap"
                          style={{ minWidth: '80px', verticalAlign: 'middle' }}
                          {...props}
                        />
                      ),
                      td: ({ node, ...props }) => (
                        <td
                          className="border p-2"
                          style={{
                            minWidth: '60px',
                            maxWidth: '200px',
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />
                      ),
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      h1: ({ node, ...props }) => (
                        <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0" {...props} />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0" {...props} />
                      ),
                      strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                      em: ({ node, ...props }) => <em className="italic" {...props} />,
                      code: ({ node, ...props }) => (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-gray-300 pl-4 italic my-2"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {info.value}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AppCard
