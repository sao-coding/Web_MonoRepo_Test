'use client'

import { getAppConfig } from '@msi/config/env'
import { Button } from '@msi/ui/components/button'
import { Card, CardContent } from '@msi/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@msi/ui/components/dialog'
import { Input } from '@msi/ui/components/input'
import {
  CheckIcon,
  Minimize2,
  PencilIcon,
  Trash2
} from 'lucide-react'
import * as React from 'react'
import { Fragment, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

interface NoteViewProps {
  onToggleViewNote: () => void
  selectedRecord: number
}

interface NoteItem {
  noteId: number
  title: string
  content: string
  createDate: string
  updateTime: string
}

interface ReferenceItem {
  id: number
  title: string
  path: string
  reference: string
  score: number
  type: string
  language: string
  createDate: string
}

interface NoteInfo {
  noteInfo: NoteItem[]
  referenceData: ReferenceItem[]
  isWeb: boolean
  recordDetailId: number
}

const NoteRecord: React.FC<NoteViewProps> = ({
  onToggleViewNote,
  selectedRecord
}) => {
  const [notes, setNotes] = useState<NoteInfo[]>([])
  const [isEditingTitle, setIsEditingTitle] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes/${selectedRecord}/references/detail`, {
        method: 'GET'
      })
      if (res.ok) {
        const data = await res.json()
        const formattedNotes = [{
          noteInfo: [data.noteInfo],
          referenceData: data.referenceData,
          isWeb: data.isWeb,
          recordDetailId: data.recordDetailId
        }]
        setNotes(formattedNotes)
      }
    }
    catch (err) {
      console.error('獲取記事內容失敗:', err)
      toast.error('獲取記事內容失敗')
    }
  }

  const updateTitle = async () => {
    if (!newTitle.trim()) {
      toast.error('標題不能為空')
      return
    }
    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes/${selectedRecord}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle
        })
      })

      if (res.ok) {
        toast.success('標題已更新')
        setIsEditingTitle(null)
        fetchNotes() // 重新讀取記錄
      }
      else {
        toast.error('更新失敗')
      }
    }
    catch (err) {
      console.error('更新標題失敗:', err)
      toast.error('更新標題失敗')
    }
  }

  const startEditTitle = (fSeqNo: number, currentTitle: string) => {
    setIsEditingTitle(fSeqNo)
    setNewTitle(currentTitle)
  }

  const deleteNote = async () => {
    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes/${selectedRecord}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('記事已刪除')
      }
      else {
        toast.error('刪除失敗')
      }
    }
    catch (err) {
      console.error('刪除記事失敗:', err)
      toast.error('刪除記事失敗')
    }
    finally {
      onToggleViewNote()
    }
  }

  const handleReferencesClick = (recordDetailId: number) => {
    const url = `ProductSpec/References/${recordDetailId}`
    window.open(url, '_blank')
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return (
    <>
      {
        notes.map((note, index) => (
          <Fragment key={`${note.noteInfo[0]?.noteId}-${index}`}>
            <div
              className='flex h-14 items-center justify-between border-b px-4'
            >
              {isEditingTitle === note.noteInfo[0]?.noteId
                ? (
                    <div className='flex w-full items-center space-x-2' onClick={(e) => { e.stopPropagation() }}>
                      <Input
                        value={newTitle}
                        onChange={(e) => { setNewTitle(e.target.value) }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateTitle()
                          }
                          else if (e.key === 'Escape') {
                            setIsEditingTitle(null)
                          }
                        }}
                        autoFocus
                        className='w-full py-1 text-sm'
                      />
                      <Button
                        size='sm'
                        onClick={() => updateTitle()}
                        className='h-8 px-2'
                      >
                        <CheckIcon className='size-4' />
                      </Button>
                    </div>
                  )
                : (
                    <>
                      <span className='text-lg font-bold'>{note.noteInfo[0]?.title}</span>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-7 p-0'
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditTitle(note.noteInfo[0]?.noteId, note.noteInfo[0]?.title)
                          }}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-7 p-0'
                          onClick={(e) => {
                            e.stopPropagation()
                            toast(
                              '確定要刪除這筆記事紀錄嗎？',
                              {
                                action: {
                                  label: '確定',
                                  onClick: () => deleteNote()
                                },
                                cancel: {
                                  label: '取消',
                                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                                  onClick: () => { }
                                },
                                position: 'top-center',
                                duration: 10000,
                                className: 'bg-white dark:bg-zinc-800 border dark:border-zinc-700'
                              }
                            )
                          }}
                        >
                          <Trash2 />
                        </Button>
                        <Button
                          variant='ghost'
                          className='size-7 p-0'
                          onClick={onToggleViewNote}
                        >
                          <Minimize2 />
                        </Button>
                      </div>
                    </>
                  )}
            </div>
            <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
              <ReactMarkdown
                className='prose dark:prose-invert prose-sm grid max-w-none'
                remarkPlugins={[remarkGfm]}
                skipHtml={false}
                components={{
                  table: ({ ...props }) => (
                    <div className='my-4 max-w-full overflow-x-auto rounded-lg border' style={{ maxWidth: '100%' }}>
                      <div className='max-w-screen-lg overflow-x-auto'>
                        <table className='w-full table-auto border-collapse text-xs' {...props} style={{ minWidth: '600px', tableLayout: 'auto', margin: '0' }} />
                      </div>
                    </div>
                  ),
                  th: ({ ...props }) => (
                    <th className='border bg-gray-100 p-2 text-left font-bold whitespace-nowrap dark:border-zinc-700 dark:bg-zinc-800' {...props} style={{ minWidth: '80px', verticalAlign: 'middle' }} />
                  ),
                  td: ({ ...props }) => (
                    <td className='border p-2 dark:border-zinc-700' {...props} style={{ minWidth: '60px', maxWidth: '200px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                  ),
                  p: ({ ...props }) => (
                    <p className='mb-2 last:mb-0' {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul className='mb-2 list-disc space-y-1 pl-4' {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol className='mb-2 list-decimal space-y-1 pl-4' {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li className='mb-1' {...props} />
                  ),
                  h1: ({ ...props }) => (
                    <h1 className='mt-4 mb-2 text-lg font-bold first:mt-0' {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className='mt-3 mb-2 text-base font-bold first:mt-0' {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className='my-2 text-sm font-bold first:mt-0' {...props} />
                  ),
                  h4: ({ ...props }) => (
                    <h4 className='mt-2 mb-1 text-sm font-semibold first:mt-0' {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong className='font-bold' {...props} />
                  ),
                  em: ({ ...props }) => (
                    <em className='italic' {...props} />
                  ),
                  code: ({ ...props }) => (
                    <code className='rounded-sm bg-gray-100 px-1 py-0.5 text-sm dark:bg-zinc-800' {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote className='my-2 border-l-4 border-gray-300 pl-4 italic dark:border-zinc-600' {...props} />
                  )
                }}
              >
                {note.noteInfo[0]?.content}
              </ReactMarkdown>

              <div className='mt-2'>
                {note.isWeb
                  ? (
                      <>
                        <Button
                          className='cursor-pointer'
                          variant='outline'
                          onClick={() => {
                            setIsModalOpen(true)
                          }}
                          style={{ borderRadius: '25px' }}
                        >
                          參考網站
                        </Button>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                          <DialogContent aria-describedby={undefined} className='gap-0 p-0'>
                            <DialogHeader className='border-b px-6 py-4'>
                              <DialogTitle>參考網站</DialogTitle>
                            </DialogHeader>
                            <div className='flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-6 py-4'>
                              {notes.length > 0
                                ? (
                                    note.referenceData.map((ref, index) => (
                                      <Card
                                        key={ref.id ? ref.id : `ref-${index}`}
                                        className='rounded-xl border-gray-300 bg-white p-0 shadow-lg dark:border-zinc-700 dark:bg-zinc-800'
                                      >
                                        <CardContent className='flex flex-col gap-4 px-4 py-6'>
                                          <div className='flex gap-2'>
                                            <span className='font-bold text-blue-400'>Title: </span>
                                            <span className='font-bold text-red-600'>{ref.title}</span>
                                          </div>
                                          <div className='flex gap-2'>
                                            <span className='font-bold text-blue-400'>Link: </span>
                                            <a
                                              href={ref.path}
                                              target='_blank'
                                              rel='noopener noreferrer'
                                              className='break-all text-green-500 underline hover:underline'
                                            >
                                              {ref.path}
                                            </a>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))
                                  )
                                : (
                                    <div className='mt-4 text-center text-gray-400 dark:text-gray-500'>No Data</div>
                                  )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )
                  : (
                      <Button
                        className='cursor-pointer'
                        variant='outline'
                        onClick={() => { handleReferencesClick(note.recordDetailId) }}
                        style={{ borderRadius: '25px' }}
                      >
                        參考資料
                      </Button>
                    )}
              </div>
            </div>
          </Fragment>
        ))
      }
    </>
  )
}

export default NoteRecord
