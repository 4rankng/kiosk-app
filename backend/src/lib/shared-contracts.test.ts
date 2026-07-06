import { describe, expect, it } from 'vitest'
import {
  customerCreateSchema,
  orderCreateSchema,
  productCreateSchema,
} from '@kiosk/shared'
import { isPgError } from './pg-error.js'

/**
 * DB-free contract tests for the @kiosk/shared input schemas. Both the frontend
 * (form/mutation payloads) and the backend (route validation) depend on these
 * shapes, so locking their behavior here prevents cross-app drift.
 */
describe('shared input contracts (@kiosk/shared)', () => {
  describe('orderCreateSchema', () => {
    const validBase = {
      customerId: '00000000-0000-0000-0000-000000000001',
      businessEntityId: '00000000-0000-0000-0000-000000000002',
      items: [{ productId: '00000000-0000-0000-0000-000000000003', quantity: 2 }],
    }

    it('applies defaults for optional fields', () => {
      const parsed = orderCreateSchema.parse(validBase)
      expect(parsed.discount).toBe(0)
      expect(parsed.paidAmount).toBe(0)
      expect(parsed.paymentMethod).toBe('cash')
      expect(parsed.generateInvoice).toBe(true)
    })

    it('rejects an empty items array (min 1)', () => {
      expect(() => orderCreateSchema.parse({ ...validBase, items: [] })).toThrow()
    })

    it('rejects a non-uuid customerId', () => {
      expect(() => orderCreateSchema.parse({ ...validBase, customerId: 'not-a-uuid' })).toThrow()
    })

    it('rejects a non-positive quantity', () => {
      expect(() =>
        orderCreateSchema.parse({
          ...validBase,
          items: [{ productId: '00000000-0000-0000-0000-000000000003', quantity: 0 }],
        })
      ).toThrow()
    })
  })

  describe('customerCreateSchema', () => {
    it('rejects a missing companyId', () => {
      expect(() => customerCreateSchema.parse({ code: 'C001', name: 'Jane' })).toThrow()
    })

    it('accepts a valid customer', () => {
      const parsed = customerCreateSchema.parse({
        code: 'C001',
        name: 'Jane',
        companyId: '00000000-0000-0000-0000-000000000001',
      })
      expect(parsed.code).toBe('C001')
    })
  })

  describe('productCreateSchema', () => {
    it('coerces numeric fields from strings and applies the stock default', () => {
      const parsed = productCreateSchema.parse({
        code: 'P1',
        name: 'Widget',
        purchasePrice: '10',
        defaultSalePrice: '15',
      })
      expect(parsed.purchasePrice).toBe(10)
      expect(parsed.defaultSalePrice).toBe(15)
      expect(parsed.stockQuantity).toBe(0)
      expect(parsed.description).toBe('')
    })

    it('rejects negative prices', () => {
      expect(() =>
        productCreateSchema.parse({
          code: 'P1',
          name: 'X',
          purchasePrice: -5,
          defaultSalePrice: 10,
        })
      ).toThrow()
    })
  })
})

describe('isPgError', () => {
  it('narrows objects with a string `.code`', () => {
    expect(isPgError({ code: '23503' })).toBe(true)
    // non-string code is not matched (guards the downstream `e.code ===` compare)
    expect(isPgError({ code: 23503 })).toBe(false)
    expect(isPgError(new Error('boom'))).toBe(false)
    expect(isPgError(null)).toBe(false)
    expect(isPgError(undefined)).toBe(false)
    expect(isPgError('23503')).toBe(false)
  })

  it('type-narrows so `.code` is accessible', () => {
    const e: unknown = { code: '23505' }
    if (isPgError(e)) {
      expect(e.code).toBe('23505')
    }
  })
})
