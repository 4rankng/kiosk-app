import { InputBase } from '@/components/base/input/input'

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> & {
  ref?: React.Ref<HTMLInputElement>
}

/**
 * Password field with a visibility toggle, built on the Untitled UI InputBase
 * (which ships its own Eye/EyeOff toggle for `type="password"`). Accepts
 * `react-hook-form` register spread (name/onChange/onBlur/ref) via native
 * input prop passthrough.
 */
export function PasswordInput({
  className,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const field = (
    <InputBase
      type='password'
      size='sm'
      isDisabled={disabled}
      ref={ref}
      wrapperClassName={className}
      {...props}
    />
  )

  // A disabled <fieldset> disables every descendant control (including the
  // visibility toggle), which React Aria's Group does not propagate to the
  // toggle button on its own.
  if (!disabled) {
    return field
  }
  return <fieldset disabled className='m-0 flex w-full border-0 p-0'>{field}</fieldset>
}
