import { defineConfig } from 'vitest/config'

// Backend source uses NodeNext-style `.js` specifiers in relative imports
// (tsc resolves them to `.ts` at build). Vitest uses Vite's resolver, so
// remap `.js` → `.ts` to run tests directly against the TypeScript source.
export default defineConfig({
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Integration tests run against the local docker stack (`make dev`):
    // postgres (kiosk_dev) + redis. They open the real Redis client on import
    // and assert read-only or in-memory behavior; none mutate persistent data.
  },
})
