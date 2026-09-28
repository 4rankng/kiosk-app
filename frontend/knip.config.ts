import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: [
    // UntitledUI vendor components, installed via
    // `npx untitledui@latest add <component>`. Treat as third-party: a
    // component that has been installed but not yet wired into a feature is
    // not dead code, so don't report it.
    'src/components/ui/**',
    'src/components/base/**',
    'src/components/application/**',
    'src/components/foundations/**',
    'src/components/shared-assets/**',
    'src/components/layout/app-title.tsx',
    'src/tanstack-table.d.ts',
  ],
}

export default config