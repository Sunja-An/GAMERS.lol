import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/riot-asia': {
        target: 'https://asia.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-asia/, ''),
      },
      '/riot-kr': {
        target: 'https://kr.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-kr/, ''),
      },
      '/riot-jp': {
        target: 'https://jp1.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-jp/, ''),
      },
    },
  },
})

