'use client'

import type { SearchContainer } from '../_types/patent-filter'
import type { ApiResponse } from '@/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { CheckIcon, FileTextIcon, PencilIcon, TrashIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/ui/left-sidebar'
import { deleteSearchContainer, updateSearchContainer } from '@/lib/api/patents'
import { usePatentsAiSummaryStore } from '@/store/patents-ai-summary'

const LeftSidebar = () => {
  const { clear } = usePatentsAiSummaryStore()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const { data } = useQuery<ApiResponse<SearchContainer[]>>({
    queryKey: ['patentSearchHistory'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/AiCityPatents/search-containers?limit=100000000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    },
  })

  // 更新搜尋容器標題的 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: number, title: string }) =>
      updateSearchContainer(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patentSearchHistory'] })
      toast.success('標題更新成功')
      setEditingId(null)
      setEditingTitle('')
    },
    onError: (error) => {
      toast.error(`標題更新失敗：${error.message}`)
    },
  })

  // 刪除搜尋容器的 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSearchContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patentSearchHistory'] })
      toast.success('搜尋記錄刪除成功')
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`)
    },
  })

  const handleClearSearchParams = () => {
    // 只保留 base path，不帶任何 query string
    clear()
    router.push('/patents')
  }

  const handleEdit = (item: SearchContainer) => {
    setEditingId(item.seqNo)
    setEditingTitle(item.title)
  }

  const handleSave = () => {
    if (editingId && editingTitle.trim()) {
      updateMutation.mutate({ id: editingId, title: editingTitle.trim() })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const handleDelete = (deleteId: number) => {
    setDeleteTargetId(deleteId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId, {
        onSuccess: () => {
          // 如果刪除的是當前頁面的容器，導航回 /patents
          if (id && Number.parseInt(id) === deleteTargetId) {
            router.push('/patents')
          }
        },
      })
    }
    setDeleteDialogOpen(false)
    setDeleteTargetId(null)
  }

  return (
    <>
      <Sidebar
        showNewButton={true}
        NewButtonContent="新增搜尋"
        showNoteButton={false}
        onNewButtonClick={handleClearSearchParams}
        onNoteButtonClick={() => {}}
        RecordsSectionLabel="記錄"
        showRecordsSection={true}
        recordsSectionContent={
          data && data.data.map(item => (
            <div key={item.seqNo} className="group relative">
              {editingId === item.seqNo
                ? (
                    <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-900">
                      <Input
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        className="mb-2"
                        placeholder="輸入新標題"
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                        >
                          <CheckIcon className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateMutation.isPending}
                        >
                          <XIcon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )
                : (
                    <div className="relative">
                      <Link
                        href={`/patents/${item.seqNo}/chat`}
                        className={`${id === String(item.seqNo)
                          ? 'bg-gray-100 dark:bg-gray-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-950'
                        } min-w-0 flex whitespace-nowrap break-all items-center gap-2 p-2 rounded-md cursor-pointer transition-colors`}
                        title={item.title}
                      >
                        <div className="flex-shrink-0">
                          <FileTextIcon className="size-4" />
                        </div>
                        <span className="truncate min-w-0">{item.title}</span>
                      </Link>
                      <div className={`${id !== String(item.seqNo) && 'opacity-0 group-hover:opacity-100 transition-opacity'}
                        from-gray-100 dark:from-gray-900 bg-linear-to-l from-80% to-transparent absolute top-2 pl-4 right-2 flex gap-1`}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-800"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.seqNo)}
                          className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteMutation.isPending}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
            </div>
          ))
        }
      >
      </Sidebar>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除這個搜尋記錄嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default LeftSidebar
