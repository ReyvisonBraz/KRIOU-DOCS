import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    // Gera dist/bundle-analysis.html após cada build
    visualizer({ filename: 'dist/bundle-analysis.html', open: false, gzipSize: true }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'vendor-jspdf';
          }
          if (id.includes('node_modules/sonner')) {
            return 'vendor-sonner';
          }
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
        },
      },
    },
  },

  test: {
    // Expõe describe/it/expect globalmente (necessário para jest-dom)
    globals: true,
    // Garante o build de desenvolvimento do React mesmo se o shell exportar
    // NODE_ENV=production (build de produção do React 19 não exporta `act`,
    // quebrando @testing-library/react com "React.act is not a function").
    env: {
      NODE_ENV: 'test',
    },
    // Ambiente padrão para testes de utils (node é mais rápido)
    environment: 'node',
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    reporters: ['verbose'],
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      // Cobre apenas os módulos com testes unitários escritos
      include: [
        'src/utils/validation.ts',
        'src/utils/formatting.ts',
        'src/utils/sanitization.js',
        'src/hooks/useAutoSave.js',
      ],
      exclude: ['src/**/*.test.*'],
      reporter: ['text', 'html'],
      thresholds: { lines: 80, functions: 80 },
    },
    // Arquivos .component e .hook usam jsdom
    environmentMatchGlobs: [
      ['src/**/*.component.test.{js,jsx}', 'jsdom'],
      ['src/**/*.hook.test.{js,jsx}', 'jsdom'],
    ],
  },
})
