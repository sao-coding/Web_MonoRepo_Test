export interface AppType {
  seqNo: number
  sysName: string
  category: string
  sysImgUrl: string
  sysUrl: string
  isShow: string
  isFavorite: boolean
  sourceTable: string
  infos: AppInfoType[]
}

export interface AppInfoType {
  type: string
  name: string
  value: string
}
