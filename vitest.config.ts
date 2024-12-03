import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/lib/**'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    deps: {
      inline: [
        'istextorbinary',
        '@babel/parser'
      ],
      interopDefault: true
    },
    setupFiles: ['./tests/setup.ts']
  },
});
