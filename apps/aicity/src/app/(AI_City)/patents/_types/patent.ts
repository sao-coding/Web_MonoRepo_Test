export interface PatentApplicant {
  sequence: number
  nameZh: string
  nameEn: string
  country: string
}

export interface PatentInventor {
  sequence: number
  nameZh: string
  nameEn: string
  country: string
}

export interface PatentPriorityClaim {
  sequence: number
  country: string
  docNumber: string
  date: string
}

export interface Compare {
  FPn: string
  FPnLink: string
}

export interface Patent {
  role: string
  type: string
  id: number
  seqNo: number
  patentNumber: string
  titleZh: string
  titleEn: string
  abstractZh: string
  patentType: string
  caseType: string
  applicationNumber: string
  applicationDate: string
  publicationDate: string
  createdDate: string
  aiSummaries: string
  questions?: string[]
  applicants: PatentApplicant[]
  inventors: PatentInventor[]
  priorityClaims: PatentPriorityClaim[]
  rawContent?: string // 用於存儲純 string 的 content
  compare?: Compare[]
  fullAiResponse?: string

}
