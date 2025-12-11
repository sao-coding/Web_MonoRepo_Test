'use client'

import { Button } from '@msi/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@msi/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@msi/ui/components/dropdown-menu'
import { Loading } from '@msi/ui/components/loading'
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
import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import Banner from '@/components/banner-b'
import DefaltInfo from '@/components/chat-robot/defalt-info'
import { useAuth } from '@/hooks/use-auth'
import ChatSidebar from './_components/ChatSidebar'
import ParameterSettings from './_components/ParameterSettings'
import NoteComponent from './Note'

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

interface RefItem {
  id: number
  webPath: string
  webTitle: string
  qaText: string
  scores: number
  method: string
  isWeb: boolean
  language: string
  createDate: string
  used: boolean
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
  const [isRefLoading, setIsRefLoading] = React.useState<boolean>(true)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const answerRef = useRef<HTMLDivElement>(null)
  const [isShowingNote, setIsShowingNote] = useState(false)
  const [records, setRecords] = useState<RecordItem[]>([])
  const [firstRecordId, setFirstRecordId] = useState<number | null>(null)
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null)
  const [ref, setRef] = useState<RefItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUserQuestion, setCurrentUserQuestion] = React.useState<string>('')
  const { user } = useAuth()
  const [models, setModels] = useState<Model[]>([])
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null)
  const [creativity, setCreativity] = React.useState(0.1)
  const [valueDegree, setValueDegree] = React.useState(1)
  const [promptInput, setPromptInput] = React.useState<string>('')
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false)
  const [mostRecentDetailId, setMostRecentDetailId] = useState<number[]>([] as number[])
  const [feedbackStates, setFeedbackStates] = useState<{ [key: number]: { isGoodEnabled: boolean, feedBackEnabled: boolean } }>({})
  const [feedback, setFeedback] = React.useState<string>('')
  const [activeFeedback, setActiveFeedback] = useState<{ [key: number]: string }>({})
  const [newfeedBack, setNewfeedBack] = useState<{ [key: number]: boolean }>({})
  const [isGood, setIsGood] = useState<{ [key: number]: boolean }>({})
  const [unGood, setUnGood] = useState<{ [key: number]: boolean }>({})
  const [noteEnabled, setNoteEnabled] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    // 修正滾動邏輯，指向正確的滾動容器
    const scrollableDiv = chatContainerRef.current?.querySelector('.overflow-y-auto')
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
    // 重置其他狀態
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
    setMostRecentDetailId([])
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/history/${seqNo}`, {
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
          userId: Keyin, // 使用者工號
          question: Question, // 使用者問題
          title: Question, // 對話標題，若無則預設為問題
          answer: Answer, // AI的回覆
          chatId: MasterID, // 對應的記錄ID
          temperature: creativity, // AI溫度參數
          threshold: valueDegree, // AI 閾值參數
          userPrompt: promptInput, // 使用者提示詞
          model: model || 'Qwen/Qwen2.5-VL-72B-Instruct-AWQ', // 使用的AI模型
          isWeb: isWebSearchEnabled, // 是否有使用網頁搜尋
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

  // 新增函數來提取單筆資料中的產品名稱
  const extractProductNamesFromText = (qaText: string): string[] => {
    if (!qaText)
      return []
    console.warn('[重複 bug] extractProductNamesFromText qaText:', qaText)
    const productNames: string[] = []
    // 使用正則表達式提取所有 data-product 屬性的值
    const regex = /data-product="([^"]*)"/g
    const matches = qaText.matchAll(regex)
    console.warn('[重複 bug] extractProductNamesFromText matches:', matches)
    for (const match of matches) {
      const productName = match[1]
      if (productName && !productNames.includes(productName)) {
        productNames.push(productName)
      }
    }

    return productNames
  }

  // 新增函數來獲取產品規格和 productId
  const fetchSpecForProductId = async (mktName: string, language: string = 'en'): Promise<number | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/reference/${mktName}/specifications?language=${language}`,
        {
          method: 'GET',
        },
      )
      if (res.ok) {
        const data = await res.json()
        return data.data.productInfo?.productId || null
      }
      else {
        console.error(`Failed to fetch productId for ${mktName}. Status: ${res.status}`)
        return null
      }
    }
    catch (err) {
      console.error(`Error fetching productId for ${mktName}:`, err)
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
          // 1. 提取所有產品名稱
          const productNames = extractProductNamesFromText(item.qa_text || '')
          // 2. 如果有產品名稱，獲取所有 productId
          let productIds: number[] = []
          if (productNames.length > 0) {
            // 並行獲取所有產品的 productId
            const productIdPromises = productNames.map(name => fetchSpecForProductId(name))
            const results = await Promise.all(productIdPromises)
            // 過濾掉 null 值，只保留有效的 productId
            productIds = results.filter((id): id is number => id !== null)
          }

          // 3. 返回包含 productId 陣列的項目
          return {
            webPath: item.web_path || '',
            webTitle: item.web_title || '',
            qaText: item.qa_text || '',
            scores: item.scores,
            method: item.method,
            isWeb: item.is_web,
            productIds, // 為每一筆資料添加 productId 陣列
          }
        }),
      )

      await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/reference-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordDetailId, // 對話紀錄ID
          referenceDataItems: enrichedReferenceItems,
          userId: Keyin, // 使用者工號
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
    fetch(apiUrl, {
      method: 'GET',
    })
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

    // 檢查是否需要先創建新的聊天會話
    let currentRecordId = activeRecordId

    if (!currentRecordId) {
      try {
        // 如果沒有 activeRecordId，先創建新的聊天會話
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

          // 處理 API 回應結構
          const data = response.data || response

          if ((data.success || response.status === 'success') && data.chatId) {
            currentRecordId = data.chatId
            setActiveRecordId(data.chatId)
            setFirstRecordId(data.chatId)
            // 重新獲取記錄列表
            fetchRecords()
            // 等待一下確保狀態更新
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

    // 用於保存從流式響應中獲取的數據
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
        temperature: creativity, // 創意性
        threshold: valueDegree, // 敏銳度
        user_prompt: promptInput, // 引導詞
        search_web: isWebSearchEnabled, // 是否搜尋網路資料
        model: selectedModel ? selectedModel.modelId : 'Qwen/Qwen2.5-VL-72B-Instruct-AWQ', // 使用的AI模型
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      // 流式讀取
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
            if (!cleaned) {
              continue
            }

            try {
              const json = JSON.parse(cleaned)

              // 接收參考資料
              if (json.data && Array.isArray(json.data)) {
                referenceData = json.data as ReferenceItem[]
                continue
              }

              // 結束標記
              if (json.output === '__END__') {
                shouldSave = true
                continue
              }

              // 處理輸出文本
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

      // 處理緩衝區中的任何殘留數據
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

      // 流式處理完全結束後，執行保存邏輯
      console.warn('流式處理完成，開始保存')
      if (shouldSave) {
        let finalRecordDetailId: number | null = null

        // 1. 儲存對話詳情
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

            // 更新 UI 狀態
            setMostRecentDetailId(prev => [...prev, recordDetailId])
            setNoteEnabled(prev => ({ ...prev, [recordDetailId]: true }))
            setIsGood(prev => ({ ...prev, [recordDetailId]: true }))
            setUnGood(prev => ({ ...prev, [recordDetailId]: true }))

            if (!firstRecordId && fSeqNo) {
              setFirstRecordId(fSeqNo)
            }

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

        // 2. 儲存參考資料
        if (finalRecordDetailId && referenceData && referenceData.length > 0) {
          try {
            await insertReference(finalRecordDetailId, referenceData)
            console.warn('參考資料保存成功')
          }
          catch (refError) {
            console.error('保存參考資料失敗:', refError)
            toast.error('保存參考資料失敗')
          }
        }
        else {
          if (!referenceData) {
            console.warn('沒有 referenceData - API 可能沒有返回參考資料')
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
          recordDetailId, // 對話紀錄ID
          isGood, // 讚/倒讚
          comment: feedback, // 反饋內容
          userId: user?.userId, // 使用者工號
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
    console.warn('點擊讚，recordDetailId:', recordDetailId)
    setFeedbackStates((prev) => {
      const current = prev[recordDetailId] || { isGoodEnabled: false, feedBackEnabled: false }
      const newIsGoodEnabled = !current.isGoodEnabled
      if (newIsGoodEnabled) {
        handleSendFeedback(recordDetailId, true)
      }
      else {
        handleSendFeedback(recordDetailId, null)
      }
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
      [recordDetailId]: {
        isGoodEnabled: false,
        feedBackEnabled: false,
      },
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

  const fetchReferences = async (recordDetailId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/reference-data/${recordDetailId}`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        const dataRef = data.data.referenceData
        setRef(dataRef)
      }
      else {
        toast.error('Failed to fetch Reference.')
        console.error(`Failed to fetch references. Status: ${res.status}`)
      }
    }
    catch (err) {
      toast.error('An error occurred while fetching Reference.')
      console.error('參考資料--獲取失敗:', err)
    }
    finally {
      setIsRefLoading(false)
    }
  }

  const renderInputArea = (className: string) => (
    <div
      className={`w-full flex-shrink-0 px-2.5 mx-auto ${className}`}
    >
      <div className="mx-auto flex flex-col gap-2">
        <div className="flex-1 flex flex-col relative w-full shadow-lg rounded-3xl border border-gray-50 dark:border-gray-850 hover:border-gray-100 focus-within:border-gray-100 hover:dark:border-gray-800 focus-within:dark:border-gray-800 transition px-1 bg-white/90 dark:bg-gray-400/5 dark:text-gray-100 px-3 py-2">
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
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-end gap-2">
              <Button
                onClick={() => setIsWebSearchEnabled(prev => !prev)}
                variant="ghost"
                className={`flex items-center gap-2 cursor-pointer font-bold ${isWebSearchEnabled
                  ? 'bg-[#F0F9FF] text-blue-600'
                  : 'bg-white text-gray-500'
                }`}
                style={{ borderRadius: '25px' }}
              >
                <GlobeIcon />
                網頁搜尋
              </Button>
              {isWebSearchEnabled && (
                <span className="text-xs text-red-500">*使用DeepSearch搜尋</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSendMessage}
                disabled={isLoading && userInput !== ''}
                size="icon"
                className="h-10 w-10 rounded-full mt-1 cursor-pointer"
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
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-[100vh]">
      <div className="flex-1 flex overflow-hidden h-screen">

        <ChatSidebar
          activeRecordId={activeRecordId}
          onSelectRecord={selectRecord}
          onStartNewConversation={startNewConversation}
          userId={user?.userId}
          isLoadingRecord={isLoadingRecord}
          records={records}
          setIsShowingNote={setIsShowingNote}
          onRecordsChange={fetchRecords}
        />

        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <Banner>
            {isShowingNote
              ? '筆記'
              : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-left hover:bg-none has-[>svg]:px-2">
                        {selectedModel ? `(${selectedModel.modelType === '1' ? 'Global' : '雲端'}) ${selectedModel.aliases}` : ''}
                        <ChevronDown color="#999" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start" sideOffset={5}>
                      {models.map(model => (
                        <DropdownMenuItem key={model.id} onSelect={() => setSelectedModelId(model.id)} className="flex-col gap-1 items-start">
                          <div className="flex items-center justify-between w-full">
                            <span>
                              (
                              {model.modelType === '1' ? 'Global' : '雲端'}
                              )
                              {' '}
                              {model.aliases}
                            </span>
                            {model.recommend === '1' && (
                              <span className="text-red-500 font-bold flex items-center gap-1">
                                <Star fill="red" stroke="none" />
                                推薦
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 text-xs">{model.description}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
          </Banner>

          {isShowingNote
            ? (
                <NoteComponent
                  userId={user?.userId ? Number(user.userId) : undefined}
                />
              )
            : (
                <div className="flex flex-col flex-1 overflow-hidden">
                  {/* 滾動區域 */}
                  <div
                    ref={chatContainerRef}
                    className={`flex-1 overflow-hidden hover:overflow-y-auto p-4 sm:p-6 pt-8
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
                    [&::-webkit-scrollbar-thumb]:transition-colors
                    ${!conversations.length && !currentUserQuestion ? 'flex flex-col items-center justify-center' : ''}`}
                    style={{ scrollbarGutter: 'stable' }}
                  >
                    {!conversations.length && !isLoading && !currentUserQuestion
                      ? (
                          <div className="flex flex-col items-center justify-center w-full max-w-3xl gap-8">
                            <DefaltInfo
                              title="競品資訊查詢與分析"
                            >
                              請在下方輸入您的問題，我將為您提供專業的產品規格資訊查詢服務，並可讓您掌握跨品牌、多市場的競品分析洞察。
                            </DefaltInfo>
                            {renderInputArea('max-w-3xl')}
                          </div>
                        )
                      : (
                          <div className="max-w-6xl mx-auto w-full flex flex-col gap-2">
                            {/* 顯示所有對話歷史 */}
                            {conversations.map((conv, index) => {
                              return (
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
                                    <div className="flex-1 flex-col flex gap-3">
                                      <div
                                        className="break-words relative group"
                                        ref={answerRef}
                                        id={`answer-${conv.recordDetailId}`}
                                      >
                                        <ReactMarkdown
                                          className="prose max-w-none dark:prose-invert prose-sm grid"
                                          remarkPlugins={[remarkGfm]}
                                          rehypePlugins={[rehypeRaw]}
                                          skipHtml={false}
                                          components={{
                                            table: ({ node, ...props }) => (
                                              <div className="overflow-x-auto my-4 border rounded-lg max-w-full" style={{ maxWidth: '100%' }}>
                                                <div className="max-w-screen-lg overflow-x-auto">
                                                  <table className="border-collapse table-auto w-full" {...props} style={{ minWidth: '600px', tableLayout: 'auto', margin: '0' }} />
                                                </div>
                                              </div>
                                            ),
                                            th: ({ node, ...props }) => (
                                              <th className="border bg-gray-100 p-2 text-left font-bold whitespace-nowrap" {...props} style={{ minWidth: '80px', verticalAlign: 'middle' }} />
                                            ),
                                            td: ({ node, ...props }) => (
                                              <td className="border p-2" {...props} style={{ minWidth: '60px', maxWidth: '200px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} />
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
                                            className="h-7 bg-gray-300/60 hover:bg-gray-300"
                                            onClick={async () => {
                                              const targetElement = document.getElementById(`answer-${conv.recordDetailId}`)
                                              if (targetElement) {
                                                const html = targetElement.innerHTML

                                                try {
                                                  await navigator.clipboard.write([
                                                    new ClipboardItem({
                                                      'text/html': new Blob([html], { type: 'text/html' }),
                                                      'text/plain': new Blob([targetElement.textContent ?? ''], { type: 'text/plain' }),
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
                                      <div className="flex items-center gap-4">
                                        {conv.isWeb === true
                                          ? (
                                              <>
                                                <Button
                                                  className="cursor-pointer"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setIsModalOpen(true)
                                                    fetchReferences(Number(conv.recordDetailId))
                                                  }}
                                                  style={{ borderRadius: '25px' }}
                                                >
                                                  參考網站
                                                </Button>
                                              </>
                                            )
                                          : (
                                              <Button
                                                className="cursor-pointer"
                                                variant="outline"
                                                onClick={() => handleReferencesClick(conv.recordDetailId)}
                                                style={{ borderRadius: '25px' }}
                                              >
                                                參考資料
                                              </Button>
                                            )}
                                        {conv.isGood !== null && !mostRecentDetailId.includes(conv.recordDetailId) && (
                                          <>
                                            {conv.isGood === true && (
                                              <ThumbsUp className="h-4 w-4" stroke="#ff6467" fill="#ff6467" />
                                            )}
                                            {conv.comment !== null && conv.comment !== '' && (
                                              <div className="bg-gray-200 py-1 px-3 rounded-lg text-gray-700">
                                                您先前的反饋：
                                                {conv.comment}
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                      {mostRecentDetailId.includes(conv.recordDetailId) && (
                                        <>
                                          <div className="flex items-center justify-between gap-4">
                                            <Button
                                              variant="outline"
                                              style={{ borderRadius: '25px' }}
                                              className={`flex items-center gap-2 ${noteEnabled[conv.recordDetailId]
                                                ? ' cursor-pointer border-blue-400 text-blue-400 hover:text-blue-500'
                                                : 'text-gray-500 border-gray-500 cursor-not-allowed'
                                              }`}
                                              onClick={() => noteEnabled[conv.recordDetailId] && handleInsertNote(conv.recordDetailId)}
                                            >
                                              <Pin
                                                fill={`${noteEnabled[conv.recordDetailId]
                                                  ? '#51a2ff'
                                                  : 'none'
                                                }`}
                                              />
                                              儲存至記事
                                            </Button>
                                            <div className="flex items-center">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 bg-white/80 text-gray-400 hover:text-red-400"
                                                onClick={async () => {
                                                  const targetElement = document.getElementById(`answer-${conv.recordDetailId}`)
                                                  if (targetElement) {
                                                    const html = targetElement.innerHTML

                                                    try {
                                                      await navigator.clipboard.write([
                                                        new ClipboardItem({
                                                          'text/html': new Blob([html], { type: 'text/html' }),
                                                          'text/plain': new Blob([targetElement.textContent ?? ''], { type: 'text/plain' }),
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
                                              {isGood[conv.recordDetailId] && (
                                                <Button
                                                  onClick={() => toggleIsGoodEnabled(conv.recordDetailId)}
                                                  variant="ghost"
                                                  size="sm"
                                                  className={`h-7 bg-white/80 hover:text-red-400 ${feedbackStates[conv.recordDetailId]?.isGoodEnabled
                                                    ? 'text-red-400'
                                                    : 'text-gray-400'
                                                  }`}
                                                >
                                                  <ThumbsUp
                                                    className="h-4 w-4"
                                                    fill={`${feedbackStates[conv.recordDetailId]?.isGoodEnabled
                                                      ? '#ff6467'
                                                      : 'none'
                                                    }`}
                                                  />
                                                </Button>
                                              )}
                                              {unGood[conv.recordDetailId] && (
                                                <Button
                                                  onClick={() => toggleFeedBackEnabled(conv.recordDetailId)}
                                                  variant="ghost"
                                                  size="sm"
                                                  className={`h-7 bg-white/80 hover:text-red-400 text-gray-400 ${feedbackStates[conv.recordDetailId]?.feedBackEnabled || newfeedBack[conv.recordDetailId]
                                                    ? 'text-red-400'
                                                    : 'text-gray-400'
                                                  }`}
                                                >
                                                  <ThumbsDown
                                                    className="h-4 w-4"
                                                    fill={`${feedbackStates[conv.recordDetailId]?.feedBackEnabled
                                                      ? '#ff6467'
                                                      : 'none'
                                                    }`}
                                                  />
                                                </Button>
                                              )}
                                              {newfeedBack[conv.recordDetailId] && (
                                                <div className="inline-block ml-2 bg-gray-200 py-1 px-3 rounded-lg text-gray-700">
                                                  {activeFeedback[conv.recordDetailId]}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          {feedbackStates[conv.recordDetailId]?.feedBackEnabled && mostRecentDetailId.includes(conv.recordDetailId) && (
                                            <div>
                                              <Textarea
                                                rows={4}
                                                value={feedback}
                                                onChange={e => setFeedback(e.target.value)}
                                                placeholder="請提供您的反饋"
                                                className="w-full h-24 min-h-[100px] overflow-y-auto mb-2"
                                              />
                                              <Button
                                                onClick={() => handleSubmitFeedback(conv.recordDetailId, feedback)}
                                                disabled={feedback.trim() === ''}
                                                className={`bg-green-500 text-white font-bold hover:bg-purple-600 ${feedback.trim() === ''
                                                  ? 'cursor-not-allowed bg-gray-700'
                                                  : 'cursor-pointer'
                                                }`}
                                              >
                                                提交
                                              </Button>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </React.Fragment>
                              )
                            })}

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
                                <div className="flex-1 flex-col flex gap-2">
                                  <div className="break-words relative group">
                                    <ReactMarkdown
                                      className="prose max-w-none dark:prose-invert prose-sm grid"
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeRaw]}
                                      skipHtml={false}
                                      components={{
                                        table: ({ node, ...props }) => (
                                          <div className="overflow-x-auto my-4 border rounded-lg max-w-full" style={{ maxWidth: '100%' }}>
                                            <div className="max-w-screen-lg overflow-x-auto">
                                              <table className="border-collapse table-auto w-full" {...props} style={{ minWidth: '600px', tableLayout: 'auto', margin: '0' }} />
                                            </div>
                                          </div>
                                        ),
                                        th: ({ node, ...props }) => (
                                          <th className="border bg-gray-100 p-2 text-left font-bold whitespace-nowrap" {...props} style={{ minWidth: '80px', verticalAlign: 'middle' }} />
                                        ),
                                        td: ({ node, ...props }) => (
                                          <td className="border p-2" {...props} style={{ minWidth: '60px', maxWidth: '200px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} />
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

                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                              <DialogContent aria-describedby={undefined} className="p-0 gap-0">
                                <DialogHeader className="px-6 py-4 border-b">
                                  <DialogTitle>參考網站</DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[80vh] overflow-y-auto py-4 px-6 flex flex-col gap-4">
                                  {isRefLoading
                                    ? (
                                        <Loading text="Loading..." size="large" />
                                      )
                                    : ref.length > 0
                                      ? (
                                          ref.map(ref => (
                                            <div
                                              key={ref.id}
                                              className="px-4 py-6 shadow-lg p-4 rounded-xl border border-gray-300 bg-white w-full flex flex-col gap-4"
                                            >
                                              <div className="flex gap-2">
                                                <span className="font-bold text-blue-400">Title: </span>
                                                <span className="text-red-600 font-bold">{ref.webTitle}</span>
                                              </div>
                                              <div className="flex gap-2">
                                                <span className="font-bold text-blue-400">Link: </span>
                                                <a
                                                  href={ref.webPath}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ textDecoration: 'underline' }}
                                                  className="text-green-500 hover:underline break-all"
                                                >
                                                  {ref.webPath}
                                                </a>
                                              </div>
                                            </div>
                                          ))
                                        )
                                      : (
                                          <div className="text-center mt-4 text-gray-400">No Data</div>
                                        )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                  </div>

                  {/* 輸入區域 - 固定在底部 (Only show if NOT in initial state) */}
                  {(conversations.length > 0 || isLoading || currentUserQuestion) && renderInputArea('mb-6 max-w-6xl')}
                </div>
              )}
        </div>

        <ParameterSettings
          creativity={creativity}
          valueDegree={valueDegree}
          promptInput={promptInput}
          onCreativityChange={setCreativity}
          onValueDegreeChange={setValueDegree}
          onPromptInputChange={setPromptInput}
        />
      </div>
    </div>
  )
}

export default HomePage
