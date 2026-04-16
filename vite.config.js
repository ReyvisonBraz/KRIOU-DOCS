import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
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
    // Ambiente padrão para testes de utils (node é mais rápido)
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
    reporters: ['verbose'],
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      // Cobre apenas os módulos com testes unitários escritos
      include: [
        'src/utils/validation.js',
        'src/utils/formatting.js',
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
