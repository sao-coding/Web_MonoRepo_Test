'use client'

import type { Patent } from '../../_types/patent'
import Cookies from 'js-cookie'
import {
  BotIcon,
  PanelRight,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import Banner from '@/components/banner-b'
import { usePatentsAiSummaryStore } from '@/store/patents-ai-summary'
import ChatInput from '../../_components/chat-input'
import PatentsCard from '../../_components/patents-card'
import PatentsChat from '../../_components/patents-chat'
import SearchResults from '../../_components/search-results'

const PatentsIdChatPage = () => {
  const { patents, addPatent, searchContainer, firstPatentData, setFirstPatentData, updateFirstPatent, setPatents, clear, updateLastPatentContent } = usePatentsAiSummaryStore()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const pk: boolean = false
  const [isExpanded, setIsExpanded] = useState(true)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const [selectedSeqNo, setSelectedSeqNo] = useState<number[]>([])
  const [pkSelectedSeqNo, setPkSelectedSeqNo] = useState<number[]>([])
  const [pkSelectedNumber, setPkSelectedNumber] = useState<string[]>([])

  useEffect(() => {
    const fetchSearchContainer = async () => {
      if (!id)
        return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/AiCityPatents/search-containers/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
        })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const response = await res.json()
        const patentsContent: Patent[] = Array.isArray(response.data)
          ? response.data.map((item: any) => {
              const content = item.content
              return typeof content === 'string'
                ? {
                    id: item.id,
                    role: item.role,
                    type: item.type,
                    rawContent: content, // 將純 string 的 content 存入 rawContent
                  }
                : item.type === 'compare' // <--- 新增：判斷是否為 compare 類型
                  ? {
                      id: item.id,
                      role: item.role,
                      type: item.type,
                      compare: content, // <--- 修正：將 content 賦值給 compare
                    }
                  : {
                      id: item.id,
                      role: item.role,
                      type: item.type,
                      ...content, // 將物件展開並存入
                    }
            })
          : []
        setPatents(patentsContent)
        if (patentsContent.length === 1) {
          const firstPatent = patentsContent[0]
          setFirstPatentData({
            id: firstPatent.id,
            url: firstPatentData.url || '',
            questions: firstPatentData.questions || [],
          })
        }
      }
      catch (err) {
        // 可選: 處理錯誤
        console.error(err)
      }
    }
    // 先清除舊資料再重新獲取
    clear()
    fetchSearchContainer()
  }, [id, setPatents, clear, setFirstPatentData])

  useEffect(() => {
    updateFirstPatent(firstPatentData.id, firstPatentData.questions)
  }, [firstPatentData])

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }, [patents])

  const handleSelectCard = (seqNo: number, patentNumber: string, pk?: boolean) => {
    let shouldShowError = false

    if (pk) {
      setPkSelectedSeqNo((prevSeqNo) => {
        const isAlreadySelected = prevSeqNo.includes(seqNo)
        if (isAlreadySelected) {
          return prevSeqNo.filter(n => n !== seqNo)
        }
        else {
          if (prevSeqNo.length >= 5) {
            shouldShowError = true
            return prevSeqNo
          }
          return [...prevSeqNo, seqNo]
        }
      })
      setPkSelectedNumber((prevNumber) => {
        const isAlreadySelected = prevNumber.includes(patentNumber)
        if (isAlreadySelected) {
          return prevNumber.filter(n => n !== patentNumber)
        }
        else {
          if (prevNumber.length >= 5) {
            shouldShowError = true
            return prevNumber
          }
          return [...prevNumber, patentNumber]
        }
      })
    }
    else {
      setSelectedSeqNo((prevSeqNo) => {
        const isAlreadySelected = prevSeqNo.includes(seqNo)
        if (isAlreadySelected) {
          return prevSeqNo.filter(n => n !== seqNo)
        }
        else {
          if (prevSeqNo.length >= 5) {
            shouldShowError = true
            return prevSeqNo
          }
          return [...prevSeqNo, seqNo]
        }
      })
    }

    if (shouldShowError) {
      toast.error('最多只能挑選 5 筆專利進行比較！')
    }
  }

  const handleClearSelect = () => {
    setSelectedSeqNo([])
    toast.success('已清除所有選取項目！')
  }

  const handleSendMessage = async (input: string, isSelectCard?: number[]) => {
    if (!input?.trim()) {
      toast.error('請輸入訊息')
      return
    }
    const lastPatent = patents[patents.length - 1]
    const newId = lastPatent ? lastPatent.id + 1 : 1
    setIsLoading(true)
    addPatent({
      id: newId,
      role: 'user',
      type: 'text',
      rawContent: input,
    } as unknown as Patent)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicitypatents/chat/${searchContainer.seqNo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
        body: JSON.stringify({
          content: input,
          attachments: {
            patentSeqNos: isSelectCard && isSelectCard.length > 0
              ? isSelectCard
              : Array.from(new Set(
                  patents
                    .filter(p => p.seqNo) // 過濾出有 seqNo 的專利
                    .map(p => p.seqNo), // 提取 seqNo
                )),
          },
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      // 流式讀取
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let buffer = ''
      console.warn('Chat newId:', newId + 1)

      setIsLoading(false)
      addPatent({
        id: newId + 1,
        role: 'ai',
        type: 'text',
        rawContent: '',
      } as unknown as Patent)

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

              // 結束標記
              if (json.done === true) {
                console.warn('流式處理結束標記')
                continue
              }

              // 處理輸出文本
              if (json.output !== undefined) {
                console.warn('流式處理輸出:', json.output)
                updateLastPatentContent(newId + 1, json.output)
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
            if (json.done === true) {
              console.warn('流式處理結束標記 (結尾)')
            }
            else if (json.output !== undefined) {
              updateLastPatentContent(json.output)
            }
          }
          catch (e) {
            console.warn('無法解析的 JSON (結尾):', cleaned, e)
          }
        }
      }
    }
    catch (error) {
      console.error('API 調用錯誤:', error)
      toast.error('發生錯誤，請稍後重試')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Banner><>&nbsp;</></Banner>
        <div className="p-4 sm:py-6 mt-4 overflow-y-auto flex-1 grid gap-4" ref={chatAreaRef}>
          {patents && patents.map((patent, index) => (
            patent.type === 'text' || patent.type === 'compare' || patent.rawContent
              ? (
                  <PatentsChat
                    key={`${patent.seqNo}-${index}`}
                    item={patent}
                  />
                )
              : (
                  <PatentsCard
                    key={`${patent.seqNo}-${index}`}
                    index={index + 1}
                    item={patent}
                    pk={pk}
                    searchContainer={searchContainer}
                    onSendMessage={handleSendMessage}
                    onSelectCard={(seqNo, patentNumber) => handleSelectCard(seqNo, patentNumber, false)}
                    isSelected={selectedSeqNo.includes(patent.seqNo)}
                  />
                )
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center">
              <div className="rounded-full bg-gray-300 w-8 h-8 flex items-center justify-center">
                <BotIcon className="h-4 w-4" />
              </div>
              <div className="bg-gray-300 p-2 rounded-full w-5 h-5 animate-bounce"></div>
            </div>
          )}
        </div>
        <ChatInput
          searchContainer={searchContainer}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onSelectCard={handleSelectCard}
          onSendMessage={handleSendMessage}
          selectedSeqNo={selectedSeqNo}
          pkSelectedNumber={pkSelectedNumber}
          pkSelectedSeqNo={pkSelectedSeqNo}
          setPkSelectedSeqNo={setPkSelectedSeqNo}
        />
      </div>
      <div className={`bg-gray-50 flex flex-col h-full transition-all duration-300 ${isExpanded ? 'w-80' : 'w-14'}`}>
        {isExpanded
          ? (
              <>
                <div className="text-end">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="收合搜尋結果"
                  >
                    <PanelRight size={20} />
                  </button>
                </div>
                <SearchResults
                  maxVisiblePages={2}
                  pk={pk}
                  onSelectCard={handleSelectCard}
                  onClearSelect={handleClearSelect}
                  onSendMessage={handleSendMessage}
                  selectedSeqNo={selectedSeqNo}
                />
              </>
            )
          : (
              <div className="flex items-center justify-center h-[36px] mt-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  aria-label="展開搜尋結果"
                >
                  <PanelRight size={20} />
                </button>
              </div>
            )}
      </div>
    </div>
  )
}

export default PatentsIdChatPage
