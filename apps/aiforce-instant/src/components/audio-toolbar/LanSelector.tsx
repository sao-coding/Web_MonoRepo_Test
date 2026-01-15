// import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@msi/ui/components/select'

interface LanSelectorProps {
  onLanChange: (language: string) => void
  disabled?: boolean
}

const LanSelector = ({ onLanChange, disabled = false }: LanSelectorProps) => {
  return (
    <Select onValueChange={onLanChange} defaultValue='no' disabled={disabled}>
      <SelectTrigger className='w-[130px]'>
        <SelectValue placeholder='無需轉譯' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='no'>無需轉譯</SelectItem>
        <SelectItem value='zh-TW'>中文</SelectItem>
        <SelectItem value='en'>英文</SelectItem>
        <SelectItem value='de'>德文</SelectItem>
        <SelectItem value='ja'>日文</SelectItem>
        <SelectItem value='ko'>韓文</SelectItem>
        {/* <SelectItem value="nim">DAD Service(英文)</SelectItem>
        <SelectItem value="nim-zh">DAD Service(中文)</SelectItem> */}
      </SelectContent>
    </Select>
  )
}

export default LanSelector
