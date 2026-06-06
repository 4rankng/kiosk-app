import useDialogState from '@/hooks/use-dialog-state'
import type { Customer } from '@/types'
import { createContext, useContext, useState } from 'react'

type CustomersContextType = {
  open: ReturnType<typeof useDialogState>[0]
  setOpen: ReturnType<typeof useDialogState>[1]
  selectedCustomer: Customer | null
  setSelectedCustomer: (customer: Customer | null) => void
}

const CustomersContext = createContext<CustomersContextType | null>(null)

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  return (
    <CustomersContext.Provider value={{ open, setOpen, selectedCustomer, setSelectedCustomer }}>
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomersContext() {
  const ctx = useContext(CustomersContext)
  if (!ctx) throw new Error('useCustomersContext must be used within CustomersProvider')
  return ctx
}
