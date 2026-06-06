import useDialogState from '@/hooks/use-dialog-state'
import type { Company } from '@/types/company'
import { createContext, useContext, useState } from 'react'

type CompaniesContextType = {
  open: ReturnType<typeof useDialogState>[0]
  setOpen: ReturnType<typeof useDialogState>[1]
  selectedCompany: Company | null
  setSelectedCompany: (company: Company | null) => void
}

const CompaniesContext = createContext<CompaniesContextType | null>(null)

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  return (
    <CompaniesContext.Provider value={{ open, setOpen, selectedCompany, setSelectedCompany }}>
      {children}
    </CompaniesContext.Provider>
  )
}

export function useCompaniesContext() {
  const context = useContext(CompaniesContext)
  if (!context) throw new Error('useCompaniesContext must be used within CompaniesProvider')
  return context
}
