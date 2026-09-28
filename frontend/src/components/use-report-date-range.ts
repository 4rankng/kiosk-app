import { useState } from 'react'
import { parseDate } from '@internationalized/date'
import type { DateRange } from 'react-aria-components'

export interface ReportDateRangeState {
  dateRange: DateRange
  /** Report API bound, `YYYY-MM-DD`. */
  startDate: string
  /** Report API bound, `YYYY-MM-DD`. */
  endDate: string
  /** Bump to force a refetch when the user re-applies an unchanged range. */
  queryTrigger: number
  onDateRangeChange: (range: DateRange | null) => void
  applyFilter: () => void
}

/**
 * Owns the date-range state shared by every report screen.
 *
 * The default range is the current month to today. `DateRangePicker` speaks
 * react-aria `DateValue`; report APIs take plain `YYYY-MM-DD` strings, so the
 * bounds are derived rather than stored twice.
 *
 * `queryTrigger` exists so `applyFilter` can force a refetch even when the
 * caller re-selects the same range and TanStack Query would otherwise consider
 * the key unchanged.
 *
 * Lives in its own module rather than alongside `ReportScreen` so that file
 * only exports a component, which keeps React Fast Refresh working.
 */
export function useReportDateRange(): ReportDateRangeState {
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = today.slice(0, 7) + '-01'
  const [dateRange, setDateRange] = useState<DateRange>({
    start: parseDate(firstOfMonth),
    end: parseDate(today),
  })
  const [queryTrigger, setQueryTrigger] = useState(0)

  return {
    dateRange,
    startDate: dateRange.start?.toString() ?? firstOfMonth,
    endDate: dateRange.end?.toString() ?? today,
    queryTrigger,
    /** Ignore a half-picked range — the report query needs both bounds. */
    onDateRangeChange: (range) => {
      if (range?.start && range.end) setDateRange({ start: range.start, end: range.end })
    },
    applyFilter: () => setQueryTrigger((t) => t + 1),
  }
}
