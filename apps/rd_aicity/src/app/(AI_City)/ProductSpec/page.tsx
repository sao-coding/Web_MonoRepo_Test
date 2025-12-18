'use client'

import { useAuth } from '@msi/auth'
import { Button } from '@msi/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@msi/ui/components/dropdown-menu'
import {
  ChevronDown,
  Star,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'
import {
  ChatHeader,
  ChatInputArea,
  ChatLayout,
  ChatMessage,
  FeedbackPanel,
  MessageActions,
  ParameterSidebar,
} from '@/components/chat-layout'
import { ChatSidebar } from '@/components/chat-layout/ChatSidebar'
import DefaltInfo from '@/components/chat-robot/defalt-info'
import { titleConfig } from '@/config/title'
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
    const selectedModel = models.find(model => model.id === selectedModelId)

    if (!userInput?.trim()) {
      toast.error('請輸入訊息')
      return
    }

    const currentQuestion = userInput
    setCurrentUserQuestion(currentQuestion)
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

  // 從 titleConfig 取得當前頁面的設定
  const config = titleConfig.find(item => '/ProductSpec'.startsWith(item.pathname))
  const title = config?.title || 'SpecCore'
  const logoUrl = config?.logoUrl

  // 模型選擇下拉選單內容
  const modelSelectorContent = isShowingNote
    ? <span className="font-medium">筆記</span>
    : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1">
              {selectedModel ? `(${selectedModel.modelType === '1' ? 'Global' : '雲端'}) ${selectedModel.aliases}` : '選擇模型'}
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {models.map(model => (
              <DropdownMenuItem key={model.id} onSelect={() => setSelectedModelId(model.id)} className="flex-col items-start gap-1">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">
                    (
                    {model.modelType === '1' ? 'Global' : '雲端'}
                    )
                    {' '}
                    {model.aliases}
                  </span>
                  {model.recommend === '1' && (
                    <span className="text-red-500 font-bold flex items-center gap-1 text-xs">
                      <Star className="size-3" fill="red" stroke="none" />
                      推薦
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )

  return (
    <ChatLayout
      leftSidebar={(
        <ChatSidebar
          activeRecordId={activeRecordId}
          onSelectRecord={selectRecord}
          onStartNewConversation={startNewConversation}
          userId={user?.userId}
          isLoadingRecord={isLoadingRecord}
          records={records}
          setIsShowingNote={setIsShowingNote}
          onRecordsChange={fetchRecords}
          title={title}
          logoUrl={logoUrl}
          homeUrl={process.env.NEXT_PUBLIC_RD_SITE_URL ?? '/'}
        />
      )}
      header={(
        <ChatHeader
          userName={user?.name}
          userId={user?.userId}
          leftContent={modelSelectorContent}
          onLogout={() => toast.info('登出功能')}
        />
      )}
      rightSidebar={(
        <ParameterSidebar
          creativity={creativity}
          valueDegree={valueDegree}
          promptInput={promptInput}
          onCreativityChange={setCreativity}
          onValueDegreeChange={setValueDegree}
          onPromptInputChange={setPromptInput}
        />
      )}
    >
      {isShowingNote
        ? (
            <NoteComponent userId={user?.userId ? Number(user.userId) : undefined} />
          )
        : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* 對話內容（可滾動） */}
              <div
                ref={chatContainerRef}
                className={`flex-1 overflow-y-auto p-4 sm:p-6 ${!conversations.length && !currentUserQuestion ? 'flex flex-col items-center justify-center' : ''}`}
              >
                {!conversations.length && !isLoading && !currentUserQuestion
                  ? (
                      <div className="flex flex-col items-center justify-center w-full max-w-3xl gap-8 mt-[-10vh]">
                        <DefaltInfo title="競品資訊查詢與分析">
                        </DefaltInfo>
                        <ChatInputArea
                          value={userInput}
                          onChange={setUserInput}
                          onSubmit={handleSendMessage}
                          isLoading={isLoading}
                          isWebSearchEnabled={isWebSearchEnabled}
                          onToggleWebSearch={() => setIsWebSearchEnabled(prev => !prev)}
                          maxWidthClass="max-w-3xl"
                        />
                      </div>
                    )
                  : (
                      <div className="max-w-4xl mx-auto w-full flex flex-col gap-4 pb-4">
                        {conversations.map(conv => (
                          <React.Fragment key={conv.recordDetailId}>
                            {/* 使用者訊息 */}
                            <ChatMessage type="user" content={conv.question} />

                            {/* AI 回覆 */}
                            <ChatMessage
                              type="assistant"
                              content={conv.answer}
                              actions={(
                                <MessageActions
                                  onCopy={() => {
                                    navigator.clipboard.writeText(conv.answer)
                                    toast.success('已複製')
                                  }}
                                  onReference={() => handleReferencesClick(conv.recordDetailId)}
                                  onNote={noteEnabled[conv.recordDetailId] ? () => handleInsertNote(conv.recordDetailId) : undefined}
                                  onThumbsUp={isGood[conv.recordDetailId] ? () => toggleIsGoodEnabled(conv.recordDetailId) : undefined}
                                  onThumbsDown={unGood[conv.recordDetailId] ? () => toggleFeedBackEnabled(conv.recordDetailId) : undefined}
                                  isLiked={feedbackStates[conv.recordDetailId]?.isGoodEnabled}
                                  isDisliked={feedbackStates[conv.recordDetailId]?.feedBackEnabled}
                                  showNote={noteEnabled[conv.recordDetailId]}
                                  showThumbsUp={isGood[conv.recordDetailId]}
                                  showThumbsDown={unGood[conv.recordDetailId]}
                                />
                              )}
                              extraContent={(
                                <>
                                  {feedbackStates[conv.recordDetailId]?.feedBackEnabled && (
                                    <FeedbackPanel
                                      defaultValue={activeFeedback[conv.recordDetailId] || ''}
                                      onSubmit={feedback => handleSubmitFeedback(conv.recordDetailId, feedback)}
                                      onCancel={() => toggleFeedBackEnabled(conv.recordDetailId)}
                                    />
                                  )}
                                  {newfeedBack[conv.recordDetailId] && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      感謝您的反饋！
                                    </div>
                                  )}
                                </>
                              )}
                            />
                          </React.Fragment>
                        ))}

                        {/* 載入中的使用者訊息 */}
                        {currentUserQuestion && isLoading && (
                          <ChatMessage type="user" content={currentUserQuestion} />
                        )}

                        {/* AI 正在思考 */}
                        {isLoading && message === '' && (
                          <ChatMessage type="assistant" content="" isLoading />
                        )}

                        {/* AI 串流回覆中 */}
                        {message && isLoading && (
                          <ChatMessage type="assistant" content={message} isLoading />
                        )}
                      </div>
                    )}
              </div>

              {/* 底部輸入框（固定） */}
              {(conversations.length > 0 || isLoading || currentUserQuestion) && (
                <div className="shrink-0 bg-white dark:bg-gray-950 p-4 ">
                  <ChatInputArea
                    value={userInput}
                    onChange={setUserInput}
                    onSubmit={handleSendMessage}
                    isLoading={isLoading}
                    isWebSearchEnabled={isWebSearchEnabled}
                    onToggleWebSearch={() => setIsWebSearchEnabled(prev => !prev)}
                    maxWidthClass="max-w-4xl"
                  />
                </div>
              )}
            </div>
          )}
    </ChatLayout>
  )
}

export default HomePage
