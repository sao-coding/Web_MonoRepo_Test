'use client'

import type { BreadcrumbProps } from '@/types/breadcrumb'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

const defaultSeparator = <ChevronRight className='mx-2 size-4' />

/**
 * 麵包屑導航組件
 * 可以根據當前路徑自動生成麵包屑導航或使用自定義路徑結構
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  homeElement = <Home className='size-4' />,
  separator = defaultSeparator,
  containerClasses = 'py-3 flex',
  listClasses = 'flex items-center space-x-1 text-sm text-gray-500',
  activeItemClasses = 'font-medium text-gray-900',
  inactiveItemClasses = 'text-gray-500 hover:text-gray-700 hover:underline transition-colors',
  customItems
}) => {
  const paths = usePathname()
  const pathNames = paths.split('/').filter((path) => path)

  // 定義路徑名稱的映射
  const pathMap: Record<string, string> = {
    '': '首頁',
    'comparison': '比較',
    'admin': '後台',
    'dashboard': '儀表板',
    'users': '用戶管理',
    'products': '產品管理',
    'orders': '訂單管理',
    'settings': '系統設置',
    'delivery': '對應結果管理',
    'categories': '分類管理'
  }

  // 檢查是否在後台頁面
  const isAdminPage = pathNames.length > 0 && pathNames[0] === 'admin'

  // 使用自定義路徑結構
  if (customItems && customItems.length > 0) {
    return (
      <nav aria-label='麵包屑' className={containerClasses}>
        <ol className={`${listClasses} flex-wrap`}>
          {customItems.map((item, index) => (
            <li key={index} className='flex items-center'>
              {index === customItems.length - 1
                ? (
                    <span className={activeItemClasses}>{item.label}</span>
                  )
                : (
                    <>
                      <Link href={item.href} className={inactiveItemClasses}>
                        {item.label}
                      </Link>
                      {separator}
                    </>
                  )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }

  // 自動生成路徑結構
  return (
    <nav aria-label='麵包屑' className={containerClasses}>
      <ol className={listClasses}>
        {/* 如果是後台頁面，顯示特殊結構：研發 > 首頁 > 後台 */}
        {isAdminPage
          ? (
              <>
                <li className='flex items-center'>
                  <span className={inactiveItemClasses}>研發</span>
                  {separator}
                </li>
                <li className='flex items-center'>
                  <Link href='/' className={inactiveItemClasses}>首頁</Link>
                  {separator}
                </li>
              </>
            )
          : (
              <li className='flex items-center'>
                <Link href='/' className={inactiveItemClasses}>
                  {homeElement}
                </Link>
                {pathNames.length > 0 && separator}
              </li>
            )}

        {pathNames.map((name, index) => {
          // 處理比較頁面的特殊情況 comparison/[id]
          if (name === 'comparison' && pathNames[index + 1]?.includes('-vs-')) {
            return (
              <li key={name} className='flex items-center'>
                <span
                  className={
                    index === pathNames.length - 1 ? activeItemClasses : inactiveItemClasses
                  }
                >
                  {pathMap[name] || name}
                </span>
                {index < pathNames.length - 1 && separator}
              </li>
            )
          }

          // 如果是比較頁面的 ID 參數，顯示為"產品比較"
          if (name.includes('-vs-') && pathNames[index - 1] === 'comparison') {
            return (
              <li key={name} className='flex items-center'>
                <span className={activeItemClasses}>產品比較</span>
              </li>
            )
          }

          // 後台頁面特殊處理
          if (isAdminPage) {
            const href = `/${pathNames.slice(0, index + 1).join('/')}`
            const itemName = pathMap[name] || name

            return (
              <li key={name} className='flex items-center'>
                {index === pathNames.length - 1
                  ? (
                      <span className={activeItemClasses}>{itemName}</span>
                    )
                  : (
                      <Link href={href} className={inactiveItemClasses}>
                        {itemName}
                      </Link>
                    )}
                {index < pathNames.length - 1 && separator}
              </li>
            )
          }

          // 一般路徑
          const href = `/${pathNames.slice(0, index + 1).join('/')}`
          const itemName = pathMap[name] || name

          return (
            <li key={name} className='flex items-center'>
              {index === pathNames.length - 1
                ? (
                    <span className={activeItemClasses}>{itemName}</span>
                  )
                : (
                    <Link href={href} className={inactiveItemClasses}>
                      {itemName}
                    </Link>
                  )}
              {index < pathNames.length - 1 && separator}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
