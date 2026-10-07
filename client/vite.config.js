import { copyFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const clientDir = path.dirname(fileURLToPath(import.meta.url))
const maplibreDist = path.resolve(clientDir, 'node_modules/maplibre-gl/dist')

function copyMaplibreWorker() {
  const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']
  return {
    name: 'copy-maplibre-worker',
    apply: 'build',
    writeBundle(options, bundle) {
      const entry = Object.values(bundle).find((file) => file.type === 'chunk' && file.isEntry)
      const assetDir = path.join(options.dir, path.dirname(entry?.fileName || 'assets/index.js'))
      mkdirSync(assetDir, { recursive: true })
      for (const file of files) {
        copyFileSync(path.join(maplibreDist, file), path.join(assetDir, file))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyMaplibreWorker()],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  server: {
    port: 3000,
    fs: {
      allow: [path.resolve(clientDir, '..')],
    },
  },
})
