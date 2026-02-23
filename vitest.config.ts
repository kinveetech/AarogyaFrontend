import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    exclude: ['e2e/**', 'node_modules/**'],
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'text'],
      reportsDirectory: 'coverage',
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
      },
      exclude: [
        'node_modules/**',
        'next.config.*',
        '.next/**',
        'src/test/**',
        'src/app/sw.ts',
      ],
    },
  },
})
