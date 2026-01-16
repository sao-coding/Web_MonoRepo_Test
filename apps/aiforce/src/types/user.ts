export interface User {
  DeptID: number
  F_OrgID: string
  WorkID: string
  DeptName: string
  Title: string | null
  EnglishName: string
  Valide_ENAME: string
  ChineseName: string
  ExistKey: boolean
  Email: string
  Tel: string | null
  Arrive_Date: string
  Leave_Date: string | null
  WebFlowBoss: string
  WebFlowBossName: string
  WebFlowBossTel: string
  Region: string
}

export interface UserJwt {
  id: string
  name: string
  email: string
  exp: number
}
