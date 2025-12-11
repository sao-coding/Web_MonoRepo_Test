'use client'

import type { Patent } from '../_types/patent'
import type { SearchContainer } from '../_types/patent-filter'
import { useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { CheckIcon, LoaderIcon, RefreshCcw, SparklesIcon, TagsIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { Skeleton } from '@/components/ui/skeleton'
import { usePatentsAiSummaryStore } from '@/store/patents-ai-summary'

const PatentsCard = ({
  index,
  currentPage,
  searchContainer,
  item,
  pk,
  onSendMessage,
  onSelectCard,
  isSelected = false,
}: {
  index: number
  currentPage?: number
  searchContainer: SearchContainer
  item: Patent
  pk?: boolean
  onSendMessage?: (input: string, isSelectCard?: number[]) => void
  onSelectCard?: (seqNo: number, patentNumber: string, pk?: boolean) => void
  isSelected?: boolean
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const isSelectable = pathname.includes('/chat') && currentPage
  const cardOnClick = isSelectable && onSelectCard ? () => onSelectCard(item.seqNo, item.patentNumber, pk) : undefined
  const { patents, firstPatentData, addPatent, updatePatentAiSummaryStream, updatePatentAiQuestions, setFirstPatentData } = usePatentsAiSummaryStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const caseTypes = [
    { name: '公開案', value: 'A' },
    { name: '公告案', value: 'B' },
  ]
  const patentTypes = [
    { name: '發明', value: 'I' },
    { name: '新型', value: 'M' },
    { name: '設計', value: 'D' },
  ]

  // 新增專利AI摘要
  const generateAiSummary = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // 立即更新UI，顯示載入中狀態
    const lastPatent = patents[patents.length - 1]
    const newId = lastPatent ? lastPatent.id + 1 : item.id + 1
    const { id, ...itemWithoutId } = item
    setIsLoading(true)
    addPatent({
      id: newId,
      ...itemWithoutId,
    } as unknown as Patent)
    // 執行非同步操作
    // 1. 生成AI摘要
    let output = ''

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicitypatents/ai-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
        body: JSON.stringify({
          patentNumber: item.patentNumber,
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
              if (json.questions) {
                updatePatentAiQuestions(newId, json.questions)
                setFirstPatentData({
                  id: null,
                  questions: json.questions,
                })
              }

              // 結束標記
              if (json.done === true) {
                console.warn('流式處理結束標記')
                continue
              }

              // 處理輸出文本
              if (json.output !== undefined) {
                output += json.output
                updatePatentAiSummaryStream(newId, json.output)
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
        const json = JSON.parse(cleaned)
        if (cleaned) {
          try {
            if (json.done === true) {
              console.warn('流式處理結束標記 (結尾)')
            }
            else if (json.output !== undefined) {
              updatePatentAiSummaryStream(newId, json.output)
            }
          }
          catch (e) {
            console.warn('無法解析的 JSON (結尾):', cleaned, e)
          }
        }
      }

      console.warn('流式處理完成，開始保存')

      // 2. 儲存摘要記錄
      await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicitypatents/summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
        body: JSON.stringify({
          patentNumber: item.patentNumber,
          searchContainerId: searchContainer.seqNo,
          summary: output,
        }),
      })

      queryClient.invalidateQueries({ queryKey: ['patentSearchHistory'] })
      // 3. 所有操作完成後，如果不在chat頁面，則跳轉
      if (!pathname.includes('chat')) {
        router.push(`/patents/${searchContainer.seqNo}/chat?page=${currentPage}`)
      }
    }
    catch (error) {
      console.error('API 調用錯誤:', error)
    }
    finally {
      setIsLoading(false)
    }
  }

  const hasAiS = patents.some(p => p.patentNumber === item.patentNumber && p.aiSummaries)

  const handleSendMessage = (question: string, isSelectCard?: number[]) => {
    const input = question

    if (!input?.trim()) {
      return
    }

    // 調用父組件傳入的 onSendMessage
    onSendMessage?.(input, isSelectCard)
  }

  return (
    <Card
      className={`min-w-[250] border-2
      ${isSelectable && 'cursor-pointer hover:border-blue-600'}
      ${isSelected && currentPage ? 'border-blue-600' : 'border-transparent'}
      `}
      onClick={cardOnClick}
    >
      <CardContent className="relative">
        {!(pathname.includes('/chat') && currentPage !== undefined) && (
          <div className="absolute top-0 right-6">
            <div className="flex items-center space-x-2">
              <TagsIcon />
              {/* 只顯示條件值，並將 patentTypes、caseTypes 轉換為中文 */}
              {searchContainer.conditions.patentTypes?.map((pt) => {
                const found = patentTypes.find(item => item.value === pt)
                return (
                  <span key={pt} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md">
                    {found ? found.name : pt}
                  </span>
                )
              })}
              {searchContainer.conditions.caseTypes?.map((ct) => {
                const found = caseTypes.find(item => item.value === ct)
                return (
                  <span key={ct} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md">
                    {found ? found.name : ct}
                  </span>
                )
              })}
              {searchContainer.conditions.years?.map(year => (
                <span key={year} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md">
                  {year}
                </span>
              ))}
              {searchContainer.conditions.countries?.map(country => (
                <span key={country} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md">
                  {country}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-primary-foreground size-8 rounded-md flex items-center justify-center">{index}</div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{caseTypes.find(ct => ct.value === item.caseType)?.name}</span>
              <div className="text-sm bg-gray-500 text-white px-1 rounded-md">
                {Array.isArray(item.applicants) && item.applicants.length > 0 ? item.applicants[item.applicants.length - 1]?.country : '未知國家'}
              </div>
            </div>

            <span className="text-sm font-mono">{item.patentNumber}</span>
          </div>
        </div>
        <div className="space-y-2 mt-2">
          <h2 className="text-xl font-semibold">
            {item.titleZh}
          </h2>
          <h3 className="text-sm text-muted-foreground">{item.titleEn}</h3>
          <p className="line-clamp-1">
            {item.abstractZh}
          </p>
          {pk === false && (
            pathname.includes('/chat') && !currentPage
              ? (
                  <>
                    <div className="flex justify-between items-center bg-green-50 rounded-md px-2 py-1">
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="text-green-700" />
                        <span className="text-sm text-green-700">AI 摘要</span>
                      </div>
                    </div>

                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold">
                          專利詳細資訊
                        </h4>
                        <div className="bg-secondary grid gap-2 p-4 rounded-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))' }}>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">專利類型:</span>
                            <span>
                              {patentTypes.find(pt => pt.value === item.patentType)?.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold whitespace-nowrap">國家:</span>
                            <span>{Array.isArray(item.applicants) && item.applicants.length > 0 && item.applicants[item.applicants.length - 1]?.country ? item.applicants[item.applicants.length - 1]?.country : '未知國家'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold whitespace-nowrap">申請日期:</span>
                            <span>{item.applicationDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold whitespace-nowrap">公開日期:</span>
                            <span>{item.publicationDate}</span>
                          </div>
                          <div className="flex space-x-2">
                            <span className="font-bold whitespace-nowrap">申請號碼:</span>
                            <a
                              target="_blank"
                              href={item.patentNumber ? `https://tiponet.tipo.gov.tw/gpss2/gpsskmc/gpssbkm?!!FRURL${item.patentNumber}` : '#'}
                              className="text-blue-600 underline"
                              rel="noreferrer"
                            >
                              {item.applicationNumber}
                            </a>
                          </div>
                          <div className="flex space-x-2">
                            <span className="font-bold whitespace-nowrap">申請人:</span>
                            <span>
                              {Array.isArray(item.applicants) && item.applicants.length > 0
                                ? item.applicants
                                  .map(applicants => applicants.nameZh || applicants.nameEn)
                                  .filter(name => name)
                                  .join(', ') || '未知申請人'
                                : '未知申請人'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <span className="font-bold whitespace-nowrap">發明人:</span>
                            <span>
                              {Array.isArray(item.inventors) && item.inventors.length > 0
                                ? item.inventors
                                  .map(inventor => inventor.nameZh || inventor.nameEn)
                                  .filter(name => name)
                                  .join(', ') || '未知發明人'
                                : '未知發明人'}
                            </span>
                          </div>

                        </div>
                      </div>
                      <div className="space-y-2 ">
                        <h4 className="text-lg font-semibold">
                          AI 生成摘要
                        </h4>
                        <div className="text-sm bg-blue-100 p-4 rounded-md">
                          {Array.isArray(patents) && patents.length > 0 && item.aiSummaries
                            ? (
                                <ReactMarkdown
                                  className="prose max-w-none dark:prose-invert prose-sm grid"
                                  remarkPlugins={[remarkGfm]}
                                  skipHtml={false}
                                  components={{
                                    table: ({ node, ...props }) => (
                                      <div className="overflow-x-auto my-4 border rounded-lg max-w-full" style={{ maxWidth: '100%' }}>
                                        <div className="max-w-screen-lg overflow-x-auto">
                                          <table className="border-collapse table-auto text-xs w-full" {...props} style={{ minWidth: '600px', tableLayout: 'auto', margin: '0' }} />
                                        </div>
                                      </div>
                                    ),
                                    th: ({ node, ...props }) => (
                                      <th className="border bg-gray-100 p-2 text-left font-bold whitespace-nowrap" {...props} style={{ minWidth: '80px', verticalAlign: 'middle' }} />
                                    ),
                                    td: ({ node, ...props }) => (
                                      <td className="border p-2" {...props} style={{ minWidth: '60px', maxWidth: '200px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                                    ),
                                    a: ({ node, ...props }) => (
                                      <a className="text-blue-600" {...props} />
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
                                  {item.aiSummaries}
                                </ReactMarkdown>
                              )
                            : (
                                <div className="flex items-center space-x-3">
                                  <LoaderIcon className="animate-spin text-blue-400" />
                                  <span className="text-blue-700 text-sm">AI 摘要生成中，請稍候...</span>
                                  <div className="flex-1">
                                    <Skeleton className="h-3 w-full mb-1" />
                                    <Skeleton className="h-3 w-2/3" />
                                  </div>
                                </div>
                              )}
                        </div>
                      </div>
                      {item.questions && firstPatentData.questions.length > 1 && (
                        <div className="space-y-2 ">
                          <h4 className="text-lg font-semibold">
                            延伸問題
                          </h4>
                          {patents.length > 0 && item.aiSummaries
                            ? (
                                <div className="inline-flex flex-col gap-2">
                                  {Array.isArray(item.questions) && item.questions.map((question, idx) => (
                                    <Button
                                      key={idx}
                                      className="py-2 px-4 bg-blue-600 rounded-xl justify-start h-auto text-left"
                                      onClick={() => {
                                        handleSendMessage(question, [item.seqNo])
                                      }}
                                      style={{ whiteSpace: 'normal' }}
                                    >
                                      <span className="text-sm break-words">{question}</span>
                                    </Button>
                                  ))}
                                </div>
                              )
                            : (
                                <div className="flex items-center space-x-3">
                                  <LoaderIcon className="animate-spin text-blue-400" />
                                  <span className="text-blue-700 text-sm">延伸問題生成中，請稍候...</span>
                                  <div className="flex-1">
                                    <Skeleton className="h-3 w-full mb-1" />
                                    <Skeleton className="h-3 w-2/3" />
                                  </div>
                                </div>
                              )}
                        </div>
                      )}
                    </div>

                  </>
                )
              : (
                  <Button
                    disabled={isLoading}
                    className={hasAiS ? 'bg-green-600 hover:bg-purple-600' : ''}
                    onClick={generateAiSummary}
                  >
                    {isLoading
                      ? (
                          <>
                            <LoaderIcon className="animate-spin text-blue-400" />
                            <span>AI 摘要生成中...</span>
                          </>
                        )
                      : hasAiS
                        ? (
                            <>
                              <RefreshCcw className="text-white" />
                              <span>重新生成摘要</span>
                            </>
                          )
                        : (
                            <>
                              <SparklesIcon className="text-yellow-500" />
                              <span>生成 AI 摘要</span>
                            </>
                          )}
                  </Button>
                )
          )}

        </div>
      </CardContent>
    </Card>
  )
}

export default PatentsCard
