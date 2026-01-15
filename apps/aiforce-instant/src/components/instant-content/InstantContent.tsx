'use client'

import type { AudioData, TranscriptionData } from '@/types'

import { Button } from '@msi/ui/components/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@msi/ui/components/tooltip'
import { Check, Pencil, UserRoundIcon, X } from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'

interface InstantContentProps {
  dataList: TranscriptionData | null
  isLoading: boolean
}

interface SpeakerConfig {
  name: string
  color: string
}

// 自動產生飽和度較高的顏色 (類似 Tailwind 500 系列的強度)
const generateVibrantColor = () => {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 70 + Math.random() * 15 // 70% - 85% 飽和度
  const lightness = 45 + Math.random() * 10 // 45% - 55% 亮度 (確保白字清晰)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export const InstantContent: React.FC<InstantContentProps> = ({ dataList, isLoading }) => {
  // 儲存語者 ID -> { 名稱, 顏色 }
  const [speakerMap, setSpeakerMap] = useState<Record<string, SpeakerConfig>>({})
  // 編輯相關狀態
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null)
  const [activeEntryIndex, setActiveEntryIndex] = useState<number | null>(null)
  const [tempName, setTempName] = useState('')

  // 初始化語者映射
  useEffect(() => {
    if (!dataList?.segments) return

    setSpeakerMap((prev) => {
      const newMap = { ...prev }
      let hasUpdate = false

      dataList.segments.forEach((segment: AudioData) => {
        if (!newMap[segment.speaker]) {
          newMap[segment.speaker] = {
            name: segment.speaker,
            color: generateVibrantColor()
          }
          hasUpdate = true
        }
      })
      return hasUpdate ? newMap : prev
    })
  }, [dataList])

  const handleSaveRename = (speakerId: string) => {
    const trimmed = tempName.trim()
    if (trimmed) {
      setSpeakerMap((prev) => ({
        ...prev,
        [speakerId]: { ...prev[speakerId], name: trimmed }
      }))
    }
    setEditingSpeakerId(null)
    setActiveEntryIndex(null)
  }

  // 處理鍵盤按鍵 (Enter 或 空格鍵) 觸發編輯
  const handleKeyDown = (e: React.KeyboardEvent, speakerId: string, currentName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setEditingSpeakerId(speakerId)
      setTempName(currentName)
    }
  }

  return (
    <>
      {isLoading ? (
        <div className='flex h-full items-center justify-center'>
          <div className='size-16 animate-spin rounded-full border-b-2 border-gray-900'></div>
        </div>
      ) : (
        dataList?.segments?.map((segments: AudioData) => {
          const config = speakerMap[segments.speaker] || { name: segments.speaker, color: '#ccc' }
          const isRenamed = config.name !== segments.speaker
          const isEditing = editingSpeakerId === segments.speaker && activeEntryIndex === segments.start

          return (
            <div key={segments.start} className='flex w-full gap-6 px-4 py-2 transition-colors hover:bg-gray-50/80'>
              <div className='relative flex flex-col text-center'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        onClick={() => {
                          setEditingSpeakerId(segments.speaker)
                          setActiveEntryIndex(segments.start)
                          setTempName(config.name)
                        }}
                        onKeyDown={(e) => { handleKeyDown(e, segments.speaker, config.name) }}
                        className='group relative inline-flex items-center justify-between rounded-full px-1 transition-transform hover:scale-110 focus:ring-2 focus:ring-blue-400 focus:outline-none active:scale-95'
                        style={{
                          backgroundColor: config.color,
                          width: '35px',
                          height: '35px'
                        }}
                      >
                        {/* 內容判定 */}
                        {!isRenamed ? (
                          <UserRoundIcon size={28} width={28} height={28} fill='white' stroke='none' className='transition-opacity group-hover:opacity-0' style={{ width: '28px', height: '28px' }} />
                        ) : (
                          <span className='mx-auto mt-1 text-2xl font-bold text-white transition-opacity select-none group-hover:opacity-0'>
                            {config.name.charAt(0)}
                          </span>
                        )}

                        {/* Hover 時顯示的 Pen Icon */}
                        <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/20 opacity-0 transition-opacity group-hover:opacity-100'>
                          <Pencil size={18} className='text-white' />
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{config.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {isEditing && (
                  <div className='animate-in zoom-in-95 absolute top-12 left-0 z-50 flex items-center rounded-lg border bg-white p-2 shadow-2xl'>
                    <input
                      autoFocus
                      className='w-28 border-b-2 border-blue-500 py-1 text-sm outline-none'
                      value={tempName}
                      onChange={(e) => { setTempName(e.target.value) }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(segments.speaker)
                        if (e.key === 'Escape') {
                          setEditingSpeakerId(null)
                          setActiveEntryIndex(null)
                        }
                      }}
                      placeholder='Enter name'
                    />
                    <Button variant='ghost' onClick={() => { handleSaveRename(segments.speaker) }} className='rounded-3xl p-1 text-green-600 hover:bg-green-50'>
                      <Check size={16} strokeWidth={3} />
                    </Button>
                    <Button variant='ghost' onClick={() => { setEditingSpeakerId(null) }} className='rounded-3xl p-1 text-red-600 hover:bg-red-50'>
                      <X size={16} strokeWidth={3} />
                    </Button>
                  </div>
                )}

                <span className='mt-1.5 text-xs text-gray-400'>{formatTime(segments.start)}</span>
              </div>
              <div>
                <p className='leading-relaxed text-gray-700'>{segments.text}</p>
                {segments.translation
                  && <p className='inline-block rounded-sm bg-gray-200 px-1 leading-relaxed text-gray-700'>{segments.translation}</p>
                }
              </div>
            </div>
          )
        })
      )}
    </>
  )
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
