// src\app\(AI_City)\pcb\_components\dropzone.tsx

'use client'

import type { FileRejection } from 'react-dropzone'
import { Cloud, File, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Loading } from '@/components/ui/loading'
import { cn } from '@/lib/utils'

// 新增一個 API 呼叫的 prop
interface DragDropUploaderProps {
  onFileProcessed: (success: boolean) => void // 檔案處理完成後的狀態回饋
  userId: string | undefined // 從 useAuth 傳入的 userId
  disabled?: boolean
  // 其他原有的 props 根據需求可以移除或簡化
}
const fileTypes = [
  {
    id: 'xlsx',
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  },
  {
    id: 'xls',
    accept: {
      'application/vnd.ms-excel': ['.xls'],
    },
  },
]

// 計算所有 Excel 檔案的接受類型
const acceptedTypes = fileTypes.reduce((acc, fileType) => {
  for (const [mime, extensions] of Object.entries(fileType.accept)) {
    if (!acc[mime]) {
      acc[mime] = []
    }
    acc[mime] = Array.from(new Set([...acc[mime], ...extensions]))
  }
  return acc
}, {} as Record<string, string[]>)

// 新增：檔名驗證函數
const validateFileName = (fileName: string): { isValid: boolean, model?: string, pcb?: string, error?: string } => {
  // 移除副檔名
  const nameWithoutExt = fileName.replace(/\.(xlsx|xls)$/i, '')

  // 檔名格式: 專案代碼-版本號 (版本號後可接空格及任意文字)
  // 專案代碼：4字以上，英文字母及數字組合
  // 版本號：數字，可包含小數點
  // 版本號後方可以有空格及任意文字
  const regex = /^([A-Z0-9]{4,})-(\d+(?:\.\d+)?)(?:\s|$)/i
  const match = nameWithoutExt.match(regex)

  if (!match) {
    return {
      isValid: false,
      error: '檔名格式錯誤！請依照規則命名：專案代碼-版本號（例如：7E22-1.2 XXXX.xlsx）\n專案代碼需為4字以上的英文字母及數字組合，版本號為數值（可含小數點）',
    }
  }

  return {
    isValid: true,
    model: match[1], // 專案代碼
    pcb: match[2], // 版本號
  }
}

// 元件開始
export default function DragDropUploader({
  onFileProcessed,
  userId,
  disabled = false,
}: DragDropUploaderProps) {
  const router = useRouter()
  // 由於是單一檔案上傳並立即處理,我們只需一個 state 來追蹤檔案和處理狀態
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // 用於顯示上傳成功/失敗的狀態
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'fail'>('idle')

  const POLLING_INTERVAL = 2000
  const MAX_ATTEMPTS = 30
  const pollJobStatus = (
    jobId: string,
    router: any,
    setIsLoading: (loading: boolean) => void,
    attempt: number = 0,
  ): void => {
    const redirectPath = `/pcb/${jobId}/preview`
    const urlStatus = `${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/pcb/jobs/status/${jobId}`

    if (attempt >= MAX_ATTEMPTS) {
      router.push(redirectPath)
      console.error('檔案處理超時。')
      setIsLoading(false)
      return
    }

    // 使用 fetch 進行狀態檢查
    fetch(urlStatus, { method: 'GET' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API 狀態碼錯誤: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        const status = data.data.status

        console.warn('Job status:', status)

        if (status === 'completed') {
          // 1. 完成時,顯示成功訊息,跳轉
          toast.success('檔案處理完成,正在前往預覽頁面...')
          router.push(redirectPath)
          setIsLoading(false)
          return
        }

        setTimeout(() => {
          // 遞迴呼叫:在指定的間隔後再次檢查狀態
          pollJobStatus(jobId, router, setIsLoading, attempt + 1)
        }, POLLING_INTERVAL)
      })
      .catch((err) => {
        // 3. 處理失敗時,顯示錯誤訊息,並停止載入
        console.error('獲取狀態失敗:', err)
        toast.error('獲取狀態失敗,請重整頁面並由左側紀錄清單前往預覽頁面')
        setIsLoading(false)
      })
  }

  // 檔案處理的 POST API 函式（修改：新增 Model 和 pcb 參數）
  const postFileToAPI = useCallback(async (file: File, userId: string | undefined) => {
    const url = `${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/pcb/files/process`
    const formData = new FormData()

    if (!userId) {
      console.error('User ID is missing. Cannot proceed with upload.')
      return false
    }

    formData.append('File', file, file.name)
    formData.append('Title', file.name)
    formData.append('Keyin', userId)
    formData.append('PartNumber', 'N/A')

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        console.error('API upload failed:', response.status, response.statusText)
        const errorData = await response.text()
        console.error('API Error details:', errorData)
        return false
      }

      // 處理成功的 API 回應
      const result = await response.json()

      // 檢查並取得 jobId
      if (result.status === 'success' && result.data && result.data.jobId) {
        const jobId = result.data.jobId
        setIsLoading(true)
        // 核心修改:處理完成後跳轉到指定頁面
        pollJobStatus(jobId, router, setIsLoading)

        return true
      }
      else {
        console.error('API response format error: missing jobId or status is not success.', result)
        return false
      }
    }
    catch (error) {
      console.error('API upload error:', error)
      return false
    }
  }, [router])

  // 關鍵修改:使用 toast.error 顯示錯誤訊息,並移除狀態更新
  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    // 檢查是否有檔案
    if (fileRejections.length > 0) {
      const rejectedFile = fileRejections[0].file

      // 嘗試從檔名取得副檔名,如果沒有則使用 mime type 或未知類型
      const extension = rejectedFile.name.split('.').pop()?.toLowerCase() || rejectedFile.type || '未知類型'

      // 構造所需的錯誤訊息
      const message = `僅供上傳xlsx、xls檔,您所上傳的檔案類型為 ${extension}`

      // 使用 toast.error 提醒
      toast.error(message, {
        duration: 5000,
        position: 'top-center',
      })
      // ⚠️ 不再需要設定 setRejectMessage 或 setUploadStatus('fail')
    }
  }, [])

  // 處理檔案拖放事件（修改：新增檔名驗證）
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // 成功拖放時,將狀態重設
    setUploadStatus('idle')

    // 只處理第一個檔案
    const fileToUpload = acceptedFiles[0]

    // 1. 檢查是否有檔案且未禁用
    if (!fileToUpload || disabled || !userId) {
      if (!userId) {
        setUploadStatus('fail') // 無法上傳,因為沒有 user id
      }
      return
    }

    // 2. 新增：驗證檔名格式
    const validation = validateFileName(fileToUpload.name)
    if (!validation.isValid) {
      toast.error(validation.error, {
        duration: 6000,
        position: 'top-center',
      })
      setUploadStatus('fail')
      onFileProcessed(false)
      return
    }

    // 3. 開始上傳和處理
    setIsUploading(true)

    const success = await postFileToAPI(fileToUpload, userId)

    // 4. 更新狀態 (如果成功則會跳轉,以下程式碼主要處理失敗情況)
    setIsUploading(false)
    if (success) {
      setUploadStatus('success')
    }
    else {
      setUploadStatus('fail')
    }

    // 5. 回傳處理結果
    onFileProcessed(success)
  }, [disabled, userId, onFileProcessed, postFileToAPI])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected, // 加入 onDropRejected
    accept: acceptedTypes,
    multiple: false, // 只允許單一檔案
    disabled: disabled || isUploading,
    // 關鍵修改:移除了 noClick: true,讓根元素點擊行為生效
  })

  // 樣式判斷 (不再依賴 rejectMessage)
  const isSuccess = uploadStatus === 'success'
  const isError = uploadStatus === 'fail'

  return (
    // 根元素使用 getRootProps() 來處理點擊和拖放事件
    <div
      {...getRootProps()}
      className={cn(
        'group relative flex h-80 flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-300 overflow-hidden',
        {
          // 整個區塊現在都是可點擊的指標
          'cursor-pointer': !disabled && !isUploading,
          'cursor-not-allowed bg-gray-100 opacity-50': disabled || isUploading,
        },
        isDragActive && !disabled && !isUploading
          ? 'border-blue-500 bg-blue-50 scale-105'
          : isSuccess
            ? 'border-green-500 bg-green-50 shadow-lg'
            : isError
              ? 'border-red-500 bg-red-50 shadow-lg'
              : 'border-gray-300 bg-gray-50/50',
        !disabled && !isUploading && 'hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md',
      )}
    >
      <input {...getInputProps()} />

      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500 rounded-full blur-xl"></div>
      </div>

      <div className="flex flex-col items-center z-10 h-full w-full justify-center">
        {isDragActive && !isUploading
          ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                  <Cloud className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-lg font-semibold text-blue-700">
                  放下檔案到此處...
                </p>
              </div>
            )
          : isUploading
            ? (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center animate-spin">
                    <File className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-lg font-semibold text-yellow-700">
                    檔案處理中,請稍候...
                  </p>
                </div>
              )
            : (
                <div className="text-center space-y-4">
                  {/* 簡化的加號圖標 */}
                  {!isLoading && (
                    <div className={cn(
                      'w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300',
                      isSuccess && 'bg-green-100',
                      isError && 'bg-red-100',
                      !isSuccess && !isError && 'bg-gray-100 group-hover:bg-blue-100',
                    )}
                    >
                      <Plus
                        className={cn(
                          'w-8 h-8',
                          isSuccess && 'text-green-500',
                          isError && 'text-red-500',
                          !isSuccess && !isError && 'text-gray-400 group-hover:text-blue-500',
                        )}
                      />
                    </div>
                  )}

                  {/* 上傳文本 */}
                  <div>
                    {!isLoading && (
                      <p className="text-gray-500 mb-2">
                        (Upload Excel)
                      </p>
                    )}
                    <div className="text-lg font-semibold text-gray-400 mb-4">
                      {isLoading
                        ? (
                            <div className="flex items-center gap-2 justify-center text-green-500">
                              <Loading text="檔案處理中,請稍後..." size="large" />
                            </div>
                          )
                        : isSuccess
                          ? '✅ 檔案上傳及處理成功'
                          : isError
                            ? '❌ 檔案上傳或處理失敗'
                            : '拖放檔案到此處或點擊以選擇檔案'}
                    </div>
                    {!isLoading && (
                      <p className="text-gray-500 text-sm text-red-400 font-semibold">
                        * 檔案格式為 .xlsx 或 .xls,且檔名開頭需為 專案代碼+版本號 例如:7E22-1.2 XXXX.xlsx
                      </p>
                    )}
                  </div>
                </div>
              )}
      </div>
    </div>
  )
}
