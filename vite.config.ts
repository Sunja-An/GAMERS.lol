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
      '/riot-americas': {
        target: 'https://americas.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-americas/, ''),
      },
      '/riot-europe': {
        target: 'https://europe.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-europe/, ''),
      },
      '/riot-sea': {
        target: 'https://sea.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-sea/, ''),
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
      '/riot-na': {
        target: 'https://na1.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-na/, ''),
      },
      '/riot-euw': {
        target: 'https://euw1.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-euw/, ''),
      },
      '/riot-eune': {
        target: 'https://eun1.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-eune/, ''),
      },
      '/riot-oce': {
        target: 'https://oc1.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-oce/, ''),
      },
    },
  },
})

