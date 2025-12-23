'use client'

import { Button } from '@msi/ui/components/button'
import { Card, CardContent } from '@msi/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@msi/ui/components/dialog'
import { getAppConfig } from '@msi/config/env'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@msi/ui/components/dropdown-menu'
import { Loading } from '@msi/ui/components/loading'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface RefItem {
  id: number
  webPath: string
  webTitle: string
  qaText: string
  scores: number
  method: string
  isWeb: boolean
  language: string
  createDate: string
  used: boolean
}

interface SpecItem {
  specName: string
  specValue: string
  masterTable: string
  masterId: string
}

const References = () => {
  const { id: recordDetailId } = useParams<{ id: string }>()
  const [selectedLan, setSelectedLan] = useState<string>('English')
  const [lan, setLan] = useState<string>('en')
  const [ref, setRef] = useState<RefItem[]>([])
  const [spec, setSpec] = useState<SpecItem[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [productInfo, setProductInfo] = useState<{
    productId: string
    productTitle: string
    productModelName: string
    productLine: string
    productPicture: string | null
  }>({
    productId: '',
    productTitle: '',
    productModelName: '',
    productLine: '',
    productPicture: null,
  })

  const fetchReferences = async (recordDetailId: number) => {
    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/reference-data/${recordDetailId}`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        const dataRef = data.data.referenceData
        setRef(dataRef)
      }
      else {
        toast.error('Failed to fetch Reference.')
        console.error(`Failed to fetch references. Status: ${res.status}`)
      }
    }
    catch (err) {
      toast.error('An error occurred while fetching Reference.')
      console.error('參考資料--獲取失敗:', err)
    }
    finally {
      setIsLoading(false)
    }
  }

  const fetchSpec = async (mktName: string, language: string) => {
    setProductInfo({
      productId: '',
      productTitle: '',
      productModelName: '',
      productLine: '',
      productPicture: null,
    })
    try {
      const res = await fetch(`${getAppConfig().NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicity/productspec/reference/${mktName}/specifications?language=${language}`, {
        method: 'GET',
      })
      if (res.ok) {
        const data = await res.json()
        setProductInfo(data.data.productInfo)
        setSpec(data.data.specifications)
      }
      else {
        toast.error('Failed to fetch product spec.')
        console.error(`Failed to fetch Spec. Status: ${res.status}`)
      }
    }
    catch (err) {
      toast.error('An error occurred while fetching Spec.')
      console.error('產品規格--獲取失敗:', err)
    }
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (recordDetailId) {
      fetchReferences(Number(recordDetailId))
    }
  }, [recordDetailId])

  const handleLinkClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const targetLink = (event.target as HTMLElement).closest('a.product-link')

    if (targetLink) {
      event.preventDefault()

      const productName = targetLink.getAttribute('data-product')
      if (productName) {
        setModalTitle(productName)
        setIsModalOpen(true)
        fetchSpec(productName, lan)
      }
    }
  }

  return (
    <div className="bg-blue-50 dark:bg-zinc-900">
      <div className="max-w-[1300px] bg-white dark:bg-zinc-950 w-full mx-auto relative overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sticky top-[10px] left-[10px] z-50 text-left border-gray-200 dark:border-zinc-700 w-[100px]">
              {selectedLan}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem
              onSelect={() => {
                setSelectedLan('繁體中文')
                setLan('cn')
              }}
            >
              繁體中文
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                setSelectedLan('English')
                setLan('en')
              }}
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                setSelectedLan('简体中文')
                setLan('cs')
              }}
            >
              简体中文
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="max-w-6xl mx-auto flex flex-col gap-4 py-16 px-4">
          {isLoading
            ? (
                <Loading text="Loading..." size="large" />
              )
            : ref.length > 0
              ? (
                  ref.map(ref => (
                    <Card
                      key={ref.id}
                      onClick={handleLinkClick}
                      className="shadow-lg p-0 rounded-xl border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    >
                      <CardContent className="px-16 py-6 flex flex-col gap-6">
                        <div
                          className="text-lg font-bold block"
                          dangerouslySetInnerHTML={{ __html: ref.qaText }}
                        />
                      </CardContent>
                    </Card>
                  ))
                )
              : (
                  <div className="text-center text-gray-400 dark:text-gray-500 col-span-full text-lg">
                    No data
                  </div>
                )}

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent aria-describedby={undefined} className="p-0 gap-0">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle>{modalTitle}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[80vh] overflow-y-auto py-4 px-6">
                <div className="flex justify-center mb-6">
                  {productInfo.productPicture && (
                    <img
                      src={productInfo.productPicture}
                      className="w-1/2"
                      alt=""
                    />
                  )}
                </div>
                {spec.length > 0
                  ? (
                      <ul className="flex flex-col gap-2">
                        {spec.map((spec, index) => (
                          <li key={index}>
                            <div className="inline-flex gap-2">
                              ◆
                              <div>
                                <div className="font-bold whitespace-nowrap inline-block" style={{ float: 'left' }} dangerouslySetInnerHTML={{ __html: (`${spec?.specName}：`) || '' }}></div>
                                <div className="inline-block" dangerouslySetInnerHTML={{ __html: spec?.specValue || '' }}></div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )
                  : (
                      <div className="text-center mt-4 text-gray-400 dark:text-gray-500">No Data</div>
                    )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export default References
