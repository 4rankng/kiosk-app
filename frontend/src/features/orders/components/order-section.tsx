import type { ReactNode } from 'react'

export interface OrderSectionProps {
  /** 1-based step number shown in the brand-filled badge. */
  step: number
  title: string
  /** Optional right-aligned note in the header row, e.g. "3 mặt hàng đã chọn". */
  note?: ReactNode
  children: ReactNode
}

/**
 * One numbered step of the order-creation flow: a brand-filled step badge, an
 * uppercase section title, and the card the step's content lives in.
 *
 * This repeats five times in `order-create.tsx` (twice on mobile, three times on
 * desktop) with the same badge and card classes each time, so the step styling
 * is defined once here.
 */
export function OrderSection({ step, title, note, children }: OrderSectionProps) {
  return (
    <section className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='flex size-6 items-center justify-center rounded-full bg-brand-solid text-xs font-semibold text-white'>
            {step}
          </span>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-tertiary'>
            {title}
          </h3>
        </div>
        {note && <span className='text-xs text-quaternary'>{note}</span>}
      </div>
      {children}
    </section>
  )
}

/** The white card a step's content sits in. */
export function OrderSectionCard({
  children,
  spaced = false,
}: {
  children: ReactNode
  /** Adds vertical rhythm between stacked children (search + grid, or summary + submit). */
  spaced?: boolean
}) {
  return (
    <div
      className={
        spaced
          ? 'space-y-4 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary_alt'
          : 'rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary_alt'
      }
    >
      {children}
    </div>
  )
}
