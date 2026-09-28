import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './api-client'
import { handleServerError } from './handle-server-error'

const toastError = vi.hoisted(() => vi.fn())

vi.mock('sonner', () => ({
  toast: {
    error: toastError,
  },
}))

beforeEach(() => {
  vi.mocked(toastError).mockClear()
})

describe('handleServerError', () => {
  it('shows a generic message when the error is not recognised', () => {
    handleServerError(new Error('network'))

    expect(toastError).toHaveBeenCalledWith('Đã xảy ra lỗi, vui lòng thử lại')
  })

  it('maps a plain object with status 204 to the no-content message', () => {
    handleServerError({ status: 204 })

    expect(toastError).toHaveBeenCalledWith('No content.')
  })

  it('prefers the API error message when the error is an Axios error with response data', () => {
    const error = new AxiosError('Bad request')
    error.response = {
      status: 422,
      data: { error: { message: 'Validation failed' } },
    } as AxiosError['response']

    handleServerError(error)

    expect(toastError).toHaveBeenCalledWith('Validation failed')
  })

  it('falls back to the generic message when Axios response has no error.message', () => {
    const error = new AxiosError('Request failed')
    error.response = {
      status: 500,
      data: {},
    } as AxiosError['response']

    handleServerError(error)

    expect(toastError).toHaveBeenCalledWith('Đã xảy ra lỗi, vui lòng thử lại')
  })

  it('falls back to the generic message when Axios error.message is an empty string', () => {
    const error = new AxiosError('Bad request')
    error.response = {
      status: 400,
      data: { error: { message: '' } },
    } as AxiosError['response']

    handleServerError(error)

    expect(toastError).toHaveBeenCalledWith('Đã xảy ra lỗi, vui lòng thử lại')
  })

  it('surfaces the server message from a normalised ApiError', () => {
    // The apiClient interceptor turns every AxiosError into an ApiError before
    // it reaches here, so this is the shape that actually arrives in practice.
    handleServerError(
      new ApiError('duplicate key value violates unique constraint "orders_code_key"', 500)
    )

    expect(toastError).toHaveBeenCalledWith(
      'duplicate key value violates unique constraint "orders_code_key"'
    )
  })

  it('prefers the ApiError message over the generic fallback', () => {
    handleServerError(new ApiError('Bãn gia không tồn tại', 404))

    expect(toastError).toHaveBeenCalledWith('Bãn gia không tồn tại')
  })

  it('logs the error to the console in development', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const err = new Error('logged')

    handleServerError(err)

    expect(log).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(err)

    log.mockRestore()
  })

  it('does not log the error to the console in production', () => {
    vi.stubEnv('DEV', false)

    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const err = new Error('not logged')

    handleServerError(err)

    expect(log).not.toHaveBeenCalled()

    log.mockRestore()
  })
})
