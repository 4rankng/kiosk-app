import useDialogState from '@/hooks/use-dialog-state'
import type { Invoice } from '@/types'
import { createContext, useContext, useState } from 'react'

type InvoicesContextType = {
  open: ReturnType<typeof useDialogState>[0]
  setOpen: ReturnType<typeof useDialogState>[1]
  selectedInvoice: Invoice | null
  setSelectedInvoice: (invoice: Invoice | null) => void
}

const InvoicesContext = createContext<InvoicesContextType | null>(null)

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState()
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  return (
    <InvoicesContext.Provider value={{ open, setOpen, selectedInvoice, setSelectedInvoice }}>
      {children}
    </InvoicesContext.Provider>
  )
}

export function useInvoicesContext() {
  const context = useContext(InvoicesContext)
  if (!context) throw new Error('useInvoicesContext must be used within InvoicesProvider')
  return context
}
