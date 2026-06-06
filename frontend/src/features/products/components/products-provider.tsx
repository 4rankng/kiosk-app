import useDialogState from '@/hooks/use-dialog-state'
import type { Product } from '@/types'
import { createContext, useContext, useState } from 'react'

type ProductsContextType = {
  open: ReturnType<typeof useDialogState>[0]
  setOpen: ReturnType<typeof useDialogState>[1]
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
}

const ProductsContext = createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  return (
    <ProductsContext.Provider value={{ open, setOpen, selectedProduct, setSelectedProduct }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProductsContext() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProductsContext must be used within ProductsProvider')
  return ctx
}
