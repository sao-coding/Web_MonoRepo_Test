'use client'

import clsx from 'clsx'
import { Camera, LoaderIcon, RefreshCw, X } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import Typed from 'typed.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AppConfig } from '@/config/img2text'

const HomePage = () => {
  const [data, setData] = React.useState<{ text: string } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [imgPreview, setImgPreview] = React.useState<string | null>(null)
  const fileRef = React.useRef<File | null>(null)
  const el = React.useRef(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!data) {
      return
    }

    const typed = new Typed(el.current, {
      strings: [data.text],
      typeSpeed: 1,
      showCursor: false,
    })

    return (): void => {
      typed.destroy()
    }
  }, [data])

  const previewFile = (imgFile: File | undefined): void => {
    if (imgFile) {
      const validTypes = ['image/jpeg', 'image/png']
      if (!validTypes.includes(imgFile.type)) {
        toast.error('請上傳 JPG 或 PNG 格式的圖片')
        setPreview(null)
        fileRef.current = null
        if (fileInputRef.current)
          fileInputRef.current.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = (e): void => {
        setPreview(e.target?.result as string)
        fileRef.current = imgFile
        // console.log('file', fileRef.current)
      }
      reader.readAsDataURL(imgFile)
    }
    else {
      setPreview(null)
      fileRef.current = null
      const fileInput = document.getElementById('file') as HTMLInputElement
      fileInput.value = ''
    }
  }

  const handleImgSubmit = async (): Promise<void> => {
    if (fileRef.current) {
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
        const data = await res.json()
        setData(data)
      }
      catch (error) {
        console.error('Error submitting image:', error)
        toast.error('提交圖片時發生錯誤')
      }
      finally {
        setLoading(false)
        fileRef.current = null
        if (fileInputRef.current)
          fileInputRef.current.value = ''
      }
    }
    else {
      toast.error('請選擇檔案')
    }
  }

  const clearResults = () => {
    setData(null)
    setImgPreview(null)
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const cancelPreview = () => {
    setPreview(null)
    fileRef.current = null
    if (fileInputRef.current)
      fileInputRef.current.value = ''
  }

  return (
    <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full overflow-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            使用說明
          </h2>
          <p className="text-blue-700">
            上傳一張圖片，AI 將識別圖片內容並生成相應的文字描述。支持 JPG 和
            PNG 格式。
          </p>
        </div>

        <div className="p-6">
          {(data || loading || imgPreview) && (
            <div className={`mb-8 ${imgPreview ? 'flex gap-6' : 'block'}`}>
              <div className={`${imgPreview ? 'flex-1' : 'w-full'}`}>
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex justify-between items-center">
                  <span>AI 文字描述</span>
                  {data && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearResults}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      重新開始
                    </Button>
                  )}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                  {loading
                    ? (
                        <div className="space-y-2">
                          <Skeleton className="w-full h-4" />
                          <Skeleton className="w-5/6 h-4" />
                          <Skeleton className="w-4/6 h-4" />
                        </div>
                      )
                    : (
                        <div className="text-gray-800 leading-relaxed">
                          <span ref={el} />
                        </div>
                      )}
                </div>
              </div>

              {imgPreview && (
                <div className="w-1/3">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    上傳的圖片
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imgPreview}
                      alt="上傳的圖片"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              {data ? '上傳新圖片' : '上傳圖片'}
            </h3>

            {!preview
              ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={triggerFileInput}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.currentTarget.classList.add(
                        'border-blue-400',
                        'bg-blue-50',
                      )
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.currentTarget.classList.remove(
                        'border-blue-400',
                        'bg-blue-50',
                      )
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.currentTarget.classList.remove(
                        'border-blue-400',
                        'bg-blue-50',
                      )

                      if (
                        e.dataTransfer.files
                        && e.dataTransfer.files.length > 0
                      ) {
                        previewFile(e.dataTransfer.files[0])
                      }
                    }}
                  >
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">點擊或拖放圖片到此處</p>
                    <p className="text-gray-500 text-sm">支持 JPG, PNG 格式</p>
                    <Input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      accept=".jpg,.png"
                      className="hidden"
                      onChange={e => previewFile(e.target.files?.[0])}
                    />
                  </div>
                )
              : (
                  <div className="relative border rounded-lg overflow-hidden">
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={cancelPreview}
                        className="rounded-full h-8 w-8 opacity-90"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleImgSubmit}
                variant="default"
                size="lg"
                className={clsx(
                  'px-6',
                  (loading || !preview) && 'opacity-70 cursor-not-allowed',
                )}
                disabled={loading || !preview}
              >
                {loading
                  ? (
                      <>
                        <LoaderIcon className="animate-spin mr-2 h-4 w-4" />
                        處理中...
                      </>
                    )
                  : (
                      '分析圖片'
                    )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
