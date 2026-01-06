export interface AppType {
  F_SeqNo: number
  F_CreateTime: string | Date
  F_UpdateTime: string | Date
  F_Stat: string
  app_id: string
  name: string
  app_folder?: string | null
  description?: string | null
  version?: string | null
  logo?: string | null
  link?: string | null
  // releases 欄位已從API查詢中移除
  update_required?: boolean | null
  app_type: number
}
