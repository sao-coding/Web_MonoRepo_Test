/**
 * 麵包屑路徑標籤配置
 *
 * 用於將 URL 路徑段轉換為中文顯示名稱。
 * PageBreadcrumb 組件會自動讀取當前路徑，並從此配置中查找對應的中文標籤。
 *
 * @example
 * URL: /pcb/analysis/usagerate
 * 顯示: 首頁 > 系統數據分析 > 使用率分析
 *
 * 若要新增路徑標籤，只需在此物件中加入 "路徑段: 顯示名稱" 即可。
 */
export const BREADCRUMB_LABELS: { [key: string]: string } = {
  admin: '後台',
  posts: '文章列表',
  categories: '分類',
  dashboard: '儀表板',
  editor: '編輯器',
  exports: '匯出',
  analysis: '系統數據分析',
  usagerate: '使用率分析',
  clickrate: '點擊率分析',
  pcb: 'PCB',
}
