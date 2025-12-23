'use client'

import { useAuth } from '@msi/auth/src/provider'
import { FileSpreadsheet } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import DragDropUploader from './_components/dropzone'

const PatentsPage = () => {
  const { user } = useAuth()
  // 追蹤檔案處理狀態 (可以根據您的需求修改)
  const [isProcessing, setIsProcessing] = useState(false)
  // 處理檔案處理結果的回調函式
  const handleFileProcessed = useCallback((success: boolean) => {
    setIsProcessing(false) // 處理完成
    // 可以在這裡根據 success 狀態顯示通知或更新其他 UI
    if (success) {
      console.warn('File processed successfully on the server.')
    }
    else {
      console.error('File processing failed on the server.')
    }
  }, [])

  return (
    <div className="max-h-[400px] border flex-1 p-4 flex flex-col bg-white rounded-xl">
      <div className="p-4 justify-between flex items-center space-x-2">
        <span className="font-bold">檔案上傳</span>
        <div className="flex items-center">
          範本：
          <a
            title="請點擊查看範本"
            rel="noreferrer"
            href="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/File/PCB/7E22-1.2 constraint.xlsx"
            target="_blank"
          >
            <FileSpreadsheet size={25} stroke="white" fill="green" />
          </a>
        </div>
      </div>
      <div>
        <DragDropUploader
          onFileProcessed={handleFileProcessed}
          userId={user?.userId} // 傳入 user id
          disabled={isProcessing} // 使用新的 isProcessing 狀態
        />
      </div>
    </div>
  )
}

export default PatentsPage
