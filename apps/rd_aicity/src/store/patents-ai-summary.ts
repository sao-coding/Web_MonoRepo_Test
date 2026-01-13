import type { Patent, SearchContainer } from '@/app/(AI_City)/patents/_types'
import { create } from 'zustand'

// 定義整個 Zustand Store 的狀態 (State) 和動作 (Actions) 的藍圖
export interface PatentsAiSummaryStore {
  searchContainer: SearchContainer // 儲存當前正在檢視或聊天的搜尋容器中繼資料
  patents: Patent[] // 儲存從 API 獲取的專利列表，用於顯示在卡片上
  setSearchContainer: (container: SearchContainer) => void // 設定搜尋容器中繼資料
  addPatent: (patent: Patent) => void // 將單一專利物件添加到 patents 列表
  // 流式更新摘要內容 (用於即時顯示)
  updatePatentAiSummaryStream: (id: number, aiSummary: string) => void
  updatePatentAiQuestions: (id: number, questions?: string[]) => void
  updateFirstPatent: (id: number, questions: string[]) => void
  updateLastPatentContent: (id: number, rawContent?: string[]) => void
  setPatents: (patents: Patent[]) => void // 覆蓋整個 patents 列表（用於 API 獲取資料後）
  clear: () => void // 清除所有專利和 AI 摘要狀態
  firstPatentData: any // 新增：保存第一筆專利的數據
  setFirstPatentData: (data: any) => void // 新增方法
}

// 創建並導出 Zustand Store
export const usePatentsAiSummaryStore = create<PatentsAiSummaryStore>(set => ({
  patents: [], // 專利列表初始為空陣列
  searchContainer: { // 搜尋容器的初始值
    seqNo: 0, // 序列號
    title: '', // 標題
    keyword: '', // 關鍵字
    createDate: '', // 創建日期
    keyinUser: '', // 輸入用戶
    conditions: { // 搜尋條件的初始值
      patentTypes: [], // 專利類型列表
      caseTypes: [], // 案件類型列表
      years: [], // 年份列表
      countries: [], // 國家列表
    },
  },
  firstPatentData: {
    id: null,
    questions: null,
  }, // 新增：保存第一筆專利的數據
  setFirstPatentData: data => set({ firstPatentData: data }), // 新增方法
  setSearchContainer: container => set({ searchContainer: container }), // 覆蓋 searchContainer 狀態
  addPatent: patent => set((state) => { // 將單一專利物件添加到 patents 列表
    // 檢查傳入的 patent 物件是否為 'compare' 類型
    const newPatent = (patent as any).type === 'compare'
      ? patent // 如果是 'compare'，直接使用傳入的物件，不添加 rawContent: ''
      : { rawContent: '', ...patent } // 其他情況 (如 AI 訊息)，添加 rawContent 預設值

    return { patents: [...state.patents, newPatent] }
  }),
  // 流式更新摘要內容的實作
  updatePatentAiSummaryStream: (id, aiSummary) => set(state => ({
    patents: state.patents.map(patent =>
      patent.id === id
        ? {
            ...patent,
            // 確保 aiSummaries 預設為空字串並附加內容
            aiSummaries: (patent.aiSummaries || '') + aiSummary,
          }
        : patent,
    ),
  })),
  updatePatentAiQuestions: (id, questions?) => set(state => ({
    patents: state.patents.map(patent =>
      patent.id === id
        ? { ...patent, questions: questions || [] }
        : patent,
    ),
  })),
  updateFirstPatent: (id, questions) => set(state => ({
    patents: state.patents.map(patent =>
      patent.id === id
        ? { ...patent, questions }
        : patent,
    ),
  })),
  updateLastPatentContent: (id, content) => set(state => ({
    patents: state.patents.map(patent =>
      patent.id === id
        ? {
            ...patent,
            rawContent: (patent.rawContent || '') + content,
          }
        : patent,
    ),
  })),
  setPatents: patents => set({
    patents: patents.map((patent) => {
      // 確保從 API 獲取的資料中，'compare' 類型不會被加上 rawContent: ''
      const newPatent = (patent as any).type === 'compare'
        ? patent
        : { rawContent: '', ...patent }

      return newPatent
    }),
  }),
  clear: () => set({ // 重置狀態
    searchContainer: {
      seqNo: 0,
      title: '',
      keyword: '',
      createDate: '',
      keyinUser: '',
      conditions: {
        patentTypes: [],
        caseTypes: [],
        years: [],
        countries: [],
      },
    },
    patents: [],
  }),
}))
