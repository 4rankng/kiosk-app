/**
 * @kiosk/shared — Zod schemas + inferred types shared between the frontend and
 * backend. Schemas are the single source of truth; types are derived via
 * `z.infer` so the two apps can never drift.
 *
 * Consumers import from `@kiosk/shared` (resolves to this file via the
 * package `main`/`exports`). Exposes raw TypeScript source so both the Vite
 * frontend and the tsx/tsc backend can consume it without a build step.
 */
export {}
