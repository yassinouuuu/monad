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
        manualChunks(id) {
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor';
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
