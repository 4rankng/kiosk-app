/**
 * Global error handler — turns thrown errors into clean JSON responses.
 * Logs unknown errors at error level.
 */
import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors.js'
import { logger } from '../config/logger.js'
import { isProduction } from '../config/env.js'

export const errorHandler: ErrorHandler = (err, c) => {
  // Our typed app errors
  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          message: err.message,
          ...(err.cause ? { details: err.cause } : {}),
        },
      },
      err.status
    )
  }

  // Hono's built-in HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json({ error: { message: err.message } }, err.status)
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          message: 'Validation failed',
          details: err.flatten().fieldErrors,
        },
      },
      422
    )
  }

  // Unknown → log + generic 500
  logger.error({ err }, 'Unhandled error')
  return c.json(
    {
      error: {
        message: isProduction ? 'Internal server error' : (err as Error).message,
        ...(isProduction ? {} : { stack: (err as Error).stack }),
      },
    },
    500
  )
}
