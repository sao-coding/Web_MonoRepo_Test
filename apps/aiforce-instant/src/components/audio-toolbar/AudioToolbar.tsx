'use client'

import { getAppConfig } from '@msi/config/env'
import { Button } from '@msi/ui/components/button'
import { ChevronsRight, LetterTextIcon, Loader2, Play, Upload, X } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import LanSelector from './LanSelector'
import ModelSelector from './ModelSelector'

interface AudioToolbarProps {
  isUpload: boolean
  onModelChange?: (model: string) => void
  onLanChange?: (language: string) => void
}

export const AudioToolbar: React.FC<AudioToolbarProps> = ({ isUpload, onModelChange, onLanChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetLang, setTargetLang] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 處理檔案選取
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
      toast.success(`已選擇檔案: ${e.target.files[0].name}`)
    }
  }

  // 執行 API 串接
  const handleGenerateTranscript = async () => {
    if (!selectedFile) {
      toast.error('請先選擇音檔')
      return
    }

    setIsLoading(true)

    // 依照 API 格式準備 FormData
    const formData = new FormData()
    formData.append('file', selectedFile)

    // 若 targetLang 為空或「無需轉譯」，API 規範說明「若沒填入，就不會翻譯」
    if (targetLang && targetLang !== 'no') {
      formData.append('tgt_lang', targetLang)
    }

    try {
      toast.info('正在上傳並解析音檔...')
      const response = await fetch(`${getAppConfig().NEXT_PUBLIC_AI_API_URL}/file-transcriber`, {
        method: 'POST',
        body: formData // FormData 會自動設定正確的 Content-Type
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('解析完成！')
        console.warn('Transcription Result:', data)
      } else {
        throw new Error('API 請求失敗')
      }
    } catch (error) {
      toast.error('解析失敗，請稍後再重試一次。')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModelChange = (value: string) => {
    if (onModelChange) onModelChange(value)
  }

  return (
    <div className='grid gap-1'>
      <div className='flex items-center gap-2'>
        {/* 當 isUpload 為 true 時顯示 */}
        {isUpload && (
          <>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              className='hidden'
              accept='.mp3,.wav,.m4a,.mp4,.f1ac,.ogg,.webm'
            />
            <Button
              variant='default'
              className='gap-2'
              onClick={() => fileInputRef.current?.click()}
              disabled={ isLoading }
            >
              <Upload className='size-4' /> 音檔上傳
            </Button>
          </>
        )}

        <span className='text-sm font-medium'>轉譯:</span>

        {/* 當 isUpload 為 false 時顯示前兩個下拉選單 */}
        {!isUpload && (
          <>
            {/* 下拉選單 1: OpenAI */}
            <ModelSelector onModelChange={handleModelChange} />
            <ChevronsRight size={20} stroke='gray' className='text-muted-foreground' />
          </>
        )}

        <LanSelector onLanChange={(val) => {
          setTargetLang(val)
          if (onLanChange) onLanChange(val)
        }} />

        {/* 當 isUpload 為 false 時顯示：開始錄音 */}
        {!isUpload && (
          <Button
            className='flex gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-300 dark:hover:bg-blue-400'
          >
            <Play className='size-4' />
            開始錄音
          </Button>
        )}

        {/* 當 isUpload 為 true 時顯示：生成逐字稿 */}
        {isUpload && (
          <Button
            className='flex gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-300 dark:hover:bg-blue-400 dark:disabled:bg-blue-200'
            onClick={handleGenerateTranscript}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <LetterTextIcon className='size-4' />
            )}
            {isLoading ? '逐字稿生成中...' : '生成逐字稿'}
          </Button>
        )}
      </div>

      {/* 顯示檔名與檔案類型 */}
      {isUpload && selectedFile && (
        <div className='flex items-center gap-1' style={{ marginBottom: '-15px' }}>
          <X
            strokeWidth={3}
            size={16}
            className='size-3 cursor-pointer text-red-500'
            onClick={() => { setSelectedFile(null) }}
          />
          <Link
            className='text-xs font-semibold text-blue-600 underline dark:text-blue-400'
            href={URL.createObjectURL(selectedFile)} target='_blank' rel='noopener noreferrer'
          >
              {selectedFile.name}
          </Link>
        </div>
      )}
    </div>
  )
}
