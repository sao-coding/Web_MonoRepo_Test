'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@msi/ui/components/breadcrumb'
import { usePathname } from 'next/navigation'
import React from 'react'

interface PageBreadcrumbProps {
  labels: Record<string, string>;
}

export function PageBreadcrumb({ labels }: PageBreadcrumbProps) {
  const pathname = usePathname()
  // 移除 basePath (如 /pcb) 并分割路径
  const pathWithoutBase = pathname.replace(/^\/pcb/, '') || '/'
  const segments = pathWithoutBase.split('/').filter(Boolean)

  // 如果没有 segments，不显示面包屑
  if (segments.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* 首页链接 */}
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={process.env.NEXT_PUBLIC_BASE_PATH_URL || '/'}>
            首頁
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />

        {/* 路径段 */}
        {segments.map((segment, index) => {
          // 构建正确的 href，包含 basePath
          const href = '/pcb/' + segments.slice(0, index + 1).join('/')
          const isLast = index === segments.length - 1
          const label = labels[segment] || segment

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
