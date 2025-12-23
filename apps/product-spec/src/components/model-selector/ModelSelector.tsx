'use client'

import { Button } from '@msi/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@msi/ui/components/dropdown-menu'
import { ChevronDown, Star } from 'lucide-react'
import React from 'react'

/**
 * AI 模型介面
 * 用於 ModelSelector 元件
 */
export interface AIModel {
  id: number
  name: string
  modelId: string
  provider: string | null
  description: string | null
  modelType: string
  state: string
  isDefault: string
  aliases: string
  recommend: string
}

export interface ModelSelectorProps {
  /** 模型列表 */
  models: AIModel[]
  /** 選中的模型 */
  selectedModel: AIModel | undefined
  /** 選擇模型時的回調 */
  onSelect: (modelId: number) => void
  /** 是否顯示為筆記模式 */
  isNoteMode?: boolean
}

/**
 * ModelSelector Component
 *
 * 模型選擇下拉選單元件，可在多個 AI 聊天功能中複用
 *
 * @example
 * ```tsx
 * <ModelSelector
 *   models={models}
 *   selectedModel={selectedModel}
 *   onSelect={setSelectedModelId}
 * />
 * ```
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelect,
  isNoteMode = false,
}) => {
  if (isNoteMode) {
    return <span className="font-medium">筆記</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1">
          {selectedModel
            ? `(${selectedModel.modelType === '1' ? 'Global' : '雲端'}) ${selectedModel.aliases}`
            : '選擇模型'}
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {models.map(model => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => onSelect(model.id)}
            className="flex-col items-start gap-1"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">
                ({model.modelType === '1' ? 'Global' : '雲端'})
                {' '}
                {model.aliases}
              </span>
              {model.recommend === '1' && (
                <span className="text-red-500 font-bold flex items-center gap-1 text-xs">
                  <Star className="size-3" fill="red" stroke="none" />
                  推薦
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{model.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModelSelector
