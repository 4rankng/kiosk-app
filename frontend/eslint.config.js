import globals from 'globals'
import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  // Untitled UI source (base/application/foundations/shared-assets + its hooks)
  // is third-party vendor code — exempt from app-code lint like src/components/ui.
  {
    ignores: [
      'dist',
      'src/components/ui',
      'src/components/base',
      'src/components/application',
      'src/components/foundations',
      'src/components/shared-assets',
      'src/hooks/use-breakpoint.ts',
      'src/hooks/use-resize-observer.ts',
      'src/pages',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginQuery.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // TanStack Table's useReactTable() returns fresh closures on every render
      // and is not React-Compiler-memoizable. The app uses TanStack Table for
      // every data table and the compiler is not enabled in the Vite build, so
      // the advisory warning is pure noise here. Tables still work correctly.
      'react-hooks/incompatible-library': 'off',
      'no-console': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Enforce type-only imports for TypeScript types
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      // Prevent duplicate imports from the same module
      'no-duplicate-imports': 'error',
    },
  },
  {
    // TanStack Router's file-based routing REQUIRES a route module to export
    // `loader`/`Head` alongside its component, so the fast-refresh rule cannot
    // be satisfied without splitting the route contract away from the page.
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // The provider/hook co-location is a deliberate pattern in this codebase:
    // each `*-provider.tsx` owns its context, its hook, and its provider
    // component together, and the hook is only ever consumed by that feature.
    // Splitting them would scatter one feature across three files for no gain.
    files: [
      'src/**/*-provider.tsx',
      'src/components/layout/use-sidebar-ui.tsx',
      'src/features/dashboard/components/monthly-revenue-chart.tsx',
      'src/features/dashboard/components/today-stats.tsx',
      'src/features/orders/components/customer-selector.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  }
)
