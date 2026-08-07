import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 65,
        branches: 60,
        functions: 65,
        lines: 65,
        'src/core/engine/*': { statements: 85, functions: 85, branches: 80 },
        'src/core/entities/*': { statements: 85, functions: 85, branches: 80 },
        'src/core/math/*': { statements: 85, functions: 85, branches: 80 },
        'src/features/logistics/*': { statements: 60 },
        'src/features/combat/*': { statements: 35 },
        'src/pages/*': { statements: 30 },
      }
    }
  }
})
