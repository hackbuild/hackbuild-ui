import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// The framework free entry as one file, dist/vanilla.js. Runs after the
// library build, which empties dist and writes the types.
export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/vanilla/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'vanilla.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
  },
})
