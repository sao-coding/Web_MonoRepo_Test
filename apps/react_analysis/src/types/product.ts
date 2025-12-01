export interface Product {
  F_Product: string
  F_Vendor: string
  F_GPU_Image_URL: string
  F_Desc?: string
  F_SeqNo: string
  ReleaseDate: string
  ProcessSize?: string
  Architecture?: string
  MemoryType?: string
}
// 篩選項項目的類型
export interface FilterItem {
  id: string
  name: string
}

// 篩選項的類型
export interface FilterOption {
  type: string
  name: string
  icon?:
    | string
    | React.ForwardRefExoticComponent<
        Omit<React.SVGProps<SVGSVGElement>, 'ref'> & React.RefAttributes<SVGSVGElement>
      >
  items: FilterItem[]
}
