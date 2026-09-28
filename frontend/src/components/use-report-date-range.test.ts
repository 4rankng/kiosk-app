import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { parseDate } from '@internationalized/date'
import { useReportDateRange } from './use-report-date-range'

/**
 * The report screens used to each own this logic, which is how two copies of
 * the "current month to today" default and the half-picked-range guard could
 * drift apart. These tests pin the contract of the shared version.
 */

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

describe('useReportDateRange', () => {
  it('defaults to the first of the current month through today', async () => {
    const { result } = await renderHook(() => useReportDateRange())

    const firstOfMonth = today().slice(0, 7) + '-01'
    expect(result.current.startDate).toBe(firstOfMonth)
    expect(result.current.endDate).toBe(today())
  })

  it('formats the bounds as YYYY-MM-DD for the report API', async () => {
    const { result } = await renderHook(() => useReportDateRange())

    expect(result.current.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.current.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('accepts a fully picked range and derives both bounds', async () => {
    const { result, act } = await renderHook(() => useReportDateRange())

    await act(() => {
      result.current.onDateRangeChange({ start: parseDate('2026-01-05'), end: parseDate('2026-03-20') })
    })

    expect(result.current.startDate).toBe('2026-01-05')
    expect(result.current.endDate).toBe('2026-03-20')
  })

  it('ignores a half-picked range, because the report query needs both bounds', async () => {
    const { result, act } = await renderHook(() => useReportDateRange())
    const before = { start: result.current.startDate, end: result.current.endDate }

    await act(() => {
      // Only a start date — the picker emits this mid-selection. react-aria's
      // DateRange type does not model a half-picked range, which is exactly why
      // the guard exists, so reach it through a cast.
      result.current.onDateRangeChange({
        start: parseDate('2026-05-01'),
        end: null,
      } as unknown as Parameters<typeof result.current.onDateRangeChange>[0])
    })

    expect(result.current.startDate).toBe(before.start)
    expect(result.current.endDate).toBe(before.end)
  })

  it('ignores a null range', async () => {
    const { result, act } = await renderHook(() => useReportDateRange())
    const before = { start: result.current.startDate, end: result.current.endDate }

    await act(() => {
      result.current.onDateRangeChange(null)
    })

    expect(result.current.startDate).toBe(before.start)
    expect(result.current.endDate).toBe(before.end)
  })

  it('bumps queryTrigger on apply so re-applying the same range still refetches', async () => {
    const { result, act } = await renderHook(() => useReportDateRange())
    const before = result.current.queryTrigger

    await act(() => {
      result.current.applyFilter()
    })

    expect(result.current.queryTrigger).toBe(before + 1)
  })
})
