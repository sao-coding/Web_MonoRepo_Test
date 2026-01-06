'use client'

/**
 * ProductSpec 首頁
 *
 * 此頁面作為 ProductSpec Zone 的入口點
 * 路徑: /AI_City/ProductSpec
 */

import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import {
  ChatHeader,
  ChatInputArea,
  ChatLayout,
  ChatMessage,
  ChatSidebar,
  FeedbackPanel,
  MessageActions,
  ParameterSidebar
} from '@msi/ui/components/chat-layout'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import DefaltInfo from '@/components/chat-robot/defalt-info'
import { ModelSelector } from '@/components/model-selector'
import { titleConfig } from '@/config/title'
import { useProductSpecChat, useProductSpecParameters } from '@/features/product-spec'
import { useConversation } from '@/hooks/use-conversation'
import { useFeedback } from '@/hooks/use-feedback'
import { useModels } from '@/hooks/use-models'

import NoteComponent from './Note'

const HomePage = () => {
  const chatContainerRef = React.useRef<HTMLDivElement>(null)

  // Auth
  const { user } = useAuth()

  // Models hook
  const { models, setSelectedModelId, selectedModel } = useModels({
    apiBaseUrl: getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL
  })

  // Conversation hook
  const {
    conversations,
    setConversations,
    records,
    activeRecordId,
    setActiveRecordId,
    isLoadingRecord,
    message,
    setMessage,
    fetchRecords,
    loadRecordDetails,
    selectRecord,
    startNewConversation: baseStartNewConversation,
    addConversation
  } = useConversation({
    apiBaseUrl: getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL,
    userId: user?.userId
  })

  // Feedback hook
  const {
    feedbackStates,
    activeFeedback,
    newFeedback,
    isGood,
    unGood,
    noteEnabled,
    toggleIsGood,
    toggleFeedback,
    submitFeedback,
    insertNote,
    setButtonVisibility
  } = useFeedback({
    apiBaseUrl: getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL,
    userId: user?.userId
  })

  // Parameters hook
  const {
    creativity,
    setCreativity,
    valueDegree,
    setValueDegree,
    promptInput,
    setPromptInput,
    fetchParameters,
    resetParameters
  } = useProductSpecParameters({
    userId: user?.userId,
    models,
    setSelectedModelId
  })

  // Chat hook
  const {
    sendMessage,
    isLoading,
    currentStreamMessage,
    currentUserQuestion,
    isWebSearchEnabled,
    toggleWebSearch
  } = useProductSpecChat({
    userId: user?.userId,
    activeRecordId,
    setActiveRecordId,
    addConversation,
    fetchRecords,
    modelId: selectedModel?.modelId || 'Qwen/Qwen2.5-VL-72B-Instruct-AWQ',
    parameters: { creativity, valueDegree, promptInput },
    setButtonVisibility
  })

  // Local state
  const [userInput, setUserInput] = useState('')
  const [isShowingNote, setIsShowingNote] = useState(false)

  // ============================================================================
  // Effects
  // ============================================================================

  // Scroll to bottom on new messages
  useEffect(() => {
    const scrollableDiv = chatContainerRef.current

    if (scrollableDiv) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight
    }
  }, [conversations, currentUserQuestion, message, currentStreamMessage])

  // Fetch records when user is available
  useEffect(() => {
    if (user) {
      fetchRecords()
    }
  }, [user, fetchRecords])

  // Load record details and parameters when active record changes
  useEffect(() => {
    if (activeRecordId) {
      loadRecordDetails(activeRecordId)
      fetchParameters(activeRecordId)
      setIsShowingNote(false)
    } else {
      setConversations([])
      setMessage('')
    }
  }, [activeRecordId, loadRecordDetails, fetchParameters, setConversations, setMessage])

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleStartNewConversation = () => {
    baseStartNewConversation()
    resetParameters()
    setIsShowingNote(false)
  }

  const handleSendMessage = async () => {
    await sendMessage(userInput)
    setUserInput('')
  }

  const handleReferencesClick = (recordDetailId: number) => {
    const url = `References/${recordDetailId}`
    window.open(url, '_blank')
  }

  const handleInsertNote = async (recordDetailId: number) => {
    await insertNote(recordDetailId)
  }

  // ============================================================================
  // Render Helpers
  // ============================================================================

  // Get page config
  const config = titleConfig.find((item) => '/ProductSpec'.startsWith(item.pathname))
  const title = config?.title || 'SpecCore'
  const logoUrl = config?.logoUrl

  return (
    <ChatLayout
      leftSidebar={
        <ChatSidebar
          activeRecordId={activeRecordId}
          onSelectRecord={selectRecord}
          onStartNewConversation={handleStartNewConversation}
          isLoadingRecord={isLoadingRecord}
          records={records}
          setIsShowingNote={setIsShowingNote}
          onRecordsChange={fetchRecords}
          title={title}
          logoUrl={logoUrl}
          homeUrl={getAppConfig().NEXT_PUBLIC_RD_SITE_URL || '/'}
        />
      }
      header={
        <ChatHeader
          userName={user?.name}
          userId={user?.userId}
          leftContent={
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelect={setSelectedModelId}
              isNoteMode={isShowingNote}
            />
          }
          onLogout={() => toast.info('登出功能')}
        />
      }
      rightSidebar={
        <ParameterSidebar
          creativity={creativity}
          valueDegree={valueDegree}
          promptInput={promptInput}
          onCreativityChange={setCreativity}
          onValueDegreeChange={setValueDegree}
          onPromptInputChange={setPromptInput}
        />
      }
    >
      {isShowingNote ? (
        <NoteComponent userId={user?.userId ? Number(user.userId) : undefined} />
      ) : (
        <div className='flex h-full flex-col overflow-hidden'>
          {/* 對話內容（可滾動） */}
          <div
            ref={chatContainerRef}
            className={`flex-1 overflow-y-auto p-4 sm:p-6 ${!conversations.length && !currentUserQuestion ? 'flex flex-col items-center justify-center' : ''}`}
          >
            {!conversations.length && !isLoading && !currentUserQuestion ? (
              <div className='mt-[-10vh] flex w-full max-w-3xl flex-col items-center justify-center gap-8'>
                <DefaltInfo title='競品資訊查詢與分析'>
                  請在下方輸入您的問題，我將為您提供專業的產品規格資訊查詢服務，並可讓您掌握跨品牌、多市場的競品分析洞察。
                </DefaltInfo>
                <ChatInputArea
                  value={userInput}
                  onChange={setUserInput}
                  onSubmit={handleSendMessage}
                  isLoading={isLoading}
                  isWebSearchEnabled={isWebSearchEnabled}
                  onToggleWebSearch={toggleWebSearch}
                  maxWidthClass='max-w-3xl'
                />
              </div>
            ) : (
              <div className='mx-auto flex w-full max-w-4xl flex-col gap-4 pb-4'>
                {conversations.map((conv) => (
                  <React.Fragment key={conv.recordDetailId}>
                    {/* 使用者訊息 */}
                    <ChatMessage type='user' content={conv.question} />

                    {/* AI 回覆 */}
                    <ChatMessage
                      type='assistant'
                      content={conv.answer}
                      actions={
                        <MessageActions
                          onCopy={() => {
                            navigator.clipboard.writeText(conv.answer)
                            toast.success('已複製')
                          }}
                          onReference={() => {
                            handleReferencesClick(conv.recordDetailId)
                          }}
                          onNote={
                            noteEnabled[conv.recordDetailId]
                              ? () => handleInsertNote(conv.recordDetailId)
                              : undefined
                          }
                          onThumbsUp={
                            isGood[conv.recordDetailId]
                              ? () => {
                                  toggleIsGood(conv.recordDetailId)
                                }
                              : undefined
                          }
                          onThumbsDown={
                            unGood[conv.recordDetailId]
                              ? () => {
                                  toggleFeedback(conv.recordDetailId)
                                }
                              : undefined
                          }
                          isLiked={feedbackStates[conv.recordDetailId]?.isGoodEnabled}
                          isDisliked={feedbackStates[conv.recordDetailId]?.feedBackEnabled}
                          showNote={noteEnabled[conv.recordDetailId]}
                          showThumbsUp={isGood[conv.recordDetailId]}
                          showThumbsDown={unGood[conv.recordDetailId]}
                        />
                      }
                      extraContent={
                        <>
                          {feedbackStates[conv.recordDetailId]?.feedBackEnabled && (
                            <FeedbackPanel
                              defaultValue={activeFeedback[conv.recordDetailId] || ''}
                              onSubmit={(feedback) => {
                                submitFeedback(conv.recordDetailId, feedback)
                              }}
                              onCancel={() => {
                                toggleFeedback(conv.recordDetailId)
                              }}
                            />
                          )}
                          {newFeedback[conv.recordDetailId] && (
                            <div className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                              感謝您的反饋！
                            </div>
                          )}
                        </>
                      }
                    />
                  </React.Fragment>
                ))}

                {/* 載入中的使用者訊息 */}
                {currentUserQuestion && isLoading && (
                  <ChatMessage type='user' content={currentUserQuestion} />
                )}

                {/* AI 正在思考 */}
                {isLoading && !currentStreamMessage && (
                  <ChatMessage type='assistant' content='' isLoading />
                )}

                {/* AI 串流回覆中 */}
                {currentStreamMessage && isLoading && (
                  <ChatMessage type='assistant' content={currentStreamMessage} isLoading />
                )}
              </div>
            )}
          </div>

          {/* 底部輸入框（固定） */}
          {(conversations.length > 0 || isLoading || currentUserQuestion) && (
            <div className='dark:bg-background shrink-0 bg-white p-4'>
              <ChatInputArea
                value={userInput}
                onChange={setUserInput}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                isWebSearchEnabled={isWebSearchEnabled}
                onToggleWebSearch={toggleWebSearch}
                maxWidthClass='max-w-4xl'
              />
            </div>
          )}
        </div>
      )}
    </ChatLayout>
  )
}

export default HomePage
