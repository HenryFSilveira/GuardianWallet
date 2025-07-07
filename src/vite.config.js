import { defineConfig } from 'vite' //
import react from '@vitejs/plugin-react' //

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], //
  base: '/GuardianWallet/', // <--- Adicione ou ajuste esta linha com o nome do seu repositório
  server: {
    proxy: {
      // Define um proxy para requisições que começam com /api-gecko
      '/api-gecko': {
        // Alvo da requisição (a API real do CoinGecko)
        target: 'https://api.coingecko.com/api/v3', //
        // Necessário para que o proxy funcione corretamente
        changeOrigin: true, //
        // Remove o prefixo /api-gecko antes de enviar a requisição
        rewrite: (path) => path.replace(/^\/api-gecko/, ''), //
      },
    },
  },
})