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
  SidebarTrigger,
} from '@msi/ui/components/sidebar'
import { Slider } from '@msi/ui/components/slider'
import { Textarea } from '@msi/ui/components/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@msi/ui/components/tooltip'
import { cn } from '@msi/ui/lib/utils'
import { Info } from 'lucide-react'
import React from 'react'

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
      className="min-h-0! w-auto! h-full shrink-0"
    >
      <Sidebar
        side="right"
        collapsible="icon"
        className={cn('shrink-0 h-full overflow-hidden', className)}
        style={
          {
            '--sidebar-width': '260px',
            '--sidebar-width-icon': '56px',
          } as React.CSSProperties
        }
        {...props}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2 px-2 min-h-[40px]">
              <span className="font-semibold text-sm truncate group-data-[collapsible=icon]:hidden">
                參數設定
              </span>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Info className="size-4 text-muted-foreground cursor-help shrink-0 group-data-[collapsible=icon]:hidden hover:bg-muted rounded p-0.5 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs p-4 text-sm shadow-lg" sideOffset={10}>
                    <ul className="list-disc pl-4 space-y-1">
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
              <SidebarTrigger className="size-6 shrink-0 ml-auto group-data-[collapsible=icon]:ml-0" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="overflow-x-hidden">
          <ScrollArea className="flex-1">
            <SidebarGroup>
              <SidebarGroupContent className="px-4 py-4 flex flex-col gap-6 group-data-[collapsible=icon]:hidden max-w-full overflow-hidden">
                {/* 創意性滑動條 */}
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">創意性</span>
                    <div className="flex items-center gap-1 text-sm font-semibold bg-muted px-2 py-0.5 rounded">
                      <span className="size-2 rounded-full bg-orange-400"></span>
                      <span>{creativity.toFixed(1)}</span>
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={0.8}
                    step={0.1}
                    value={[creativity]}
                    onValueChange={val => onCreativityChange(val[0])}
                    className="[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-primary"
                  />
                </div>

                {/* 敏銳度滑動條 */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">敏銳度</span>
                    <div className="flex items-center gap-1 text-sm font-semibold bg-muted px-2 py-0.5 rounded">
                      <span className="size-2 rounded-full bg-orange-500"></span>
                      <span>{valueDegree}</span>
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={30}
                    step={1}
                    value={[valueDegree]}
                    onValueChange={val => onValueDegreeChange(val[0])}
                    className="[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-primary"
                  />
                </div>

                {/* 引導詞輸入框 */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">引導詞</span>
                  <Textarea
                    id="prompt"
                    onChange={handlePromptChange}
                    value={promptInput}
                    placeholder="請輸入您想要的引導詞..."
                    className="min-h-[120px] resize-none"
                  />
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
