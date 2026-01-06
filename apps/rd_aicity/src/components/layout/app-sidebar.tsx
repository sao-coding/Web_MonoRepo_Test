'use client'

import type { LucideIcon } from 'lucide-react'
import { IconMsi } from '@msi/ui/components/icons/msi'
import UserMenu from '@msi/ui/components/layout/sidebar/user-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@msi/ui/components/sidebar'
import Link from 'next/link'

export interface SidebarItem {
  title: string
  url: string
  icon?: LucideIcon
  isHeader?: boolean
}

interface AppSidebarProps {
  items: SidebarItem[]
}

export function AppSidebar({ items }: AppSidebarProps) {
  return (
    <Sidebar className="z-20">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className=" size-12 items-center justify-center rounded-lg">
                  <IconMsi className="size-12" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold italic text-xl">研發</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map(item => (
              item.isHeader
                ? (
                    <SidebarGroupLabel key={item.title}>{item.title}</SidebarGroupLabel>
                  )
                : (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
            ))}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
