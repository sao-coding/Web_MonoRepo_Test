'use client'

import { getAppConfig } from '@msi/config/env'
import { Card, CardContent, CardHeader, CardTitle } from '@msi/ui/components/card'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import NoteRecord from './NoteRecord'

interface NoteProps {
  userId: number | undefined
}

interface NotesItem {
  fCreateDate: string
  fUpdateTime: string
  fStat: string
  fKeyin: string
  fMasterTable: number
  fMasterId: number
  fTitle: string
  fContent: string
  fSeqNo: number
}

const NoteComponent: React.FC<NoteProps> = ({ userId }) => {
  const [notes, setNotes] = useState<NotesItem[]>([])
  const [isNoteRecord, setIsNoteRecord] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<number>(0)

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes?userId=${userId}`, {
        method: 'GET'
      })
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    }
    catch (err) {
      console.error('獲取記錄失敗:', err)
      toast.error('獲取記事紀錄失敗')
    }
  }

  const toggleViewNote = () => {
    setIsNoteRecord(!isNoteRecord)
    console.warn(isNoteRecord)
    fetchNotes()
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return (
    <>
      {isNoteRecord
        ? (
            <NoteRecord
              onToggleViewNote={toggleViewNote}
              selectedRecord={selectedRecord}
            />
          )
        : (
            <>
              {/* 記事內容區 */}
              <div className='size-full flex-1 overflow-y-auto p-4 sm:p-6'>
                {notes.length === 0
                  ? (
                      <div className='col-span-full text-center text-gray-500 dark:text-gray-400'>
                        尚無記事
                      </div>
                    )
                  : (
                      <div className='grid grid-cols-1 gap-4 rounded-sm md:grid-cols-2 lg:grid-cols-3'>
                        {notes.map((note) => (
                          <Card
                            key={note.fSeqNo}
                            onClick={() => {
                              setSelectedRecord(note.fSeqNo)
                              toggleViewNote()
                            }}
                            className='group relative cursor-pointer overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg'
                          >
                            <CardHeader className='border-b px-4 pt-4 pb-2'>
                              <CardTitle className='line-clamp-2 text-base font-semibold lg:line-clamp-1'>
                                {note.fTitle}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='px-4 pt-2 pb-4'>
                              <div
                                className='line-clamp-5'
                                dangerouslySetInnerHTML={{ __html: note?.fContent || '' }}
                              >
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
              </div>
            </>
          )}
    </>
  )
}

export default NoteComponent
