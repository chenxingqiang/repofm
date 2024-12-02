import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**'],
    deps: {
      interopDefault: true,
      optimizer: {
        web: {
          include: [/inquirer/]
        },
        ssr: {
          include: [/inquirer/]
        }
      }
    },
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    extensions: ['.ts', '.js', '.json']
  }
});
