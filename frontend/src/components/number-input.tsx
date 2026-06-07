import { type InputHTMLAttributes, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatNumber, parseFormattedNumber } from '@/lib/format'

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  /** The numeric value (controlled) */
  value: number
  /** Called with the parsed number on change */
  onValueChange: (value: number) => void
}

/**
 * A text input that displays numbers in X.XXX format (Vietnamese locale)
 * and parses user input back to a plain number.
 */
export function NumberInput({
  value,
  onValueChange,
  className,
  ...props
}: NumberInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFormattedNumber(e.target.value)
      onValueChange(parsed)
    },
    [onValueChange]
  )

  return (
    <Input
      type='text'
      inputMode='numeric'
      value={formatNumber(value)}
      onChange={handleChange}
      className={cn('text-right', className)}
      {...props}
    />
  )
}
