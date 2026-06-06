import { categories, type Category } from '@/mock/categories'
import { sleep } from '@/lib/utils'

export async function getCategories(): Promise<Category[]> {
  await sleep(200)
  return [...categories]
}

export async function createCategory(name: string): Promise<Category> {
  await sleep(200)
  const newCat: Category = { id: `cat-${categories.length + 1}`, name }
  categories.push(newCat)
  return newCat
}
