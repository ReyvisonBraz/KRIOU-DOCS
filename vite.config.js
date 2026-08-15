import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolveBuildEnvironment } from './src/config/environment.js'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const loadedEnvironment = {
    ...loadEnv(mode, process.cwd(), ''),
    ...process.env,
    MODE: mode,
  }
  const buildEnvironment = command === 'build'
    ? resolveBuildEnvironment(loadedEnvironment)
    : null

  return {
    define: buildEnvironment ? {
      'import.meta.env.VITE_APP_ENV': JSON.stringify(buildEnvironment.appEnvironment),
      'import.meta.env.VITE_ALLOW_OFFLINE': JSON.stringify(
        buildEnvironment.supabaseConfigured ? 'false' : 'true',
      ),
    } : undefined,
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
        // Mede todo o código-fonte; não esconda arquivos ainda sem testes.
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/**/*.test.*'],
        reporter: ['text', 'html'],
      },
      // Arquivos .component e .hook usam jsdom
      environmentMatchGlobs: [
        ['src/**/*.component.test.{js,jsx}', 'jsdom'],
        ['src/**/*.hook.test.{js,jsx}', 'jsdom'],
      ],
    },
  }
})
