'use client'

import { Button } from '@msi/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@msi/ui/components/dropdown-menu'
import {
  SidebarInset,
  SidebarProvider,
} from '@msi/ui/components/sidebar'
import { Textarea } from '@msi/ui/components/textarea'
import {
  ChevronDown,
  CopyIcon,
  GlobeIcon,
  Pin,
  SendHorizontalIcon,
  Star,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
// 注意：移除了 Banner 元件的引入，改為直接在 Header 實作，以避免樣式衝突
// import Banner from '@/components/banner-b'
import DefaltInfo from '@/components/chat-robot/defalt-info'
import { useAuth } from '@/hooks/use-auth'
import AppSidebar from './_components/AppSidebar'
import ParameterSettings from './_components/ParameterSettings'
import NoteComponent from './Note'

// ... (保留原本的 Interface 定義，無須變動) ...
interface RecordItem {
  chatId: number
  title: string
}

interface RecordDetail {
  question: string
  answer: string
  isGood: boolean | null
  comment: string | null
  recordDetailId: number
  isWeb: boolean
}

interface Model {
  id: number
  name: string
  modelId: string
  provider: string | null
  description: string | null
  modelType: string
  state: string
  isDefault: string
  aliases: string
  recommend: string
}

interface ReferenceItem {
  web_path: string | null
  web_title: string | null
  method: string
  qa_text: string
  scores: number
  is_web: boolean
}

const HomePage = () => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = React.useRef<HTMLDivElement>(null)

  const [conversations, setConversations] = useState<Array<{
    question: string
    answer: string
    comment: string | null
    recordDetailId: number
    isGood: boolean | null
    isWeb: boolean
  }>>([])
  const [userInput, setUserInput] = React.useState<string>('')
  const [message, setMessage] = React.useState<string>('')
  const [isLoadingRecord, setIsLoadingRecord] = React.useState<boolean>(true)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isShowingNote, setIsShowingNote] = useState(false)
  const [records, setRecords] = useState<RecordItem[]>([])
  const [firstRecordId, setFirstRecordId] = useState<number | null>(null)
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null)
  const [currentUserQuestion, setCurrentUserQuestion] = React.useState<string>('')
  const { user } = useAuth()
  const [models, setModels] = useState<Model[]>([])
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null)
  const [creativity, setCreativity] = React.useState(0.1)
  const [valueDegree, setValueDegree] = React.useState(1)
  const [promptInput, setPromptInput] = React.useState<string>('')
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false)
  const [feedbackStates, setFeedbackStates] = useState<{ [key: number]: { isGoodEnabled: boolean, feedBackEnabled: boolean } }>({})
  const [activeFeedback, setActiveFeedback] = useState<{ [key: number]: string }>({})
  const [newfeedBack, setNewfeedBack] = useState<{ [key: number]: boolean }>({})
  const [isGood, setIsGood] = useState<{ [key: number]: boolean }>({})
  const [unGood, setUnGood] = useState<{ [key: number]: boolean }>({})
  const [noteEnabled, setNoteEnabled] = useState<{ [key: number]: boolean }>({})

  // ... (保留原本的 useEffect 與 fetch 邏輯) ...
  useEffect(() => {
    const scrollableDiv = chatContainerRef.current
    if (scrollableDiv) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight
    }
  }, [conversations, currentUserQuestion, message])

  const fetchRecords = async () => {
    setIsLoadingRecord(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/history?userId=${user?.userId}`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        setRecords(data)
      }
    }
    catch (err) {
      console.error('獲取紀錄失敗:', err)
      toast.error('獲取紀錄失敗')
    }
    finally {
      setIsLoadingRecord(false)
    }
  }

  const fetchParameters = async (recordDetailId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/parameters?userId=${user?.userId}&chatId=${recordDetailId}`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        const formattedParameters = [{
          temperature: data.temperature,
          threshold: data.threshold,
          userPrompt: data.userPrompt,
          model: data.model,
        }]
        setCreativity(formattedParameters[0]?.temperature || 0.1)
        setValueDegree(formattedParameters[0]?.threshold || 1)
        setPromptInput(formattedParameters[0]?.userPrompt || '')
        setSelectedModelId(models.find(model => model.modelId === formattedParameters[0]?.model)?.id || null)
      }
    }
    catch (err) {
      console.error('使用者最後使用的參數設定--獲取失敗:', err)
    }
  }

  const selectRecord = (recordId: number | null) => {
    if (activeRecordId === recordId)
      return
    setActiveRecordId(recordId)
  }

  const startNewConversation = async () => {
    setActiveRecordId(null)
    setConversations([])
    setMessage('')
    setCreativity(0.1)
    setValueDegree(1)
    setPromptInput('')
    setSelectedModelId(models.find(model => model.isDefault === '1')?.id || null)
    setIsShowingNote(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value)
  }

  const getRecordDetail = async (seqNo: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/history/${seqNo}`, {
        method: 'GET',
      })
      return await res.json()
    }
    catch (err) {
      console.error('API 錯誤:', err)
    }
  }

  const loadRecordDetails = async (recordId: number) => {
    try {
      const details = await getRecordDetail(recordId)
      if (details && details.qaPairs && details.qaPairs.length > 0) {
        const loadedConversations = details.qaPairs.map((detail: RecordDetail) => ({
          question: detail.question,
          answer: detail.answer,
          isGood: detail.isGood,
          comment: detail.comment,
          recordDetailId: detail.recordDetailId,
          isWeb: detail.isWeb,
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

  const insertRecordDetail = async (MasterID: string | null, Question: string, Answer: string, creativity: number, valueDegree: number, promptInput: string, model: string) => {
    try {
      const Keyin = user?.userId
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Keyin,
          question: Question,
          title: Question,
          answer: Answer,
          chatId: MasterID,
          temperature: creativity,
          threshold: valueDegree,
          userPrompt: promptInput,
          model: model || 'Qwen/Qwen2.5-VL-72B-Instruct-AWQ',
          isWeb: isWebSearchEnabled,
        }),
      })
      const result = await res.json()
      const recordDetailId = result.recordDetailId
      const fSeqNo = result.record.fSeqNo
      return { recordDetailId, fSeqNo }
    }
    catch (err) {
      console.error('API 錯誤:', err)
    }
  }

  // ... (保留 extractProductNamesFromText, fetchSpecForProductId, insertReference 函數) ...
  const extractProductNamesFromText = (qaText: string): string[] => {
    if (!qaText)
      return []
    const productNames: string[] = []
    const regex = /data-product="([^"]*)"/g
    const matches = qaText.matchAll(regex)
    for (const match of matches) {
      const productName = match[1]
      if (productName && !productNames.includes(productName)) {
        productNames.push(productName)
      }
    }
    return productNames
  }

  const fetchSpecForProductId = async (mktName: string, language: string = 'en'): Promise<number | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/reference/${mktName}/specifications?language=${language}`,
        { method: 'GET' },
      )
      if (res.ok) {
        const data = await res.json()
        return data.data.productInfo?.productId || null
      }
      return null
    }
    catch {
      return null
    }
  }

  const insertReference = async (
    recordDetailId: number,
    referenceDataItems: ReferenceItem[],
  ) => {
    try {
      const Keyin = user?.userId
      const enrichedReferenceItems = await Promise.all(
        referenceDataItems.map(async (item) => {
          const productNames = extractProductNamesFromText(item.qa_text || '')
          let productIds: number[] = []
          if (productNames.length > 0) {
            const productIdPromises = productNames.map(name => fetchSpecForProductId(name))
            const results = await Promise.all(productIdPromises)
            productIds = results.filter((id): id is number => id !== null)
          }
          return {
            webPath: item.web_path || '',
            webTitle: item.web_title || '',
            qaText: item.qa_text || '',
            scores: item.scores,
            method: item.method,
            isWeb: item.is_web,
            productIds,
          }
        }),
      )

      await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/reference-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordDetailId,
          referenceDataItems: enrichedReferenceItems,
          userId: Keyin,
        }),
      })
    }
    catch (err) {
      console.error('儲存參考資料失敗:', err)
    }
  }

  useEffect(() => {
    if (user) {
      setIsLoadingRecord(true)
      fetchRecords()
    }
  }, [user])

  useEffect(() => {
    if (activeRecordId) {
      loadRecordDetails(activeRecordId)
      fetchParameters(activeRecordId)
      setIsShowingNote(false)
    }
    else {
      setConversations([])
      setMessage('')
    }
  }, [activeRecordId])

  const handleReferencesClick = (recordDetailId: number) => {
    const url = `ProductSpec/References/${recordDetailId}`
    window.open(url, '_blank')
  }

  useEffect(() => {
    const apiUrl = `${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/models`
    fetch(apiUrl, { method: 'GET' })
      .then(response => response.json())
      .then((data: Model[]) => {
        setModels(data)
        setCreativity(0.1)
        setValueDegree(1)
        setPromptInput('')
        const defaultModel = data.find(model => model.isDefault === '1')
        if (defaultModel) {
          setSelectedModelId(defaultModel.id)
        }
        else if (data.length > 0) {
          setSelectedModelId(data[0].id)
        }
      })
      .catch(error => console.error('Error fetching models:', error))
  }, [])

  const selectedModel = models.find(model => model.id === selectedModelId)

  // ... (保留 handleSendMessage 邏輯) ...
  const handleSendMessage = async () => {
    const input = inputRef.current?.value
    const selectedModel = models.find(model => model.id === selectedModelId)

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

    let currentRecordId = activeRecordId

    if (!currentRecordId) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/chat/new`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.userId,
            title: currentQuestion,
            firstQuestion: currentQuestion,
          }),
        })

        if (res.ok) {
          const response = await res.json()
          const data = response.data || response

          if ((data.success || response.status === 'success') && data.chatId) {
            currentRecordId = data.chatId
            setActiveRecordId(data.chatId)
            setFirstRecordId(data.chatId)
            fetchRecords()
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          else {
            throw new Error(data.message || response.message || '創建新聊天會話失敗')
          }
        }
        else {
          throw new Error('創建新聊天會話失敗')
        }
      }
      catch (error) {
        console.error('創建新聊天會話錯誤:', error)
        toast.error('創建新聊天會話失敗')
        setIsLoading(false)
        setCurrentUserQuestion('')
        return
      }
    }

    let referenceData: ReferenceItem[] | null = null
    let output = ''
    let shouldSave = false

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_AI_API_URL}/spec`

      if (!process.env.NEXT_PUBLIC_AI_API_URL) {
        throw new Error('API URL is not configured')
      }

      const requestBody = {
        user_id: user?.userId,
        chat_id: currentRecordId ? currentRecordId.toString() : '',
        query: currentQuestion,
        temperature: creativity,
        threshold: valueDegree,
        user_prompt: promptInput,
        search_web: isWebSearchEnabled,
        model: selectedModel ? selectedModel.modelId : 'Qwen/Qwen2.5-VL-72B-Instruct-AWQ',
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let buffer = ''

      while (!done) {
        if (reader) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          buffer += decoder.decode(value || new Uint8Array(), { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const cleaned = line.trim().replace(/^data:\s*/, '')
            if (!cleaned)
              continue
            try {
              const json = JSON.parse(cleaned)
              if (json.data && Array.isArray(json.data)) {
                referenceData = json.data as ReferenceItem[]
                continue
              }
              if (json.output === '__END__') {
                shouldSave = true
                continue
              }
              if (json.output !== undefined) {
                output += json.output
                setMessage(prev => prev + json.output)
              }
            }
            catch (parseError) {
              console.warn('無法解析的 JSON:', cleaned, parseError)
            }
          }
        }
      }

      if (buffer.length > 0) {
        const cleaned = buffer.trim().replace(/^data:\s*/, '')
        if (cleaned) {
          try {
            const json = JSON.parse(cleaned)
            if (json.data && Array.isArray(json.data)) {
              referenceData = json.data as ReferenceItem[]
            }
            else if (json.output === '__END__') {
              shouldSave = true
            }
            else if (json.output !== undefined) {
              output += json.output
              setMessage(prev => prev + json.output)
            }
          }
          catch (e) {
            console.warn('無法解析的 JSON (結尾):', cleaned, e)
          }
        }
      }

      if (shouldSave) {
        let finalRecordDetailId: number | null = null
        try {
          const result = await insertRecordDetail(
            currentRecordId ? currentRecordId.toString() : null,
            currentQuestion,
            output,
            creativity,
            valueDegree,
            promptInput,
            selectedModel ? selectedModel.modelId : 'Qwen/Qwen2.5-VL-72B-Instruct-AWQ',
          )

          if (result) {
            const { recordDetailId, fSeqNo } = result
            finalRecordDetailId = recordDetailId
            setNoteEnabled(prev => ({ ...prev, [recordDetailId]: true }))
            setIsGood(prev => ({ ...prev, [recordDetailId]: true }))
            setUnGood(prev => ({ ...prev, [recordDetailId]: true }))
            if (!firstRecordId && fSeqNo)
              setFirstRecordId(fSeqNo)
            if (recordDetailId) {
              const newConversation = {
                question: currentQuestion,
                answer: output,
                recordDetailId,
                isGood: null,
                comment: null,
                isWeb: isWebSearchEnabled,
              }
              setConversations(prev => [...prev, newConversation])
              fetchRecords()
            }
          }
        }
        catch (insertError) {
          console.error('保存對話失敗:', insertError)
          toast.error('保存對話失敗')
        }

        if (finalRecordDetailId && referenceData && referenceData.length > 0) {
          try {
            await insertReference(finalRecordDetailId, referenceData)
          }
          catch (refError) {
            console.error('保存參考資料失敗:', refError)
          }
        }
      }
    }
    catch (error) {
      console.error('API 調用錯誤:', error)
      toast.error('發生錯誤，請稍後重試')
    }
    finally {
      setCurrentUserQuestion('')
      setIsLoading(false)
      setIsWebSearchEnabled(false)
    }
  }

  // ... (保留 Feedback 和 Note 相關邏輯) ...
  const toggleFeedBackEnabled = (recordDetailId: number) => {
    setFeedbackStates(prev => ({
      ...prev,
      [recordDetailId]: {
        isGoodEnabled: false,
        feedBackEnabled: !prev[recordDetailId]?.feedBackEnabled,
      },
    }))
  }

  const handleInsertNote = async (recordDetailId: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordDetailId,
          userId: user?.userId,
        }),
      })
    }
    catch (err) {
      console.error('儲存記事API：', err)
    }
    finally {
      setNoteEnabled(prev => ({ ...prev, [recordDetailId]: false }))
    }
  }

  const handleSendFeedback = async (recordDetailId: number, isGood: boolean | null, feedback: string | null = null) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordDetailId,
          isGood,
          comment: feedback,
          userId: user?.userId,
        }),
      })
      const updatedConversations = conversations.map((conv) => {
        if (conv.recordDetailId === recordDetailId) {
          return { ...conv, isGood, feedback }
        }
        return conv
      })
      setActiveFeedback(prev => ({ ...prev, [recordDetailId]: `${feedback}` }))
      setConversations(updatedConversations)
    }
    catch (err) {
      console.error('POST 反饋API錯誤:', err)
    }
  }

  const toggleIsGoodEnabled = (recordDetailId: number) => {
    setFeedbackStates((prev) => {
      const current = prev[recordDetailId] || { isGoodEnabled: false, feedBackEnabled: false }
      const newIsGoodEnabled = !current.isGoodEnabled
      if (newIsGoodEnabled)
        handleSendFeedback(recordDetailId, true)
      else handleSendFeedback(recordDetailId, null)
      return {
        ...prev,
        [recordDetailId]: {
          isGoodEnabled: newIsGoodEnabled,
          feedBackEnabled: false,
        },
      }
    })
  }

  const handleSubmitFeedback = (recordDetailId: number, feedback: string) => {
    handleSendFeedback(recordDetailId, false, feedback)
    setFeedbackStates(prev => ({
      ...prev,
      [recordDetailId]: { isGoodEnabled: false, feedBackEnabled: false },
    }))
    setIsGood(prev => ({ ...prev, [recordDetailId]: false }))
    setUnGood(prev => ({ ...prev, [recordDetailId]: false }))
    setNewfeedBack(prev => ({ ...prev, [recordDetailId]: true }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // ... (保留 renderInputArea) ...
  const renderInputArea = (className: string) => (
    <div className={`w-full flex-shrink-0 px-2.5 mx-auto ${className}`}>
      <div className="mx-auto flex flex-col gap-2">
        <div className="flex-1 flex flex-col relative w-full shadow-lg rounded-3xl border border-gray-200 hover:border-gray-300 transition px-1 bg-white dark:bg-gray-800 px-3 py-2">
          <Textarea
            id="input"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            rows={3}
            value={userInput}
            className="scrollbar-hidden rtl:text-right ltr:text-left bg-transparent outline-none w-full pt-2.5 pb-[5px] px-1 resize-none h-fit max-h-80 overflow-auto border-0 focus:ring-0 shadow-none focus-visible:ring-0"
            placeholder="今天我能為您做些什麼？"
          />
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-end gap-2">
              <Button
                onClick={() => setIsWebSearchEnabled(prev => !prev)}
                variant="ghost"
                className={`flex items-center gap-2 cursor-pointer font-bold h-8 text-xs ${isWebSearchEnabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}
                style={{ borderRadius: '25px' }}
              >
                <GlobeIcon className="size-4" />
                網頁搜尋
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSendMessage}
                disabled={isLoading && userInput !== ''}
                size="icon"
                className="h-8 w-8 rounded-full cursor-pointer bg-black text-white hover:bg-gray-800"
              >
                {isLoading ? <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div> : <SendHorizontalIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    // 使用標準 SidebarProvider 佈局系統
    <SidebarProvider defaultOpen={true} className="h-screen w-full" style={{ '--sidebar-width': '16rem' } as React.CSSProperties}>
      {/* 左側 Sidebar - 使用標準 Sidebar 元件 */}
      <AppSidebar
        activeRecordId={activeRecordId}
        onSelectRecord={selectRecord}
        onStartNewConversation={startNewConversation}
        userId={user?.userId}
        isLoadingRecord={isLoadingRecord}
        records={records}
        setIsShowingNote={setIsShowingNote}
        onRecordsChange={fetchRecords}
      />

      {/* 中間主內容區 - 使用標準 SidebarInset，自動處理寬度縮放 */}
      <SidebarInset className="flex flex-col overflow-hidden md:ml-[calc(var(--sidebar-width)+1rem)] md:peer-data-[state=collapsed]:ml-[calc(var(--sidebar-width-icon)+1rem+0.5rem)]">
        {/* 頂部固定欄位：智能指令選擇器 */}
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-2 bg-background px-4">
          {/* 智能指令區塊 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-left hover:bg-gray-100 h-8 px-2 text-sm font-normal">
                {selectedModel ? `(${selectedModel.modelType === '1' ? 'Global' : '雲端'}) ${selectedModel.aliases}` : '選擇模型'}
                <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {models.map(model => (
                <DropdownMenuItem key={model.id} onSelect={() => setSelectedModelId(model.id)}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.aliases}</span>
                    <span className="text-xs text-gray-400">{model.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {isShowingNote
          ? (
              <NoteComponent userId={user?.userId ? Number(user.userId) : undefined} />
            )
          : (
              // 對話內容區域
              <div className="flex flex-col flex-1 overflow-hidden relative">
                <div
                  ref={chatContainerRef}
                  className={`flex-1 overflow-y-auto p-4 sm:p-6 w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${!conversations.length && !currentUserQuestion ? 'flex flex-col items-center justify-center' : ''}`}
                >
                  {!conversations.length && !isLoading && !currentUserQuestion
                    ? (
                        <div className="flex flex-col items-center justify-center w-full max-w-3xl gap-8 mt-[-10vh]">
                          <DefaltInfo title="競品資訊查詢與分析">
                            請在下方輸入您的問題，我將為您提供專業的產品規格資訊查詢服務。
                          </DefaltInfo>
                          {renderInputArea('max-w-3xl')}
                        </div>
                      )
                    : (
                        <div className="max-w-4xl mx-auto w-full flex flex-col gap-4 pb-4">
                          {conversations.map((conv, index) => (
                            <React.Fragment key={index}>
                              <div className="flex justify-end w-full">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-3 max-w-[85%] text-gray-800 dark:text-gray-100">
                                  {conv.question}
                                </div>
                              </div>
                              <div className="flex gap-4 w-full">
                                <div className="shrink-0 mt-1">
                                  <img className="size-8 rounded-full object-cover border border-gray-200" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" alt="AI" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                      {conv.answer}
                                    </ReactMarkdown>
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs text-gray-500"
                                      onClick={() => {
                                        navigator.clipboard.writeText(conv.answer)
                                        toast.success('已複製')
                                      }}
                                    >
                                      <CopyIcon className="h-3 w-3 mr-1" />
                                      複製
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={() => handleReferencesClick(conv.recordDetailId)}>
                                      <Star className="h-3 w-3 mr-1" />
                                      參考資料
                                    </Button>
                                    {noteEnabled[conv.recordDetailId] && (
                                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={() => handleInsertNote(conv.recordDetailId)}>
                                        <Pin className="h-3 w-3 mr-1" />
                                        記事
                                      </Button>
                                    )}
                                    {isGood[conv.recordDetailId] && (
                                      <Button variant="ghost" size="sm" className={`h-6 px-2 text-xs ${feedbackStates[conv.recordDetailId]?.isGoodEnabled ? 'text-blue-600' : 'text-gray-500'}`} onClick={() => toggleIsGoodEnabled(conv.recordDetailId)}>
                                        <ThumbsUp className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {unGood[conv.recordDetailId] && (
                                      <Button variant="ghost" size="sm" className={`h-6 px-2 text-xs ${feedbackStates[conv.recordDetailId]?.feedBackEnabled ? 'text-red-600' : 'text-gray-500'}`} onClick={() => toggleFeedBackEnabled(conv.recordDetailId)}>
                                        <ThumbsDown className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                  {feedbackStates[conv.recordDetailId]?.feedBackEnabled && (
                                    <div className="mt-2 flex gap-2">
                                      <Textarea placeholder="請提供您的反饋..." className="flex-1 min-h-[60px] text-sm" value={activeFeedback[conv.recordDetailId] || ''} onChange={e => setActiveFeedback(prev => ({ ...prev, [conv.recordDetailId]: e.target.value }))} />
                                      <Button size="sm" onClick={() => handleSubmitFeedback(conv.recordDetailId, activeFeedback[conv.recordDetailId] || '')}>送出</Button>
                                    </div>
                                  )}
                                  {newfeedBack[conv.recordDetailId] && (<div className="text-xs text-gray-500 mt-1">感謝您的反饋！</div>)}
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                          {currentUserQuestion && isLoading && (
                            <div className="flex justify-end w-full">
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-3 max-w-[85%]">{currentUserQuestion}</div>
                            </div>
                          )}
                          {isLoading && message === '' && (
                            <div className="flex gap-4 w-full">
                              <div className="shrink-0 mt-1"><img className="size-8 rounded-full border border-gray-200" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" alt="AI" /></div>
                              <div className="bg-gray-200 p-2 rounded-full w-2 h-2 animate-bounce"></div>
                            </div>
                          )}
                          {message && isLoading && (
                            <div className="flex gap-4 w-full">
                              <div className="shrink-0 mt-1"><img className="size-8 rounded-full border border-gray-200" src="https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/dragon.png" alt="AI" /></div>
                              <div className="flex-1 min-w-0 prose prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{message}</ReactMarkdown></div>
                            </div>
                          )}
                          <div className="h-4 w-full"></div>
                        </div>
                      )}
                </div>

                {(conversations.length > 0 || isLoading || currentUserQuestion) && (
                  <div className="w-full bg-white dark:bg-gray-950 p-4 z-10">
                    {renderInputArea('max-w-4xl')}
                  </div>
                )}
              </div>
            )}
      </SidebarInset>

      {/* 右側參數設定 */}
      <ParameterSettings
        creativity={creativity}
        valueDegree={valueDegree}
        promptInput={promptInput}
        onCreativityChange={setCreativity}
        onValueDegreeChange={setValueDegree}
        onPromptInputChange={setPromptInput}
      />
    </SidebarProvider>
  )
}

export default HomePage
