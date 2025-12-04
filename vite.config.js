import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['@carbon/charts', '@carbon/charts-react', 'd3', 'recharts'],
          'ui': ['lucide-react', 'framer-motion']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    hmr: true,
  },
})
