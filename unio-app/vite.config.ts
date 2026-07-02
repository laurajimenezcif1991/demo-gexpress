import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/demo-gexpress/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wapp: resolve(__dirname, 'wapp.html'),
      },
    },
  },
})
