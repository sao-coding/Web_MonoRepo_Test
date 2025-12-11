import type { Patent } from '.'

export interface SearchContainer {
  role: string
  type: string
  content: Patent[]
  createdAt: string
  updatedAt: string
}
