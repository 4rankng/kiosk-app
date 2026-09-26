import { type InputHTMLAttributes, useCallback } from 'react'
import { InputBase } from '@/components/base/input/input'
import { cn } from '@/lib/utils'
import { formatNumber, parseFormattedNumber } from '@/lib/format'

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'onChange'> {
  /** The numeric value (controlled) */
  value: number
  /** Called with the parsed number on change */
  onValueChange: (value: number) => void
}

/**
 * A text input that displays numbers in X.XXX format (Vietnamese locale)
 * and parses user input back to a plain number. Built on the Untitled UI
 * InputBase for styling; number formatting stays in `lib/format` so the
 * display/parse number contract is unchanged.
 */
export function NumberInput({
  value,
  onValueChange,
  className,
  disabled,
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
    <InputBase
      type='text'
      inputMode='numeric'
      size='sm'
      isDisabled={disabled}
      value={formatNumber(value)}
      onChange={handleChange}
      inputClassName={cn('text-right', className)}
      {...props}
    />
  )
}
