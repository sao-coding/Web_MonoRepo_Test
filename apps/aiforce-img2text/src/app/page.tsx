'use client'

import { Camera, LoaderIcon, RefreshCw, X } from 'lucide-react'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import Typed from 'typed.js'

import { Button, cn, Input, Skeleton } from '@msi/ui'

const AppConfig = {
  serviceApiUrl: process.env.NEXT_PUBLIC_IMG2TEXT_API_URL || 'https://rd_service.msi.com.tw/ai_api'
}

export default function Img2TextPage() {
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
      showCursor: false,
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
      const res = await fetch(`${AppConfig.serviceApiUrl}/describe-image`, {
        method: 'POST',
        body: formData,
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

  const triggerFileInput = () => fileInputRef.current?.click()

  const cancelPreview = () => {
    setPreview(null)
    fileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl shadow-md overflow-hidden">
          {/* Instructions */}
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">使用說明</h2>
            <p className="text-blue-700">
              上傳一張圖片，AI 將識別圖片內容並生成相應的文字描述。支持 JPG 和 PNG 格式。
            </p>
          </div>

          <div className="p-6">
            {/* Results Section */}
            {(data || loading || imgPreview) && (
              <div className={`mb-8 ${imgPreview ? 'flex gap-6' : 'block'}`}>
                <div className={imgPreview ? 'flex-1' : 'w-full'}>
                  <h3 className="text-lg font-medium text-foreground mb-3 flex justify-between items-center">
                    <span>AI 文字描述</span>
                    {data && (
                      <Button variant="ghost" size="sm" onClick={clearResults}>
                        <RefreshCw className="size-4 mr-1" />
                        重新開始
                      </Button>
                    )}
                  </h3>
                  <div className="bg-muted rounded-lg p-4 min-h-[200px]">
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-5/6 h-4" />
                        <Skeleton className="w-4/6 h-4" />
                      </div>
                    ) : (
                      <div className="text-foreground leading-relaxed">
                        <span ref={el} />
                      </div>
                    )}
                  </div>
                </div>

                {imgPreview && (
                  <div className="w-1/3">
                    <h3 className="text-lg font-medium text-foreground mb-3">上傳的圖片</h3>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <img src={imgPreview} alt="上傳的圖片" className="w-full h-auto object-contain" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Section */}
            <div className="mt-4">
              <h3 className="text-lg font-medium text-foreground mb-3">
                {data ? '上傳新圖片' : '上傳圖片'}
              </h3>

              {!preview ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
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
                  <Camera className="size-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">點擊或拖放圖片到此處</p>
                  <p className="text-muted-foreground text-sm">支持 JPG, PNG 格式</p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.png"
                    className="hidden"
                    onChange={e => previewFile(e.target.files?.[0])}
                  />
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden">
                  <img src={preview} alt="preview" className="w-full h-auto max-h-[400px] object-contain" />
                  <div className="absolute top-2 right-2">
                    <Button size="icon" variant="destructive" onClick={cancelPreview} className="rounded-full size-8">
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleImgSubmit}
                  size="lg"
                  className={cn('px-6', (loading || !preview) && 'opacity-70 cursor-not-allowed')}
                  disabled={loading || !preview}
                >
                  {loading ? (
                    <>
                      <LoaderIcon className="animate-spin mr-2 size-4" />
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
      </div>
    </div>
  )
}
