'use client'

import { ScrollArea } from '@msi/ui/components/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@msi/ui/components/sidebar'
import * as React from 'react'

export function SearchRightBar() {
  const defaultOpen = true
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className='h-full min-h-0! w-auto! shrink-0'
    >
      <Sidebar
        side='right'
        collapsible='icon'
        className='h-full shrink-0 overflow-hidden'
        style={
          {
            '--sidebar-width': '260px',
            '--sidebar-width-icon': '56px'
          } as React.CSSProperties
        }
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className='flex min-h-10 items-center gap-2 px-2'>
              <span className='truncate text-sm font-semibold group-data-[collapsible=icon]:hidden'>
                會議檢索
              </span>
              {/* 折疊按鈕 - 移到 info 右側 */}
              <SidebarTrigger className='ml-auto size-6 shrink-0 group-data-[collapsible=icon]:ml-0' style={{ transform: 'rotateY(180deg)' }} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className='overflow-x-hidden'>
          <ScrollArea className='flex-1'>
            <SidebarGroup>
              <SidebarGroupContent className='flex max-w-full flex-col gap-6 overflow-hidden p-4 group-data-[collapsible=icon]:hidden'>
                <div className='flex flex-col gap-4'>
                  {/* 創意性滑動條 */}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}

export default SearchRightBar
