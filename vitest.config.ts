import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        'src/dev.ts',
        'src/infra',
        'src/types',
        'src/testFactories',
        'test',
      ],
      thresholds: {
        'src/**/*.ts': {
          functions: 100,
          branches: 100,
          lines: 100,
        },
      },
    },
  },
})
