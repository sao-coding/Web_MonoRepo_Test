import type { Product } from '@/types'

import { create } from 'zustand'

interface ComparisonStore {
  selected: Product[]
  set: (selected: Product[]) => void
  add: (product: Product) => void
  remove: (product: Product) => void
  clear: () => void
}

export const useComparisonStore = create<ComparisonStore>(set => ({
  selected: [],
  set: selected => set({ selected }),
  add: product => set(state => ({ selected: [...state.selected, product] })),
  remove: product =>
    set(state => ({ selected: state.selected.filter(p => p.F_SeqNo !== product.F_SeqNo) })),
  clear: () => set({ selected: [] }),
}))
