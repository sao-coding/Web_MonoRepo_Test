'use client'

import { Button } from '@msi/ui/components/button'
import { ScrollArea } from '@msi/ui/components/scroll-area'
import { Slider } from '@msi/ui/components/slider'
import { Textarea } from '@msi/ui/components/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@msi/ui/components/tooltip'
import { cn } from '@msi/ui/lib/utils'
import { Info, PanelLeft, PanelRight } from 'lucide-react' // 新增 PanelLeft 用於展開圖示
import React from 'react'

interface ParameterSettingsProps {
  creativity: number
  valueDegree: number
  promptInput: string
  onCreativityChange: (value: number) => void
  onValueDegreeChange: (value: number) => void
  onPromptInputChange: (value: string) => void
}

const ParameterSettings: React.FC<ParameterSettingsProps> = ({
  creativity,
  valueDegree,
  promptInput,
  onCreativityChange,
  onValueDegreeChange,
  onPromptInputChange,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptInputChange(e.target.value)
  }

  return (
    <div
      className={cn(
        'bg-gray-50 border-l border-gray-200 hidden md:flex flex-col h-full transition-all duration-300 ease-in-out relative',
        isExpanded ? 'w-80' : 'w-14',
      )}
    >
      {/* Header 區域 */}
      <div className="flex items-center justify-between h-14 px-3 shrink-0">
        {/* 標題與說明 (僅展開時顯示) */}
        <div
          className={cn(
            'flex items-center gap-2 overflow-hidden transition-opacity duration-200',
            isExpanded ? 'opacity-100' : 'opacity-0 w-0',
          )}
        >
          <span className="font-bold text-lg whitespace-nowrap">參數設定</span>

          {/* [重構重點]: 使用標準 Tooltip 取代手寫 onHover */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info className="size-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs p-4 text-sm" sideOffset={10}>
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
        </div>

        {/* 收合/展開按鈕 - 使用標準 Button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 ml-auto"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? '收合參數設定' : '展開參數設定'}
        >
          {isExpanded ? <PanelRight className="size-4" /> : <PanelLeft className="size-4" />}
        </Button>
      </div>

      {/* 內容區域 - 使用 ScrollArea */}
      {/* 透過 CSS 隱藏內容而非移除 DOM，保持狀態 */}
      <div className={cn('flex-1 overflow-hidden', !isExpanded && 'invisible')}>
        <ScrollArea className="h-full">
          <div className="p-4 flex flex-col gap-6">

            {/* 創意性滑動條 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">創意性</span>
                <div className="flex items-center gap-1 text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded">
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
                // 使用 className 覆蓋即可，無需使用 !important
                className="[&>[role=slider]]:h-4 [&>[role=slider]]:w-4"
              />
            </div>

            {/* 敏銳度滑動條 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">敏銳度</span>
                <div className="flex items-center gap-1 text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded">
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
                className="[&>[role=slider]]:h-4 [&>[role=slider]]:w-4"
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
                className="min-h-[120px] resize-none bg-white focus-visible:ring-1"
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default ParameterSettings
