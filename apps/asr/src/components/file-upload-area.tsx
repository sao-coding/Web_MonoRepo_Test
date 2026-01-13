'use client'

import { Button } from '@msi/ui/components/button'
import { ArrowUp, FileTextIcon, InfoIcon, MicIcon, XIcon } from 'lucide-react'

interface FileUploadAreaProps {
  selectedFile: string
  isLoading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onDrag: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearFile: () => void
  onSubmit: () => void
  maxWidthClass?: string
}

export function FileUploadArea({
  selectedFile,
  isLoading,
  fileInputRef,
  onDrag,
  onDrop,
  onFileChange,
  onClearFile,
  onSubmit,
  maxWidthClass = 'max-w-3xl'
}: FileUploadAreaProps) {
  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClearFile()
  }

  return (
    <div className={`w-full ${maxWidthClass} mx-auto`}>
      <div className='flex flex-col gap-2'>
        <div className='relative flex w-full flex-1 flex-col rounded-3xl border border-gray-200 bg-white px-3 py-2 shadow-lg transition hover:border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'>
          <div className='flex flex-col gap-4'>
            {/* 拖放上傳區 */}
            <div
              className='relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-700'
              onDragEnter={onDrag}
              onDragOver={onDrag}
              onDragLeave={onDrag}
              onDrop={onDrop}
              onClick={handleFileUploadClick}
            >
              <input
                type='file'
                id='fileInput'
                ref={fileInputRef}
                accept='.wav'
                onChange={onFileChange}
                className='hidden'
              />

              <div className='flex flex-col items-center justify-center gap-2 text-center'>
                <div className='mb-2 text-gray-400 dark:text-gray-500'>
                  <MicIcon className='mx-auto size-12' />
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  點擊或拖放WAV檔到此處
                </p>
                <div className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400'>
                  <InfoIcon className='size-3.5' />
                  <span>目前只支持單聲道WAV格式文件</span>
                </div>
              </div>

              {selectedFile && (
                <div className='mt-3 flex items-center justify-center gap-2 rounded-sm bg-blue-50 p-2 dark:bg-blue-900/20'>
                  <FileTextIcon className='size-4 text-blue-500' />
                  <span className='max-w-xs truncate text-sm text-gray-700 dark:text-gray-300'>
                    {selectedFile}
                  </span>
                  <button
                    type='button'
                    className='text-gray-500 hover:text-red-500'
                    onClick={handleClearClick}
                  >
                    <XIcon className='size-4' />
                  </button>
                </div>
              )}
            </div>

            {/* 送出按鈕 */}
            <div className='flex justify-end'>
              <Button
                onClick={onSubmit}
                disabled={isLoading || !selectedFile}
                className='h-10 gap-2 rounded-full px-4'
              >
                {isLoading ? (
                  <div className='size-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <>
                    <ArrowUp className='size-4' />
                    <span>分析音頻</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUploadArea
