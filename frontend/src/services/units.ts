import { units, type Unit } from '@/mock/units'
import { sleep } from '@/lib/utils'

export async function getUnits(): Promise<Unit[]> {
  await sleep(200)
  return [...units]
}

export async function createUnit(name: string): Promise<Unit> {
  await sleep(200)
  const newUnit: Unit = { id: `unit-${units.length + 1}`, name }
  units.push(newUnit)
  return newUnit
}
