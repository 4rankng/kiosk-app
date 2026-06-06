import type { Customer } from '@/types/customer'
import { customers } from '@/mock/customers'
import { sleep } from '@/lib/utils'

export async function getCustomers(): Promise<Customer[]> {
  await sleep(300)
  return [...customers]
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  await sleep(200)
  return customers.find((c) => c.id === id)
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  await sleep(200)
  const q = query.toLowerCase()
  return customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.phone.includes(q)
  )
}

export async function createCustomer(data: Omit<Customer, 'id'>): Promise<Customer> {
  await sleep(500)
  const newCustomer: Customer = {
    ...data,
    id: `cu${Date.now()}`,
  }
  customers.push(newCustomer)
  return newCustomer
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  await sleep(500)
  const idx = customers.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Customer not found')
  customers[idx] = { ...customers[idx], ...data }
  return customers[idx]
}

export async function deleteCustomer(id: string): Promise<void> {
  await sleep(300)
  const idx = customers.findIndex((c) => c.id === id)
  if (idx !== -1) customers.splice(idx, 1)
}
