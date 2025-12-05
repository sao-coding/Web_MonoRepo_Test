// 階段枚舉
export enum MappingStage {
  CATEGORY = 'category',
  SPECIFICATION = 'specification',
}

// 規格類別映射
export interface CategoryMapping {
  [msiCategory: string]: string // MSI類別 -> 品牌類別
}

// 具體規格映射
export interface SpecificationMapping {
  [categoryPair: string]: { // "msiCategory->brandCategory"
    [msiSpec: string]: string[] // MSI具體規格 -> 品牌具體規格列表
  }
}

// 兩階段映射歷史
export interface TwoStageMappingHistory {
  [brandId: string]: {
    categoryMappings: CategoryMapping
    specificationMappings: SpecificationMapping
  }
}

// 當前映射狀態
export interface MappingState {
  stage: MappingStage
  selectedCategoryPair?: string // "msiCategory->brandCategory"
  categoryMappings: CategoryMapping
  specificationMappings: SpecificationMapping
}

// 組件 Props
export interface TwoStageMappingProps {
  brands: Brand[]
  products: AdminProduct[]
  msiCategories: string[]
  brandSpecifications: BrandSpecification[]
  onMappingComplete?: (mappings: TwoStageMappingHistory) => void
}

// 品牌相關類型
export interface Brand {
  id: string
  name: string
  logo?: string
}

// 產品相關類型
export interface AdminProduct {
  id: string
  name: string
  brandId: string
}

// 品牌規格類型
export interface BrandSpecification {
  category: string
  items: string[]
}

// 映射相關類型
export interface MappedItems {
  [msiSpec: string]: string[]
}

export interface BrandMappingHistory {
  [brandId: string]: MappedItems
}

// 拖拉相關類型
export interface DragItem {
  type: string
  item: string
  category: string
}

// 組件 Props 類型
export interface BrandSelectorProps {
  brands: Brand[]
  products: AdminProduct[]
  onBrandChange?: (brandId: string, brandName?: string) => void
  onProductChange?: (productId: string, productName?: string) => void
  brandMappingHistory?: TwoStageMappingHistory | Record<string, any>
  usedBrandSpecs?: Set<string>
}

export interface BrandSpecificationsProps {
  brandName: string
  productName: string
  specifications: BrandSpecification[]
  usedBrandSpecs?: Set<string>
  brandId?: string // 新增 brandId 屬性
  productId?: string // 新增 productId 屬性
  currentStage?: 'first' | 'second'
  showAll?: boolean
  refreshKey?: number // 新增：刷新控制鍵
  onCompanyIdUpdate?: (brandId: string, companyId: number) => void // 新增 companyId 更新回調
  onMappingCompanyIdUpdate?: (msiSpecOrBrandSpec: string, companyIdOrBrandSpec?: number | string, companyId?: number) => void // 兼容新舊簽名
}

export interface SpecificationListProps {
  title: string
  subtitle: string
  specifications: string[]
  mappedItems?: Record<string, string[]>
  onRemoveMapping?: (msiSpec: string, brandSpec: string) => void
  onEnterSecondStage?: (msiSpec: string) => void
}

// 更新 DroppableSpecItemProps 類型定義
export interface DroppableSpecItemProps {
  spec: string
  mappedItems: string[]
  onRemoveMapping?: (msiSpec: string, brandSpec: string) => void
}

export interface DraggableSpecItemProps {
  item: string
  category: string
  index: number
  isDragging?: boolean
}
