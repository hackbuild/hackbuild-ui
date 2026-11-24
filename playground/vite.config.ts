import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@hackbuild/ui/styles.css': fileURLToPath(new URL('../src/styles/hackbuild.css', import.meta.url)),
      '@hackbuild/ui': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        bench: fileURLToPath(new URL('./bench.html', import.meta.url)),
        ai: fileURLToPath(new URL('./ai.html', import.meta.url)),
      },
    },
  },
})
