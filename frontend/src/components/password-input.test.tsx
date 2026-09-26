import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { PasswordInput } from './password-input'

describe('PasswordInput', () =>
{
  const TOGGLE_NAME = 'Toggle password visibility'

  it('renders the password input correctly', async () => {
    const { getByPlaceholder, getByRole } = await render(
      <PasswordInput placeholder='password' />
    )

    const passwordInput = getByPlaceholder('password')
    const toggleButton = getByRole('button', { name: TOGGLE_NAME })

    await expect.element(passwordInput).toBeInTheDocument()
    await expect.element(passwordInput).toHaveAttribute('type', 'password')
    await expect.element(toggleButton).toBeVisible()
  })

  it('toggles the password visibility when the toggle button is clicked', async () => {
    const { getByPlaceholder, getByRole } = await render(
      <PasswordInput placeholder='password' />
    )

    const passwordInput = getByPlaceholder('password')
    const toggleButton = getByRole('button', { name: TOGGLE_NAME })

    await expect.element(passwordInput).toHaveAttribute('type', 'password')

    await userEvent.click(toggleButton)

    await expect.element(passwordInput).toHaveAttribute('type', 'text')

    await userEvent.click(toggleButton)

    await expect.element(passwordInput).toHaveAttribute('type', 'password')
  })

  it('disables the input and toggle when the input is disabled', async () => {
    const { getByPlaceholder, getByRole } = await render(
      <PasswordInput placeholder='password' disabled />
    )

    const passwordInput = getByPlaceholder('password')
    const toggleButton = getByRole('button', { name: TOGGLE_NAME })
    await expect.element(toggleButton).toBeDisabled()
    await expect.element(passwordInput).toBeDisabled()
  })

  it('works with react-hook-form register spread', async () => {
    function PasswordInRegisteredForm({ field }: { field: UseFormRegisterReturn<'password'> }) {
      return (
        <form>
          <label htmlFor='password-field'>Mật khẩu</label>
          <PasswordInput id='password-field' {...field} />
        </form>
      )
    }

    function Wrapper() {
      const { register } = useForm<{ password: string }>({
        defaultValues: { password: '' },
      })

      return <PasswordInRegisteredForm field={register('password')} />
    }

    const { getByLabelText } = await render(<Wrapper />)

    const password = getByLabelText('Mật khẩu')
    await expect.element(password).toHaveAttribute('type', 'password')

    await userEvent.type(password, 'secret-value')

    await expect.element(password).toHaveValue('secret-value')
  })
})
