import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@hackbuild/ui/vanilla': fileURLToPath(new URL('../src/vanilla/index.ts', import.meta.url)),
      '@hackbuild/ui/styles.css': fileURLToPath(new URL('../src/styles/hackbuild.css', import.meta.url)),
      '@hackbuild/ui': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      '@brand': fileURLToPath(new URL('../assets/brand', import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        vanilla: fileURLToPath(new URL('./vanilla.html', import.meta.url)),
      },
    },
  },
})
