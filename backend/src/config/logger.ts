/**
 * Pino logger — JSON in production, pretty in development.
 * NOTE: Do not import env.ts at module level to avoid circular deps
 * (env.ts → logger.ts → env.ts). Read env vars directly.
 */
import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'
const level = process.env.LOG_LEVEL || 'info'

export const logger = pino({
  level,
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash'],
    censor: '[REDACTED]',
  },
})
