/**
 * Shared price-list utilities — used by products and orders services.
 * General price list ID is cached in Redis for 5 minutes.
 */
import { eq, and, isNull, inArray } from 'drizzle-orm'
import { db } from '../config/db.js'
import { priceLists, priceListItems } from '../db/schema/index.js'
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js'

const GENERAL_PL_CACHE_KEY = 'cache:general_price_list_id'
const GENERAL_PL_CACHE_TTL = 300 // 5 minutes

/** Get the ID of the general (company-less) default price list. Cached in Redis. */
export async function getGeneralPriceListId(): Promise<string | null> {
  const cached = await cacheGet<string>(GENERAL_PL_CACHE_KEY)
  if (cached) return cached

  const [row] = await db
    .select({ id: priceLists.id })
    .from(priceLists)
    .where(and(isNull(priceLists.companyId), eq(priceLists.isDefault, true)))
    .limit(1)
  if (row) {
    await cacheSet(GENERAL_PL_CACHE_KEY, row.id, GENERAL_PL_CACHE_TTL)
    return row.id
  }
  const [any] = await db
    .select({ id: priceLists.id })
    .from(priceLists)
    .where(isNull(priceLists.companyId))
    .limit(1)
  if (any) {
    await cacheSet(GENERAL_PL_CACHE_KEY, any.id, GENERAL_PL_CACHE_TTL)
    return any.id
  }
  return null
}

/** Invalidate the cached general price list ID. Call on price-list mutations. */
export async function invalidateGeneralPriceListCache(): Promise<void> {
  await cacheDel(GENERAL_PL_CACHE_KEY)
}

/** Resolve effective prices for a list of products, applying price list overrides. */
export async function resolveEffectivePrices(
  productIds: string[],
  companyPriceListId: string | null
): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (productIds.length === 0) return map

  // 1) Pull general PL prices
  const generalId = await getGeneralPriceListId()
  if (generalId) {
    const generalItems = await db
      .select({ productId: priceListItems.productId, price: priceListItems.customPrice })
      .from(priceListItems)
      .where(and(eq(priceListItems.priceListId, generalId), inArray(priceListItems.productId, productIds)))
    for (const i of generalItems) map.set(i.productId, Number(i.price))
  }

  // 2) Override with company-specific PL
  if (companyPriceListId && companyPriceListId !== generalId) {
    const customItems = await db
      .select({ productId: priceListItems.productId, price: priceListItems.customPrice })
      .from(priceListItems)
      .where(
        and(eq(priceListItems.priceListId, companyPriceListId), inArray(priceListItems.productId, productIds))
      )
    for (const i of customItems) map.set(i.productId, Number(i.price))
  }

  return map
}
