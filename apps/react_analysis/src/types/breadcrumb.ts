import type { ReactNode } from 'react'

export interface BreadcrumbItem {
  href: string
  label: string | ReactNode
}

export interface BreadcrumbProps {
  homeElement?: ReactNode
  separator?: ReactNode
  containerClasses?: string
  listClasses?: string
  activeItemClasses?: string
  inactiveItemClasses?: string
  customItems?: BreadcrumbItem[]
}
