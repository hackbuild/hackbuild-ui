import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/** Files the site serves at its root for coding agents: written by tools/llms.mjs, never copied by hand. */
const LLMS: Record<string, string> = {
  'llms.txt': '../docs/llms.txt',
  'llms-full.txt': '../docs/llms-full.txt',
  'llms.md': '../llms.md',
  'quick.ts': '../examples/quick.ts',
}

function llmsFiles(): Plugin {
  const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
  return {
    name: 'hb-llms',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = (req.url ?? '').split('?')[0].replace(/^.*\//, '')
        if (!LLMS[name]) return next()
        res.setHeader('content-type', 'text/plain; charset=utf-8')
        res.end(read(LLMS[name]))
      })
    },
    generateBundle() {
      for (const [fileName, rel] of Object.entries(LLMS)) this.emitFile({ type: 'asset', fileName, source: read(rel) })
    },
  }
}

export default defineConfig({
  plugins: [vue(), llmsFiles()],
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
