'use client'

import {
  CheckIcon,
  CopyIcon,
  InfoIcon,
  PencilIcon,
  SendHorizontalIcon,
  TrashIcon,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import Banner from '@/components/banner-b'
import DefaltInfo from '@/components/chat-robot/defalt-info'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import LeftSidebar from '@/components/ui/left-sidebar'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'

interface RecordItem {
  F_SeqNo: number
  F_Title: string
  F_CreateDate: string
}

interface RecordDetail {
  F_Question: number
  F_Answer: string
}

const HomePage = () => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = React.useRef<HTMLDivElement>(null)

  const [conversations, setConversations] = useState<Array<{ question: string, answer: string }>>([])
  const [userInput, setUserInput] = React.useState<string>('')
  const [message, setMessage] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{
    input: string
    output: string
  } | null>(null)
  const [isNewRecord, setIsNewRecord] = useState(true)
  const answerRef = useRef<HTMLDivElement>(null)

  // 資料庫記錄相關狀態
  const [records, setRecords] = useState<RecordItem[]>([])
  const [isEditingTitle, setIsEditingTitle] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const [activeRecordId, setActiveRecordId] = useState<number | null>(null)

  const [currentUserQuestion, setCurrentUserQuestion] = React.useState<string>('')
  const { user } = useAuth()

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversations, currentUserQuestion, message])

  const fetchRecords = async () => {
    try {
      const res = await fetch(`/AI_City/api/vga/record?Keyin=${user?.userId}`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        setRecords(data)
      }
    }
    catch (err) {
      console.error('獲取記錄失敗:', err)
      toast.error('獲取記錄失敗')
    }
  }

  const deleteRecord = async (seqNo: number) => {
    try {
      const res = await fetch(`/AI_City/api/vga/record?SeqNo=${seqNo}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('記錄已刪除')
        if (activeRecordId === seqNo) {
          setActiveRecordId(null)
          setConversations([])
          setMessage('')
        }
        fetchRecords() // 重新讀取記錄
      }
      else {
        toast.error('刪除失敗')
      }
    }
    catch (err) {
      console.error('刪除記錄失敗:', err)
      toast.error('刪除記錄失敗')
    }
  }

  const startEditTitle = (seqNo: number, currentTitle: string) => {
    setIsEditingTitle(seqNo)
    setNewTitle(currentTitle)
  }

  const updateTitle = async (seqNo: number) => {
    if (!newTitle.trim()) {
      toast.error('標題不能為空')
      return
    }
    try {
      const res = await fetch(`/AI_City/api/vga/record`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SeqNo: seqNo,
          Title: newTitle,
        }),
      })

      if (res.ok) {
        toast.success('標題已更新')
        setIsEditingTitle(null)
        fetchRecords() // 重新讀取記錄
      }
      else {
        toast.error('更新失敗')
      }
    }
    catch (err) {
      console.error('更新標題失敗:', err)
      toast.error('更新標題失敗')
    }
  }

  const selectRecord = (recordId: number) => {
    if (activeRecordId === recordId)
      return

    setActiveRecordId(recordId)
    setIsNewRecord(false)
  }

  const startNewConversation = () => {
    setActiveRecordId(null)
    setConversations([])
    setMessage('')
    setIsNewRecord(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value)
  }

  const insertRecord = async (Title: string) => {
    try {
      const Keyin = user?.userId
      const res = await fetch('/AI_City/api/vga/record/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Keyin, Title }),
      })
      const result = await res.json()
      return result.F_SeqNo
    }
    catch (err) {
      console.error('API 錯誤:', err)
    }
  }

  const getRecordDetail = async (MasterID: number) => {
    try {
      const Keyin = user?.userId
      const res = await fetch(`/AI_City/api/vga/recordDetail?Keyin=${Keyin}&MasterID=${MasterID}`, {
        method: 'GET',
      })
      const result = await res.json()
      return result
    }
    catch (err) {
      console.error('API 錯誤:', err)
    }
  }

  const loadRecordDetails = async (recordId: number) => {
    try {
      const details = await getRecordDetail(recordId)
      if (details && details.length > 0) {
        const loadedConversations = details.map((detail: RecordDetail) => ({
          question: detail.F_Question,
          answer: detail.F_Answer,
        }))

        setConversations(loadedConversations)
        if (loadedConversations.length > 0) {
          const lastAnswer = loadedConversations[loadedConversations.length - 1].answer
          setMessage(lastAnswer)
        }
      }
    }
    catch (err) {
      console.error('載入對話詳情失敗:', err)
      toast.error('載入對話詳情失敗')
    }
  }

  const insertRecordDetail = async (MasterID: string, Question: string, Answer: string) => {
    try {
      const Keyin = user?.userId
      const res = await fetch('/AI_City/api/vga/recordDetail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Keyin, MasterID, Question, Answer }),
      })
      const result = await res.json()
      return result.F_SeqNo
    }
    catch (err) {
      console.error('API 錯誤:', err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRecords()
    }
  }, [user])

  useEffect(() => {
    if (activeRecordId) {
      loadRecordDetails(activeRecordId)
    }
    else {
      setConversations([])
      setMessage('')
    }
  }, [activeRecordId])

  const handleSendMessage = async () => {
    const input = inputRef.current?.value

    if (!input?.trim()) {
      toast.error('請輸入訊息')
      return
    }

    const currentQuestion = input
    setCurrentUserQuestion(currentQuestion)
    inputRef.current!.value = ''
    setUserInput('')
    setIsLoading(true)
    setMessage('')

    // 如果是新對話，先創建記錄並設置 activeRecordId
    let currentRecordId = activeRecordId
    if (isNewRecord) {
      try {
        const SeqNo = await insertRecord(currentQuestion)
        if (SeqNo) {
          currentRecordId = SeqNo
          setActiveRecordId(SeqNo)
          setIsNewRecord(false)
        }
      }
      catch (err) {
        console.error('創建記錄失敗:', err)
        toast.error('創建記錄失敗')
        setIsLoading(false)
        setCurrentUserQuestion('')
        return
      }
    }

    try {
      const currentHost = window.location.hostname
      const apiHost = currentHost === 'rdraid5.msi.com.tw' ? 'km.msi.com.tw' : 'ai03.msi.com.tw'
      const apiUrl = `https://${apiHost}:7478/search_vga`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          F_UserID: user?.userId,
          F_ChatID: currentRecordId ? currentRecordId.toString() : '',
          F_Question: currentQuestion,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      // 流式讀取
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let output = ''

      while (!done) {
        if (reader) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          if (value) {
            const chunk = decoder.decode(value)
            chunk.split('\n').forEach(async (line) => {
              const cleaned = line.trim().replace(/^data:\s*/, '')
              if (!cleaned)
                return
              try {
                const json = JSON.parse(cleaned)
                if (json.output === '__END__') {
                  done = true

                  // 將新的對話添加到對話陣列中
                  const newConversation = { question: currentQuestion, answer: output }
                  setConversations(prev => [...prev, newConversation])

                  // 儲存對話詳情到資料庫
                  if (currentRecordId) {
                    await insertRecordDetail(currentRecordId.toString(), currentQuestion, output)
                  }

                  fetchRecords() // 完成後重新獲取記錄
                  return
                }
                if (json.output !== undefined) {
                  output += json.output
                  setMessage(prev => prev + json.output)
                }
              }
              catch {
                console.warn('無法解析的 JSON:', cleaned)
              }
            })
          }
        }
      }
    }
    catch (error) {
      console.error('錯誤:', error)
      toast.error('發生錯誤，請稍後重試')
    }
    finally {
      setCurrentUserQuestion('')
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[100vh]">
      <div className="flex-1 flex overflow-hidden h-screen">
        <LeftSidebar
          headerDescription="專業的顯示卡資訊查詢服務，為您提供準確的硬體規格與建議。"
          showNewButton={true}
          showNoteButton={false}
          onNewButtonClick={startNewConversation}
          onNoteButtonClick={() => {}}
          RecordsSectionLabel="對話"
          showRecordsSection={true}
          recordsSectionContent={
            records.length > 0 && (
              <>
                {records.map(record => (
                  <div
                    key={record.F_SeqNo}
                    className="group relative"
                  >
                    {isEditingTitle === record.F_SeqNo
                      ? (
                          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-900" onClick={e => e.stopPropagation()}>
                            <Input
                              value={newTitle}
                              onChange={e => setNewTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateTitle(record.F_SeqNo)
                                }
                                else if (e.key === 'Escape') {
                                  setIsEditingTitle(null)
                                }
                              }}
                              autoFocus
                              className="text-sm py-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => updateTitle(record.F_SeqNo)}
                              className="h-8 px-2"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      : (
                          <div className="relative">
                            <div
                              onClick={() => selectRecord(record.F_SeqNo)}
                              className={`${activeRecordId === record.F_SeqNo
                                ? 'bg-gray-100 dark:bg-gray-900'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-950'
                              } min-w-0 flex flex-col gap-1 p-2 rounded-md cursor-pointer transition-colors`}
                            >
                              <span className="truncate min-w-0">{record.F_Title}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(record.F_CreateDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className={`${activeRecordId !== record.F_SeqNo
                            && 'opacity-0 group-hover:opacity-100 transition-opacity'
                            } from-gray-100 dark:from-gray-900 bg-linear-to-l from-80% to-transparent absolute top-2 pl-4 right-2 flex gap-1`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-800"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditTitle(record.F_SeqNo, record.F_Title)
                                }}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast(
                                    '確定要刪除這條記錄嗎？',
                                    {
                                      action: {
                                        label: '確定',
                                        onClick: () => deleteRecord(record.F_SeqNo),
                                      },
                                      cancel: {
                                        label: '取消',
                                        onClick: () => {},
                                      },
                                      position: 'top-center',
                                      duration: 10000,
                                      style: {
                                        background: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                      },
                                    },
                                  )
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                  </div>
                ))}

                <Dialog
                  open={!!selectedHistoryItem}
                  onOpenChange={open => !open && setSelectedHistoryItem(null)}
                >
                  <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader className="sticky top-0 bg-white z-10">
                      <DialogTitle>翻譯詳情</DialogTitle>
                    </DialogHeader>

                    {selectedHistoryItem && (
                      <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            原文:
                          </h3>
                          <div className="bg-gray-50 p-3 rounded-md text-gray-800 whitespace-pre-wrap break-words">
                            {selectedHistoryItem.input}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            譯文:
                          </h3>
                          <div className="bg-gray-50 p-3 rounded-md text-gray-800 whitespace-pre-wrap break-words">
                            {selectedHistoryItem.output}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                selectedHistoryItem.output,
                              )
                              toast.success('已複製譯文')
                            }}
                          >
                            <CopyIcon className="h-4 w-4 mr-1" />
                            複製譯文
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setSelectedHistoryItem(null)}
                          >
                            關閉
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )
          }
        >
        </LeftSidebar>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Banner><>&nbsp;</></Banner>
          <div className={`flex flex-col flex-1 overflow-hidden pt-8
            ${!conversations.length && !currentUserQuestion ? 'justify-center' : ''}`}
          >
            <div
              className={`p-4 sm:p-6 overflow-hidden flex flex-col
              ${!conversations.length && !currentUserQuestion ? 'justify-center flex flex-col' : 'flex-1'}`}
            >
              {!conversations.length && !isLoading && !currentUserQuestion && (
                <DefaltInfo
                  title="顯示卡資訊查詢"
                >
                  在下方輸入您的問題，我將為您提供專業的顯示卡資訊查詢服務，包括規格比較、性能分析等。
                </DefaltInfo>
              )}

              <div
                className="max-w-6xl mx-auto w-full flex flex-col gap-2 overflow-y-auto flex-1"
              >
                {/* 顯示所有對話歷史 */}
                {conversations.map((conv, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col px-5 mt-4 mb-8 w-full max-w-5xl mx-auto rounded-lg group">
                      <div className="flex justify-end pb-1">
                        <div className="rounded-3xl max-w-[90%] px-5 py-2  bg-gray-50 dark:bg-gray-850 ">
                          {conv.question}
                        </div>
                      </div>
                    </div>
                    <div className="flex px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
                      <div className="shrink-0 ltr:mr-3 rtl:ml-3 @lg:flex mt-1  svelte-1u5gq5j">
                        <img className="size-8 assistant-message-profile-image object-cover rounded-full" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" />
                      </div>
                      <div className="flex-1 flex-col flex gap-2">
                        <div className="bg-gray-300 p-3 rounded-xl whitespace-pre-wrap break-words relative group" ref={answerRef}>
                          <ReactMarkdown
                            className="markdown prose max-w-none dark:prose-invert prose-sm"
                            remarkPlugins={[remarkGfm]}
                            skipHtml={false}
                            components={{
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4 border rounded-lg max-w-full" style={{ maxWidth: '100%' }}>
                                  <div className="max-w-screen-lg overflow-x-auto">
                                    <table className="border-collapse table-auto text-xs w-full" {...props} style={{ minWidth: '600px', fontSize: '12px', tableLayout: 'auto' }} />
                                  </div>
                                </div>
                              ),
                              th: ({ node, ...props }) => (
                                <th className="border border-gray-300 p-2 text-left font-bold text-xs whitespace-nowrap" {...props} style={{ minWidth: '80px', maxWidth: '150px', wordBreak: 'break-word' }} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="border border-gray-300 p-2 text-xs" {...props} style={{ minWidth: '60px', maxWidth: '200px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="mb-2 last:mb-0" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="mb-1" {...props} />
                              ),
                              h1: ({ node, ...props }) => (
                                <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0" {...props} />
                              ),
                              h4: ({ node, ...props }) => (
                                <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0" {...props} />
                              ),
                              strong: ({ node, ...props }) => (
                                <strong className="font-bold" {...props} />
                              ),
                              em: ({ node, ...props }) => (
                                <em className="italic" {...props} />
                              ),
                              code: ({ node, ...props }) => (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
                              ),
                            }}
                          >
                            {conv.answer}
                          </ReactMarkdown>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 bg-white/80 hover:bg-white"
                              onClick={async () => {
                                if (answerRef.current) {
                                  const html = answerRef.current.innerHTML

                                  try {
                                    await navigator.clipboard.write([
                                      new ClipboardItem({
                                        'text/html': new Blob([html], { type: 'text/html' }),
                                        'text/plain': new Blob([answerRef.current.textContent ?? ''], { type: 'text/plain' }),
                                      }),
                                    ])
                                    toast.success('已複製結果 (包含表格樣式)')
                                  }
                                  catch (err) {
                                    console.error('Copy failed', err)
                                    toast.error('複製失敗')
                                  }
                                }
                              }}

                            >
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}

                {/* 顯示當前用戶問題 - 只在處理中顯示 */}
                {currentUserQuestion && isLoading && (
                  <div className="flex flex-col px-5 mt-4 mb-8 w-full max-w-5xl mx-auto rounded-lg group">
                    <div className="flex justify-end pb-1">
                      <div className="rounded-3xl max-w-[90%] px-5 py-2  bg-gray-50 dark:bg-gray-850 ">
                        {currentUserQuestion}
                      </div>
                    </div>
                  </div>
                )}

                {/* 當前輸入的問題和正在生成的回答 */}
                {isLoading && message === '' && (
                  <div className="flex px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
                    <div className="shrink-0 ltr:mr-3 rtl:ml-3 @lg:flex mt-1  svelte-1u5gq5j">
                      <img className="size-8 assistant-message-profile-image object-cover rounded-full" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" />
                    </div>
                    <div className="bg-gray-300 p-2 rounded-full w-5 h-5 animate-bounce"></div>
                  </div>
                )}

                {message && isLoading && (
                  <div className="flex px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
                    <div className="shrink-0 ltr:mr-3 rtl:ml-3 @lg:flex mt-1  svelte-1u5gq5j">
                      <img className="size-8 assistant-message-profile-image object-cover rounded-full" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" />
                    </div>
                    <div className="flex-1 flex-col flex gap-3">
                      <div className="break-words relative group">
                        <ReactMarkdown
                          className="markdown prose max-w-none dark:prose-invert prose-sm"
                          remarkPlugins={[remarkGfm]}
                          skipHtml={false}
                          components={{
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-4 border rounded-lg max-w-full" style={{ maxWidth: '100%' }}>
                                <div className="max-w-screen-lg overflow-x-auto">
                                  <table className="border-collapse table-auto text-xs w-full" {...props} style={{ minWidth: '600px', fontSize: '12px', tableLayout: 'auto' }} />
                                </div>
                              </div>
                            ),
                            th: ({ node, ...props }) => (
                              <th className="border border-gray-300 bg-gray-100 p-2 text-left font-bold text-xs whitespace-nowrap" {...props} style={{ minWidth: '80px', maxWidth: '150px', wordBreak: 'break-word' }} />
                            ),
                            td: ({ node, ...props }) => (
                              <td className="border border-gray-300 p-2 text-xs" {...props} style={{ minWidth: '60px', maxWidth: '200px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-2 last:mb-0" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="mb-1" {...props} />
                            ),
                            h1: ({ node, ...props }) => (
                              <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0" {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                              <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong className="font-bold" {...props} />
                            ),
                            em: ({ node, ...props }) => (
                              <em className="italic" {...props} />
                            ),
                            code: ({ node, ...props }) => (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                            ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
                            ),
                          }}
                        >
                          {message}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 輸入區域 - 固定在底部 */}
            <div
              className={`mb-6 w-full flex-shrink-0 px-2.5 mx-auto inset-x-0
              ${!conversations.length && !isLoading && !currentUserQuestion ? 'max-w-3xl' : 'max-w-6xl'}`}
            >
              <div className="mx-auto flex flex-col gap-2">
                <div className="flex-1 flex flex-col relative w-full shadow-lg rounded-3xl border border-gray-50 dark:border-gray-850 hover:border-gray-100 focus-within:border-gray-100 hover:dark:border-gray-800 focus-within:dark:border-gray-800 transition px-1 bg-white/90 dark:bg-gray-400/5 dark:text-gray-100 px-3 py-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <InfoIcon className="h-3.5 w-3.5" />
                      <span>輸入您的顯示卡相關問題</span>
                    </div>
                    {/* {activeRecordId && (
                      <div className="text-sm text-gray-600">
                        當前對話: {records.find(r => r.F_SeqNo === activeRecordId)?.F_Title || '未命名對話'}
                      </div>
                    )} */}
                  </div>
                  <div className="flex gap-2 items-start">
                    <Textarea
                      id="input"
                      ref={inputRef}
                      onKeyDown={handleKeyDown}
                      onChange={handleInputChange}
                      rows={3}
                      value={userInput}
                      className="scrollbar-hidden rtl:text-right ltr:text-left bg-transparent dark:text-gray-100 outline-hidden w-full pt-2.5 pb-[5px] px-1 resize-none h-fit max-h-80 overflow-auto border-0 focus:ring-0 focus:outline-none shadow-none bg-transparent focus-visible:ring-0 shadow-none"
                      placeholder="今天我能為您做些什麼？"
                    />

                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading && userInput !== ''}
                      size="icon"
                      className="h-10 w-10 rounded-full mt-1"
                    >
                      {isLoading
                        ? (
                            <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
                          )
                        : (
                            <SendHorizontalIcon className="h-5 w-5" />
                          )}
                    </Button>
                  </div>
                  {/* <div className="text-xs text-gray-400 text-right">
                    按 Enter 發送, Shift+Enter 換行
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
