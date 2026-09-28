import type { ReactNode } from 'react'
import { Check } from '@untitledui/icons'

export interface OrderSectionProps {
  /** 1-based step number shown in the brand-filled badge. */
  step: number
  title: string
  /** Optional right-aligned note in the header row, e.g. "3 mặt hàng đã chọn". */
  note?: ReactNode
  /**
   * Swaps the number for a tick once the step's condition is met, so the flow
   * shows progress at a glance.
   *
   * This borrows the completed-state idea from Tailkit's step components but
   * deliberately not their wizard shape: the POS is a workspace where the
   * customer, the cart and the totals are usable at once, not a gate you click
   * through. Nothing here locks or hides a later step.
   */
  isComplete?: boolean
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
export function OrderSection({ step, title, note, isComplete = false, children }: OrderSectionProps) {
  return (
    <section className='space-y-2' data-step={step} data-complete={isComplete || undefined}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span
            className='flex size-6 items-center justify-center rounded-full bg-brand-solid text-xs font-semibold text-white'
            aria-label={isComplete ? `Bước ${step} đã hoàn tất` : `Bước ${step}`}
          >
            {isComplete ? <Check className='size-3.5' /> : step}
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
