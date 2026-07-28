import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteImagemin: (...args: any[]) => any = require('vite-plugin-imagemin').default ?? require('vite-plugin-imagemin')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compress images at build time: JPEG ~82%, PNG quantized, SVG svgo
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 82 },
      pngquant: { quality: [0.65, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Separate vendor chunks so React/GSAP are cached independently of app code
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap')) {
            return 'vendor-gsap';
          }
        },
      },
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
