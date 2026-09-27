/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { playwright } from '@vitest/browser-playwright'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-tanstack',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-xlsx',
              test: /[\\/]node_modules[\\/]xlsx[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-recharts',
              test: /[\\/]node_modules[\\/](recharts|d3-[^\\/]+)[\\/]/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
  test: {
    silent: 'passed-only',
    unstubEnvs: true,
    css: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium', viewport: { width: 1280, height: 720 } }],
      // 63315 is vitest's default and collides with other projects' browser
      // test servers on this machine — override per run via env when needed.
      api: { port: Number(process.env.VITEST_BROWSER_API_PORT) || 63315 },
    },
    coverage: {
      // include: ['src/**/*.{js,jsx,ts,tsx}'], // Uncomment to expand the report to all src/**/* so untested modules appear as 0% coverage.
      exclude: [
        'src/components/ui/**',
        'src/assets/**',
        'src/tanstack-table.d.ts',
        'src/routeTree.gen.ts',
        'src/test-utils/**',
        'src/routes/**',
      ],
    },
  },
})
