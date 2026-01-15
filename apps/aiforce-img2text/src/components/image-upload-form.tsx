'use client'

import { getAppConfig } from '@msi/config/env'
import { Button, cn, Input, Skeleton } from '@msi/ui'
import { Camera, LoaderIcon, RefreshCw, X } from 'lucide-react'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import Typed from 'typed.js'

export function ImageUploadForm() {
  const [data, setData] = useState<{ text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const fileRef = useRef<File | null>(null)
  const el = useRef(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!data) return

    const typed = new Typed(el.current, {
      strings: [data.text],
      typeSpeed: 1,
      showCursor: false
    })

    return () => typed.destroy()
  }, [data])

  const previewFile = (imgFile: File | undefined) => {
    if (imgFile) {
      const validTypes = ['image/jpeg', 'image/png']
      if (!validTypes.includes(imgFile.type)) {
        toast.error('請上傳 JPG 或 PNG 格式的圖片')
        setPreview(null)
        fileRef.current = null
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        fileRef.current = imgFile
      }
      reader.readAsDataURL(imgFile)
    } else {
      setPreview(null)
      fileRef.current = null
    }
  }

  const handleImgSubmit = async () => {
    if (!fileRef.current) {
      toast.error('請選擇檔案')
      return
    }

    setLoading(true)
    setImgPreview(preview)
    setPreview(null)

    const formData = new FormData()
    formData.append('image', fileRef.current)
    formData.append('Token', '0UET8Lal6hBBqNSE')

    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_IMG2TEXT_API_URL}/describe-image`, {
        method: 'POST',
        body: formData
      })
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error:', error)
      toast.error('提交圖片時發生錯誤')
    } finally {
      setLoading(false)
      fileRef.current = null
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const clearResults = () => {
    setData(null)
    setImgPreview(null)
  }

  const triggerFileInput = () => { fileInputRef.current?.click() }

  const cancelPreview = () => {
    setPreview(null)
    fileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className='bg-card overflow-hidden rounded-xl shadow-md'>
      {/* Instructions */}
      <div className='border-b border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30'>
        <h2 className='mb-2 text-lg font-semibold text-blue-800 dark:text-blue-200'>使用說明</h2>
        <p className='text-blue-700 dark:text-blue-300'>
          上傳一張圖片，AI 將識別圖片內容並生成相應的文字描述。支持 JPG 和 PNG 格式。
        </p>
      </div>

      <div className='p-6'>
        {/* Results Section */}
        {(data || loading || imgPreview) && (
          <div className={`mb-8 ${imgPreview ? 'flex gap-6' : 'block'}`}>
            <div className={imgPreview ? 'flex-1' : 'w-full'}>
              <h3 className='text-foreground mb-3 flex items-center justify-between text-lg font-medium'>
                <span>AI 文字描述</span>
                {data && (
                  <Button variant='ghost' size='sm' onClick={clearResults}>
                    <RefreshCw className='mr-1 size-4' />
                    重新開始
                  </Button>
                )}
              </h3>
              <div className='bg-muted min-h-[200px] rounded-lg p-4'>
                {loading ? (
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-5/6' />
                    <Skeleton className='h-4 w-4/6' />
                  </div>
                ) : (
                  <div className='text-foreground leading-relaxed'>
                    <span ref={el} />
                  </div>
                )}
              </div>
            </div>

            {imgPreview && (
              <div className='w-1/3'>
                <h3 className='text-foreground mb-3 text-lg font-medium'>上傳的圖片</h3>
                <div className='border-border overflow-hidden rounded-lg border'>
                  <img src={imgPreview} alt='上傳的圖片' className='h-auto w-full object-contain' />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Section */}
        <div className='mt-4'>
          <h3 className='text-foreground mb-3 text-lg font-medium'>
            {data ? '上傳新圖片' : '上傳圖片'}
          </h3>

          {!preview ? (
            <div
              className='border-border cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:bg-muted/50'
              onClick={triggerFileInput}
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('border-primary', 'bg-primary/5')
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                if (e.dataTransfer.files?.length > 0) {
                  previewFile(e.dataTransfer.files[0])
                }
              }}
            >
              <Camera className='text-muted-foreground mx-auto mb-4 size-12' />
              <p className='text-muted-foreground mb-2'>點擊或拖放圖片到此處</p>
              <p className='text-muted-foreground text-sm'>支持 JPG, PNG 格式</p>
              <Input
                ref={fileInputRef}
                type='file'
                accept='.jpg,.png'
                className='hidden'
                onChange={(e) => { previewFile(e.target.files?.[0]) }}
              />
            </div>
          ) : (
            <div className='relative overflow-hidden rounded-lg border'>
              <img src={preview} alt='preview' className='h-auto max-h-[400px] w-full object-contain' />
              <div className='absolute top-2 right-2'>
                <Button size='icon' variant='destructive' onClick={cancelPreview} className='size-8 rounded-full'>
                  <X className='size-4' />
                </Button>
              </div>
            </div>
          )}

          <div className='mt-4 flex justify-end'>
            <Button
              onClick={handleImgSubmit}
              size='lg'
              className={cn('px-6', (loading || !preview) && 'opacity-70 cursor-not-allowed')}
              disabled={loading || !preview}
            >
              {loading ? (
                <>
                  <LoaderIcon className='mr-2 size-4 animate-spin' />
                  處理中...
                </>
              ) : (
                '分析圖片'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
