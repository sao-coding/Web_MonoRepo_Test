'use client'

import { useAuth } from '@msi/auth'
import { CheckIcon, EditIcon, FileTextIcon, TrashIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'

export interface RecordItem {
  jobId: number
  title: string
  createDate: string
  status: string
}

const LeftSidebar = () => {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [records, setRecords] = useState<RecordItem[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const fetchRecords = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/pcb/history?keyin=${user?.userId}`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        setRecords(data.data)
      }
    }
    catch (err) {
      console.error('獲取紀錄失敗:', err)
      toast.error('獲取紀錄失敗')
    }
    finally {
      setIsLoading(false)
    }
  }

  // 更新搜尋容器標題的 mutation
  const updateMutation = async (id: number, title: string) => {
    if (!title.trim()) {
      toast.error('標題不能為空')
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/pcb/history/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
        }),
      })

      if (res.ok) {
        toast.success('標題更新成功')
        fetchRecords()
        setEditingId(null)
        setEditingTitle('')
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

  // 刪除搜尋容器的 mutation
  const deleteMutation = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/pcb/history/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('紀錄已刪除')
        fetchRecords()
        // 如果刪除的是當前頁面的容器，導航回 /pcb
        const currentId = params?.id ? Number(params.id) : null
        if (currentId && !Number.isNaN(currentId) && currentId === id) {
          router.push('/pcb')
        }
      }
      else {
        toast.error('刪除失敗')
      }
    }
    catch (err) {
      console.error('刪除紀錄失敗:', err)
      toast.error('刪除紀錄失敗')
    }
  }

  const handleEdit = (item: RecordItem) => {
    setEditingId(item.jobId)
    setEditingTitle(item.title)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      fetchRecords()
    }
  }, [user, params])

  return (
    <>
      <div className="p-4 flex items-center space-x-2 border-b">
        <FileTextIcon />
        <span className="font-bold">匯出紀錄</span>
      </div>
      <div className="p-4 overflow-y-auto">
        {isLoading
          ? (
              <Loading text="Loading..." size="large" />
            )
          : records.length > 0
            ? (
                records && records.map(item => (
                  <div key={item.jobId} className="group relative">
                    {editingId === item.jobId
                      ? (
                          <div className="p-2 rounded-md bg-muted">
                            <Input
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              className="mb-2"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateMutation(item.jobId, editingTitle)
                                }
                                else if (e.key === 'Escape') {
                                  handleCancel()
                                }
                              }}
                              autoFocus
                              placeholder="輸入新標題"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateMutation(item.jobId, editingTitle)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateMutation(item.jobId, editingTitle)
                                  }
                                  else if (e.key === 'Escape') {
                                    handleCancel()
                                  }
                                }}
                                autoFocus
                                disabled={editingTitle.length === 0}
                              >
                                <CheckIcon className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <XIcon className="size-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      : (
                          <div className="relative">
                            <Link
                              href={`/pcb/${item.jobId}/preview`}
                              className="min-w-0 flex items-center gap-2 p-2 pr-16 rounded-md hover:bg-muted cursor-pointer transition-colors"
                              title={item.title}
                            >
                              <div className="flex-shrink-0">
                                <FileTextIcon color="limegreen" className="size-5 text-muted-foreground" />
                              </div>
                              <span className="truncate min-w-0">{item.title}</span>
                            </Link>
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(item)}
                                className="h-6 w-6 p-0"
                              >
                                <EditIcon className="size-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast(
                                    '確定要刪除這條記錄嗎？',
                                    {
                                      action: {
                                        label: '確定',
                                        onClick: () => deleteMutation(item.jobId),
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
                                <TrashIcon className="size-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                  </div>
                ))
              )
            : (
                <div className="text-center text-gray-400">
                  尚無任何紀錄
                </div>
              )}
      </div>
    </>
  )
}

export default LeftSidebar
