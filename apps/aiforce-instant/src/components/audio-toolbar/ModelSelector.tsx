// import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@msi/ui/components/select'

interface ModelSelectorProps {
  onModelChange: (model: string) => void
  disabled?: boolean
}

const ModelSelector = ({ onModelChange, disabled = false }: ModelSelectorProps) => {
  return (
    <Select onValueChange={onModelChange} defaultValue='openai' disabled={disabled}>
      <SelectTrigger className='w-[130px]'>
        <SelectValue placeholder='選擇模型' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='openai'>OpenAPI</SelectItem>
        <SelectItem value='nim'>English</SelectItem>
        <SelectItem value='nim-zh'>中文</SelectItem>
        {/* <SelectItem value="nim">DAD Service(英文)</SelectItem>
        <SelectItem value="nim-zh">DAD Service(中文)</SelectItem> */}
      </SelectContent>
    </Select>
  )
}

export default ModelSelector
