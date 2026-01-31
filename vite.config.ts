import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@/convex.generated': path.resolve(__dirname, './convex/_generated'),
      '@/convex': path.resolve(__dirname, './convex'),
      '@': path.resolve(__dirname, './src'),
    },
  },

  plugins: [
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  build: {
    sourcemap: true,
  },
})
