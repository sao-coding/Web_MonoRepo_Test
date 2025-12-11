'use client'

import { Button } from '@msi/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@msi/ui/components/dialog'
import { Input } from '@msi/ui/components/input'
import {
  CheckIcon,
  Minimize2,
  PencilIcon,
  Trash2,
} from 'lucide-react'
import React, { Fragment, useEffect, useState } from 'react'
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
  selectedRecord,
}) => {
  const [notes, setNotes] = useState<NoteInfo[]>([])
  const [isEditingTitle, setIsEditingTitle] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes/${selectedRecord}/references/detail`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        const formattedNotes = [{
          noteInfo: [data.noteInfo],
          referenceData: data.referenceData,
          isWeb: data.isWeb,
          recordDetailId: data.recordDetailId,
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes/${selectedRecord}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
        }),
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/notes/${selectedRecord}`, {
        method: 'DELETE',
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
              className="border-b px-4 flex items-center justify-between h-14"
            >
              {isEditingTitle === note.noteInfo[0]?.noteId
                ? (
                    <div className="flex items-center space-x-2 w-full" onClick={e => e.stopPropagation()}>
                      <Input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateTitle()
                          }
                          else if (e.key === 'Escape') {
                            setIsEditingTitle(null)
                          }
                        }}
                        autoFocus
                        className="text-sm py-1 w-full"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateTitle()}
                        className="h-8 px-2"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                : (
                    <>
                      <span className="font-bold text-lg">{note.noteInfo[0]?.title}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditTitle(note.noteInfo[0]?.noteId, note.noteInfo[0]?.title)
                          }}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast(
                              '確定要刪除這筆記事紀錄嗎？',
                              {
                                action: {
                                  label: '確定',
                                  onClick: () => deleteNote(),
                                },
                                cancel: {
                                  label: '取消',
                                  onClick: () => { },
                                },
                                position: 'top-center',
                                duration: 10000,
                                style: {
                                  background: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                },
                              },
                            )
                          }}
                        >
                          <Trash2 />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={onToggleViewNote}
                        >
                          <Minimize2 />
                        </Button>
                      </div>
                    </>
                  )}
            </div>
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
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
                {note.noteInfo[0]?.content}
              </ReactMarkdown>

              <div className="mt-2">
                {note.isWeb === true
                  ? (
                      <>
                        <Button
                          className="cursor-pointer"
                          variant="outline"
                          onClick={() => {
                            setIsModalOpen(true)
                          }}
                          style={{ borderRadius: '25px' }}
                        >
                          參考網站
                        </Button>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                          <DialogContent aria-describedby={undefined} className="p-0 gap-0">
                            <DialogHeader className="px-6 py-4 border-b">
                              <DialogTitle>參考網站</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[80vh] overflow-y-auto py-4 px-6 flex flex-col gap-4">
                              {notes.length > 0
                                ? (
                                    note.referenceData.map((ref, index) => (
                                      <div
                                        key={ref.id ? ref.id : `ref-${index}`}
                                        className="px-4 py-6 shadow-lg p-4 rounded-xl border border-gray-300 bg-white w-full flex flex-col gap-4"
                                      >
                                        <div className="flex gap-2">
                                          <span className="font-bold text-blue-400">Title: </span>
                                          <span className="text-red-600 font-bold">{ref.title}</span>
                                        </div>
                                        <div className="flex gap-2">
                                          <span className="font-bold text-blue-400">Link: </span>
                                          <a
                                            href={ref.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'underline' }}
                                            className="text-green-500 hover:underline break-all"
                                          >
                                            {ref.path}
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
                      </>
                    )
                  : (
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={() => handleReferencesClick(note.recordDetailId)}
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
