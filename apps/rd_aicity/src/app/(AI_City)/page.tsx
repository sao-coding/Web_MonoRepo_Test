import { HomeIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import AppCard from './AppCard'

export default function Home() {
  return (
    <div className="container mx-auto px-4 mb-6">
      <div className="pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={process.env.NEXT_PUBLIC_RD_SITE_URL}>研發</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="flex items-center">
              <BreadcrumbLink
                href="/AI_City"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <HomeIcon className="h-4 w-4 mr-1" />
                AI_City
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main content area - 使用固定布局 */}
      <div className="flex-1 mt-4">
        <div className="flex flex-row">
          {/* 左側選單區塊 - 縮小寬度 */}
          <div className="w-72 flex-shrink-0 mt-16">
            <div className="mb-4">
              <div className="text-lg text-center font-bold text-gray-600 mb-2">
                類別
              </div>
              <div className="bg-gray-900 w-full text-white text-center py-3 rounded-full mb-4 cursor-pointer">
                應用程式
              </div>
              <div className="bg-gray-200 w-full text-gray-400 text-center py-3 rounded-full mb-4 cursor-not-allowed">
                模型服務
              </div>
              <div className="block w-full bg-gray-200 text-gray-400 text-center py-3 rounded-full cursor-not-allowed">
                後合
              </div>
            </div>
          </div>

          {/* 右側卡片區塊 - 增加寬度 */}
          <div className="flex-grow ml-6">
            <AppCard />
          </div>
        </div>
      </div>
    </div>
  )
}
