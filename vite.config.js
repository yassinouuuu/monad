import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// - On Vercel: process.env.VERCEL === '1'  → base = '/'
// - On GitHub Pages: no VERCEL env         → base = '/monad/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/monad/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
