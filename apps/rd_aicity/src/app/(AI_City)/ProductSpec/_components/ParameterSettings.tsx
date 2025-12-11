'use client'

import { ScrollArea } from '@msi/ui/components/scroll-area'
import { Slider } from '@msi/ui/components/slider'
import { Textarea } from '@msi/ui/components/textarea'
import { Info, PanelRight } from 'lucide-react'
import React, { useRef, useState } from 'react'

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
  const [isHoveringInfo, setIsHoveringInfo] = useState(false)
  const [hoveredInfo, setHoveredInfo] = useState<{ x: number, y: number }>({
    x: 0,
    y: 0,
  })
  const [isExpanded, setIsExpanded] = useState(true)
  const infoBoxRef = useRef<HTMLDivElement>(null)

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptInputChange(e.target.value)
  }

  const handleMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsHoveringInfo(true)
    setHoveredInfo({
      x: e.pageX - 580,
      y: e.clientY + 20,
    })
  }

  const handleMouseLeave = () => {
    setIsHoveringInfo(false)
  }

  // 定義共用的 Slider class，包含自定義的灰色聚焦外框
  const sliderClassName = `
    [&_[data-slot=slider-track]]:bg-gray-200
    [&_[data-slot=slider-range]]:!bg-black
    [&_[data-slot=slider-thumb]]:!bg-white
    [&_[data-slot=slider-thumb]]:!border-black
    [&_[data-slot=slider-thumb]]:!border-2
    [&_[data-slot=slider-thumb]]:!size-4
    [&_[data-slot=slider-thumb]]:!shadow-none

    /* 聚焦時的灰色外框設定 */
    [&_[data-slot=slider-thumb]]:focus-visible:!ring-2
    [&_[data-slot=slider-thumb]]:focus-visible:!ring-gray-400
    [&_[data-slot=slider-thumb]]:focus-visible:!ring-offset-2
    [&_[data-slot=slider-thumb]]:focus-visible:!ring-offset-white
  `

  return (
    <div className={`bg-gray-50 hidden md:block h-full transition-all duration-300 ${isExpanded ? 'w-80' : 'w-14'}`}>
      {isExpanded
        ? (
            <>
              <div className="px-4 flex items-center gap-2 h-14 border-b border-gray-200">
                <span className="font-bold text-lg">參數設定</span>
                <Info
                  fill="#000"
                  stroke="#fff"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
                {isHoveringInfo && (
                  <div
                    ref={infoBoxRef}
                    className="absolute z-10 min-w-[400px] bg-white border border-gray-300 shadow-lg p-4 inline-block"
                    style={{
                      borderRadius: '10px 0 10px 10px',
                      left: hoveredInfo.x,
                      top: hoveredInfo.y,
                    }}
                  >
                    <ul className="block list-disc pl-4">
                      <li>
                        創意性:控制生成的隨機性,數值越高回答的越隨機。(0 ~ 0.8 預設為 0.1)
                      </li>
                      <li>
                        敏銳度:可透過此設定調整檢索的相關資料數。(0 ~ 30 預設為5)。
                      </li>
                      <li>
                        引導詞:可透過此設定調整回話風格或是個人喜好資訊。
                      </li>
                    </ul>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="收合參數設定"
                >
                  <PanelRight size={20} />
                </button>
              </div>

              <ScrollArea className="flex-1 h-[calc(100vh-3.5rem)]">
                <div className="p-4 flex flex-col gap-6">
                  {/* 創意性滑動條 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span>創意性</span>
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                        <span>{creativity.toFixed(1)}</span>
                      </div>
                    </div>
                    <Slider
                      min={0}
                      max={0.8}
                      step={0.1}
                      value={[creativity]}
                      onValueChange={val => onCreativityChange(val[0])}
                      className={sliderClassName}
                    />
                  </div>

                  {/* 敏銳度滑動條 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span>敏銳度</span>
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                        <span>{valueDegree}</span>
                      </div>
                    </div>
                    <Slider
                      min={0}
                      max={30}
                      step={1}
                      value={[valueDegree]}
                      onValueChange={val => onValueDegreeChange(val[0])}
                      className={sliderClassName}
                    />
                  </div>

                  {/* 引導詞輸入框 */}
                  <div>
                    <span>引導詞</span>
                    <Textarea
                      id="prompt"
                      onChange={handlePromptChange}
                      value={promptInput}
                      rows={4}
                      placeholder="請輸入您想要的引導詞"
                      className="w-full h-24 mt-2 min-h-[100px] max-h-[300px]"
                    />
                  </div>
                </div>
              </ScrollArea>
            </>
          )
        : (
            <div className="flex items-center justify-center h-9 mt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                aria-label="展開參數設定"
              >
                <PanelRight size={20} />
              </button>
            </div>
          )}
    </div>
  )
}

export default ParameterSettings
