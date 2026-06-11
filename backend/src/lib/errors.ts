/**
 * Typed application errors. Throw these, the error middleware turns them
 * into clean JSON responses with the right status code.
 */
import { HTTPException } from 'hono/http-exception'

export class AppError extends HTTPException {
  constructor(
    status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500,
    message: string,
    details?: unknown
  ) {
    super(status, { message, cause: details })
  }
}

export const BadRequest = (message = 'Bad request', details?: unknown) =>
  new AppError(400, message, details)

export const Unauthorized = (message = 'Unauthorized') => new AppError(401, message)

export const Forbidden = (message = 'Forbidden') => new AppError(403, message)

export const NotFound = (message = 'Not found') => new AppError(404, message)

export const Conflict = (message = 'Conflict', details?: unknown) =>
  new AppError(409, message, details)

export const Unprocessable = (message = 'Unprocessable entity', details?: unknown) =>
  new AppError(422, message, details)
