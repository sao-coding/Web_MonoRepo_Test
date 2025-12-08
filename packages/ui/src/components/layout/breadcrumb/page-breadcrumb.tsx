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

export interface BreadcrumbConfig {
  key: string
  title: string
  children: BreadcrumbConfig[]
}

interface BreadcrumbSegment {
  key: string
  title: string
  href: string
  isLast: boolean
}

export const PageBreadcrumb = ({ config }: { config: BreadcrumbConfig }) => {
  const pathname = usePathname()

  /**
   * 構建標題映射表(扁平化結構,提升查找性能)
   */
  function buildTitleMap(config: BreadcrumbConfig): Map<string, string> {
    const map = new Map<string, string>()

    function traverse(node: BreadcrumbConfig) {
      map.set(node.key, node.title)
      node.children?.forEach(traverse)
    }

    traverse(config)
    return map
  }

  /**
   * 生成麵包屑路徑段
   */
  function generateBreadcrumbSegments(
    segments: string[],
    titleMap: Map<string, string>
  ): BreadcrumbSegment[] {
    return segments.map((segment, index) => ({
      key: segment,
      title: titleMap.get(segment) || segment,
      href: segments.slice(0, index + 1).join('/'),
      isLast: index === segments.length - 1
    }))
  }

  // React 19 編譯器會自動優化這些計算
  const segments = pathname.split('/').filter(Boolean)
  const titleMap = buildTitleMap(config)
  const breadcrumbSegments = generateBreadcrumbSegments(segments, titleMap)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* 首頁鏈接 */}
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={'/'}>
            首頁
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbSegments.length > 0 && (
          <BreadcrumbSeparator className="hidden md:block" />
        )}

        {/* 路徑段 */}
        {breadcrumbSegments.map((segment, index) => (
          <React.Fragment key={segment.href}>
            <BreadcrumbItem>
              {segment.isLast ? (
                <BreadcrumbPage>{segment.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={segment.href}>
                  {segment.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!segment.isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
