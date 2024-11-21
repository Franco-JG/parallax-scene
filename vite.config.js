import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/parallax-scene/',
  server: {
    host: true,
  },
  build: {
    outDir: 'docs'
  },
})
