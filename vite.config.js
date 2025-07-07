// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ajuste esta linha para o nome do seu repositório no GitLab Pages
  base: '/2025-1-vitor-henrique-gabriel-yago-christian/',
  server: {
    proxy: {
      '/api-gecko': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-gecko/, ''),
      },
    },
  },
})