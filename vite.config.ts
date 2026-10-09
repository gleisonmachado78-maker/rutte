import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

/** No HTML Ãºnico, embute favicon/Ã­cone como data URI (nÃ£o hÃ¡ pasta public ao abrir via file://). */
function inlineIcons(): Plugin {
  const svg = readFileSync(new URL('./public/favicon.svg', import.meta.url), 'utf8')
  const png = readFileSync(new URL('./public/apple-touch-icon.png', import.meta.url)).toString('base64')
  return {
    name: 'inline-icons',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
          .replace('href="/favicon.svg"', `href="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"`)
          .replace('href="/apple-touch-icon.png"', `href="data:image/png;base64,${png}"`),
    },
  }
}

/** Identificador desta versão: o app compara com /version.json para saber quando há atualização. */
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())

function versionFile(): Plugin {
  return {
    name: 'version-file',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: BUILD_ID }) })
    },
  }
}

export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
    plugins: [react(), ...(single ? [viteSingleFile(), inlineIcons()] : [versionFile()])],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: single
      ? { outDir: 'dist-single', emptyOutDir: true, copyPublicDir: false, assetsInlineLimit: 100_000_000 }
      : undefined,
  }
})
