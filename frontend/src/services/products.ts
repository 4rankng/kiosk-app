import type { Product } from '@/types/product'
import { products } from '@/mock/products'
import { sleep } from '@/lib/utils'

export async function getProducts(): Promise<Product[]> {
  await sleep(300)
  return [...products]
}

export async function getProductById(id: string): Promise<Product | undefined> {
  await sleep(200)
  return products.find((p) => p.id === id)
}

export async function searchProducts(query: string): Promise<Product[]> {
  await sleep(200)
  const q = query.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  )
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  await sleep(500)
  const newProduct: Product = {
    ...data,
    id: `p${Date.now()}`,
  }
  products.push(newProduct)
  return newProduct
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  await sleep(500)
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Product not found')
  products[idx] = { ...products[idx], ...data }
  return products[idx]
}

export async function deleteProduct(id: string): Promise<void> {
  await sleep(300)
  const idx = products.findIndex((p) => p.id === id)
  if (idx !== -1) products.splice(idx, 1)
}
