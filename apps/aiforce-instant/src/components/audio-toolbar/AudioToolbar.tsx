'use client'

import type { TranscriptionData } from '@/types'

import { getAppConfig } from '@msi/config/env'
import { Button } from '@msi/ui/components/button'
import { LetterTextIcon, Loader2, Play, Square, Upload, X } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import LanSelector from './LanSelector'
import ModelSelector from './ModelSelector'

interface AudioToolbarProps {
  isUpload: boolean
  isRecording?: boolean             // 從 Hook 傳入的錄音狀態
  onResult: (data: TranscriptionData) => void // 上傳成功的結果回傳
  // onStartRecording?: (model: string, lang: string) => void // 觸發即時錄音
  // onStopRecording?: () => void      // 停止錄音
  onLoadingStatus?: (isLoading: boolean) => void // 傳回載入狀態
  onLanChange?: (lang: string) => void   // 語言變更回傳
}

export const AudioToolbar: React.FC<AudioToolbarProps> = ({
  isUpload,
  isRecording,
  onResult,
  // onStartRecording,
  // onStopRecording,
  onLoadingStatus,
  onLanChange
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetLang, setTargetLang] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedModel, setSelectedModel] = useState<string>('openai')

  // 處理檔案選取
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
      toast.success(`已選擇檔案: ${e.target.files[0].name}`)
    }
  }

  // 音檔上傳並產生逐字稿 - API串接
  const handleGenerateTranscript = async () => {
    console.warn('selectedModel', selectedModel)
    if (!selectedFile) {
      toast.error('請先選擇音檔')
      return
    }

    setIsLoading(true)
    onLoadingStatus?.(true)

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
        const data: TranscriptionData = await response.json()
        onResult?.(data)
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
      onLoadingStatus?.(false)
    }
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
              <Upload className='size-4' />
              {selectedFile ? '更換檔案' : '音檔上傳'}
            </Button>
          </>
        )}

        <span className='text-sm font-medium'>
          {isUpload ? '轉譯:' : '原文:'}
        </span>

        {/* 當 isUpload 為 false 時顯示前兩個下拉選單 */}
        {!isUpload && (
          <>
            {/* 下拉選單 1: OpenAI */}
            <ModelSelector
              onModelChange={setSelectedModel}
              disabled={isRecording || isLoading}
            />
            {/* <ChevronsRight size={20} stroke='gray' className='text-muted-foreground' /> */}
          </>
        )}

        {isUpload && (
          <LanSelector
            disabled={isRecording || isLoading}
            onLanChange={(val) => {
              setTargetLang(val)
              if (onLanChange) onLanChange(val)
            }}
          />
        )}

        {/* 主要動作按鈕 */}
        {isUpload ? (
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
        ) : (
          <Button
            // onClick={isRecording ? onStopRecording : () => { onStartRecording(selectedModel, targetLang) }}
            className={`flex gap-2 ${isRecording ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-300 dark:hover:bg-blue-400 dark:disabled:bg-blue-200'}`}
          >
            {isRecording ? <Square className='mr-2 size-4 fill-current' /> : <Play className='mr-2 size-4' />}
            {isRecording ? '停止錄音' : '開始錄音'}
          </Button>
        )}

        <input type='file' ref={fileInputRef} onChange={(e) => { setSelectedFile(e.target.files?.[0] ?? null) }} className='hidden' />
      </div>

      {/* 顯示檔名與檔案類型 */}
      {isUpload && selectedFile && (
        <div className='flex items-center gap-1' style={{ marginBottom: '-5px' }}>
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
