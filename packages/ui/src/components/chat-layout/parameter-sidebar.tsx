'use client'

import { Info } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/utils'
import { ScrollArea } from '../scroll-area'
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
} from '../sidebar'
import { Slider } from '../slider'
import { Textarea } from '../textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../tooltip'

export interface ParameterSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** 創意性數值 (0-0.8) */
  creativity: number
  /** 敏銳度數值 (0-30) */
  valueDegree: number
  /** 引導詞輸入 */
  promptInput: string
  /** 創意性變更回調 */
  onCreativityChange: (value: number) => void
  /** 敏銳度變更回調 */
  onValueDegreeChange: (value: number) => void
  /** 引導詞變更回調 */
  onPromptInputChange: (value: string) => void
}

/**
 * ParameterSidebar 元件
 *
 * 右側參數設定面板，使用 @msi/ui 的 Sidebar 元件
 * 包含創意性、敏銳度滑桿和引導詞輸入
 */
export function ParameterSidebar({
  creativity,
  valueDegree,
  promptInput,
  onCreativityChange,
  onValueDegreeChange,
  onPromptInputChange,
  className,
  defaultOpen = true,
  ...props
}: ParameterSidebarProps & { defaultOpen?: boolean }) {
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptInputChange(e.target.value)
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className='h-full min-h-0! w-auto! shrink-0'
    >
      <Sidebar
        side='right'
        collapsible='icon'
        className={cn('shrink-0 h-full overflow-hidden', className)}
        style={
          {
            '--sidebar-width': '260px',
            '--sidebar-width-icon': '56px'
          } as React.CSSProperties
        }
        {...props}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className='flex min-h-[40px] items-center gap-2 px-2'>
              <span className='truncate text-sm font-semibold group-data-[collapsible=icon]:hidden'>
                參數設定
              </span>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Info className='size-4 shrink-0 cursor-help rounded-sm p-0.5 text-muted-foreground transition-colors group-data-[collapsible=icon]:hidden hover:bg-muted' />
                  </TooltipTrigger>
                  <TooltipContent side='left' className='max-w-xs p-4 text-sm shadow-lg' sideOffset={10} showArrow={false}>
                    <ul className='list-disc space-y-1 pl-4'>
                      <li>
                        <strong>創意性：</strong>
                        控制生成的隨機性，數值越高回答越隨機。(0 ~ 0.8，預設 0.1)
                      </li>
                      <li>
                        <strong>敏銳度：</strong>
                        調整檢索的相關資料數。(0 ~ 30，預設 5)
                      </li>
                      <li>
                        <strong>引導詞：</strong>
                        調整回話風格或是個人喜好資訊。
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* 折疊按鈕 - 移到 info 右側 */}
              <SidebarTrigger className='ml-auto size-6 shrink-0 group-data-[collapsible=icon]:ml-0' />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className='overflow-x-hidden'>
          <ScrollArea className='flex-1'>
            <SidebarGroup>
              <SidebarGroupContent className='flex max-w-full flex-col gap-6 overflow-hidden p-4 group-data-[collapsible=icon]:hidden'>
                {/* 創意性滑動條 */}
                <div className='flex w-full flex-col gap-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>創意性</span>
                    <div className='flex items-center gap-1 rounded-sm bg-sidebar px-2 py-0.5 text-sm font-semibold'>
                      <span className='size-2 rounded-full bg-orange-400'></span>
                      <span>{creativity.toFixed(1)}</span>
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={0.8}
                    step={0.1}
                    value={[creativity]}
                    onValueChange={(val) => { onCreativityChange(val[0]) }}
                    className='[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-track]]:h-2'
                  />
                </div>

                {/* 敏銳度滑動條 */}
                <div className='flex flex-col gap-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>敏銳度</span>
                    <div className='flex items-center gap-1 rounded-sm bg-sidebar px-2 py-0.5 text-sm font-semibold'>
                      <span className='size-2 rounded-full bg-orange-500'></span>
                      <span>{valueDegree}</span>
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={30}
                    step={1}
                    value={[valueDegree]}
                    onValueChange={(val) => { onValueDegreeChange(val[0]) }}
                    className='[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-track]]:h-2'
                  />
                </div>

                {/* 引導詞輸入框 */}
                <div className='flex flex-col gap-2'>
                  <span className='text-sm font-medium'>引導詞</span>
                  <div className='relative'>
                    <Textarea
                      id='prompt'
                      onChange={handlePromptChange}
                      value={promptInput}
                      placeholder='請輸入您想要的引導詞...'
                      className='max-h-[300px] min-h-[100px] resize-y overflow-y-auto [&::-webkit-resizer]:hidden'
                    />
                    <svg
                      width='10'
                      height='10'
                      viewBox='0 0 10 10'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      className='pointer-events-none absolute right-2 bottom-2 text-gray-400 dark:text-gray-500'
                    >
                      <path d='M8 6L6 8' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
                    </svg>
                  </div>
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

export default ParameterSidebar
