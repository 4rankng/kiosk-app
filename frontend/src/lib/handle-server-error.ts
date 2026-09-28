import { AxiosError } from 'axios'
import { ApiError } from '@/lib/api-client'
import { toast } from 'sonner'

/** Message for a plain error object carrying an HTTP 204 status, if any. */
function getNoContentMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    return 'No content.'
  }

  return undefined
}

/** Message from an Axios response body, if one is present. */
function getAxiosMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return undefined
  }

  const apiError = error.response?.data?.error
  if (apiError && typeof apiError.message === 'string' && apiError.message.length > 0) {
    return apiError.message
  }

  return undefined
}

/**
 * Message from an already-normalised `ApiError`.
 *
 * `apiClient`'s response interceptor converts every AxiosError into an ApiError
 * carrying the server's own message, so by the time an error reaches the query
 * layer it is an ApiError, *not* an AxiosError. Without this branch every
 * failure showed the generic fallback and the server's explanation was thrown
 * away — a 500 from a duplicate-key insert read as "Something went wrong!"
 * instead of naming the constraint.
 */
function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.message && error.message.length > 0) {
    return error.message
  }
  return undefined
}

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  const errMsg =
    getNoContentMessage(error) ??
    getApiErrorMessage(error) ??
    getAxiosMessage(error) ??
    'Đã xảy ra lỗi, vui lòng thử lại'

  toast.error(errMsg)
}
