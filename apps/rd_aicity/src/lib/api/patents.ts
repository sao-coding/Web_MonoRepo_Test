import type { PatentFilterData, PatentFilterMeta } from '@/app/(AI_City)/patents/_types'
import type { ApiResponse } from '@/types/api'
import Cookies from 'js-cookie'

// 創建搜尋容器的請求類型
export interface CreateSearchContainerRequest {
  title?: string
  keyword?: string
  patentTypes?: string[]
  caseTypes?: string[]
  years?: number[]
  countries?: string[]
}

// 更新搜尋容器標題的請求類型
export interface UpdateSearchContainerRequest {
  title: string
}

// 搜尋容器回應類型
export interface SearchContainerResponse {
  seqNo: number
  title: string
  keyword: string
  createDate: string
  conditions: Array<{
    type: string
    value: string
  }>
}

// 更新搜尋容器回應類型
export interface UpdateSearchContainerResponse {
  seqNo: number
  title: string
  keyword: string
  createDate: string
  updateTime: string
  keyinUser: string
}

export const fetchPatentFilters = async (): Promise<ApiResponse<PatentFilterData, PatentFilterMeta>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/AiCityPatents/filter`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 創建搜尋容器
export const createSearchContainer = async (
  data: CreateSearchContainerRequest,
): Promise<ApiResponse<SearchContainerResponse>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/aicitypatents/search-containers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 更新搜尋容器標題
export const updateSearchContainer = async (
  id: number,
  data: UpdateSearchContainerRequest,
): Promise<ApiResponse<UpdateSearchContainerResponse>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/AiCityPatents/search-containers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 刪除搜尋容器
export const deleteSearchContainer = async (
  id: number,
): Promise<ApiResponse<{ seqNo: number }>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/AiCityPatents/search-containers/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
