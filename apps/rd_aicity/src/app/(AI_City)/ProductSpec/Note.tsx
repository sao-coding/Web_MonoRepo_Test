'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@msi/ui/components/card'
import React, { useEffect, useState } from 'react'
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes?userId=${userId}`, {
        method: 'GET',
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
              <div className="flex-1 w-full h-full p-4 sm:p-6 overflow-y-auto">
                {notes.length === 0
                  ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 col-span-full">
                        尚無記事
                      </div>
                    )
                  : (
                      <div className="grid grid-cols-1 gap-4 rounded-sm md:grid-cols-2 lg:grid-cols-3">
                        {notes.map(note => (
                          <Card
                            key={note.fSeqNo}
                            onClick={() => {
                              setSelectedRecord(note.fSeqNo)
                              toggleViewNote()
                            }}
                            className="cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]"
                          >
                            <CardHeader className="px-4 pt-4 pb-2 border-b">
                              <CardTitle className="lg:line-clamp-1 line-clamp-2 font-semibold text-base">
                                {note.fTitle}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pt-2 pb-4">
                              <div
                                className="line-clamp-5"
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
