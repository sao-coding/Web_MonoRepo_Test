export interface PatentFilterMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  searchContainer: SearchContainer
}

export interface SearchConditions {
  patentTypes: string[]
  caseTypes: string[]
  years: number[]
  countries: string[]
}

export interface SearchContainer {
  seqNo: number
  title: string
  keyword: string
  createDate: string
  keyinUser: string
  conditions: SearchConditions
}
export interface PatentFilterData {
  patentTypes: string[]
  caseTypes: string[]
  years: number[]
  countries: string[]
}
