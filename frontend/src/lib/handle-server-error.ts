import { AxiosError } from 'axios'
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

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  const errMsg =
    getNoContentMessage(error) ?? getAxiosMessage(error) ?? 'Something went wrong!'

  toast.error(errMsg)
}
