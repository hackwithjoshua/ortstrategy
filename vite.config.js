import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('highlight.js')) return 'vendor-hljs'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('firebase')) return 'vendor-firebase'
          if (id.includes('react-icons')) return 'vendor-icons'
          if (id.includes('node_modules/react') || id.includes('react-router-dom')) return 'vendor-react'
        },
      },
    },
  },
})
