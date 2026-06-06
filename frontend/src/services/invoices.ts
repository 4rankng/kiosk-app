import type { Invoice } from '@/types/invoice'
import { invoices } from '@/mock/invoices'
import { sleep } from '@/lib/utils'

export async function getInvoices(): Promise<Invoice[]> {
  await sleep(300)
  return [...invoices]
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  await sleep(200)
  return invoices.find((inv) => inv.id === id)
}
