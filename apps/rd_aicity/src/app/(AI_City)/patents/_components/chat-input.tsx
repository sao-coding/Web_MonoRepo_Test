'use client'

import type { Patent } from '../_types/patent'
import type { SearchContainer } from '../_types/patent-filter'
import Cookies from 'js-cookie'
import {
  SendHorizontalIcon,
  Telescope,
} from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { usePatentsAiSummaryStore } from '@/store/patents-ai-summary'
import SearchResults from './search-results'

const ChatInput = ({
  isLoading,
  searchContainer,
  selectedSeqNo,
  pkSelectedSeqNo,
  pkSelectedNumber,
  setIsLoading,
  onSelectCard,
  onSendMessage,
  setPkSelectedSeqNo,
}: {
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  selectedSeqNo: number[]
  pkSelectedSeqNo: number[]
  setPkSelectedSeqNo: (pkSelectedSeqNo: number[]) => void
  pkSelectedNumber: string[]
  searchContainer: SearchContainer
  onSelectCard: (seqNo: number, patentNumber: string, pk?: boolean) => void
  onSendMessage: (input: string, isSelectCard?: number[]) => void
}) => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userInput, setUserInput] = React.useState<string>('')
  const { patents, addPatent, updateLastPatentContent } = usePatentsAiSummaryStore()

  const handleSendMessage = () => {
    const input = inputRef.current?.value

    if (!input?.trim()) {
      return
    }

    // 調用父組件傳入的 onSendMessage
    onSendMessage(input, selectedSeqNo)

    // 清空輸入框
    inputRef.current!.value = ''
    setUserInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value)
  }
  const comparePatents = pkSelectedNumber.map(num => ({
    FPn: num,
  }))
  const handleCardPK = async () => {
    const lastPatent = patents[patents.length - 1]
    const newId = lastPatent ? lastPatent.id + 1 : 1

    if (pkSelectedSeqNo.length > 5) {
      toast.error('最多只能挑選 5 筆專利進行比較！')
    }
    else if (pkSelectedSeqNo.length < 2) {
      toast.error('請挑選至少 2 筆專利進行比較！')
    }
    else {
      setIsModalOpen(false)
      setIsLoading(true)

      addPatent({
        id: newId,
        role: 'user',
        type: 'compare',
        compare: comparePatents,
      } as unknown as Patent)

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicitypatents/compare/${searchContainer.seqNo}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          },
          body: JSON.stringify({
            attachments: {
              patentSeqNos: pkSelectedSeqNo,
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
                updateLastPatentContent(newId + 1, json.output)
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
        setPkSelectedSeqNo([])
      }
    }
  }

  return (
    <div className="border-t p-4 flex-shrink-0">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        <div className="border-gray-300 rounded-2xl border px-3 py-2 flex items-center gap-4">
          <Button
            disabled={isLoading}
            onClick={() => {
              setIsModalOpen(true)
              setPkSelectedSeqNo([])
            }}
            variant="ghost"
            className="flex items-center gap-2 cursor-pointer text-blue-500"
            style={{ borderRadius: '25px' }}
          >
            <Telescope />
            加入對比
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent aria-describedby={undefined} className="p-0 gap-0">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle>選擇要對比的專利</DialogTitle>
              </DialogHeader>
              <div className="max-h-[80vh] overflow-y-auto flex flex-col gap-4">
                <SearchResults
                  maxVisiblePages={2}
                  pk={true}
                  onSelectCard={onSelectCard}
                  onSendMessage={handleSendMessage}
                  selectedSeqNo={pkSelectedSeqNo}
                />
              </div>
              <div className="flex items-center gap-4 p-4 pt-2 justify-center">
                <Button
                  variant="outline"
                  className="w-100"
                  onClick={() => setIsModalOpen(false)}
                >
                  取消
                </Button>
                <Button
                  className="w-100 bg-blue-600"
                  onClick={handleCardPK}
                  disabled={pkSelectedSeqNo.length < 2}
                >
                  加入對比
                  (
                  {pkSelectedSeqNo.length}
                  )
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Textarea
            id="input"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            rows={1}
            value={userInput}
            className="resize-none overflow-y-auto flex-1 p-0 border-0 focus:ring-0 focus:outline-none bg-transparent focus-visible:ring-0 shadow-none min-h-0"
            placeholder="詢問任何問題"
          />
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
  )
}

export default ChatInput
