import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleApiRequest } from './server/api.mjs'

/**
 * Dev-Middleware: stellt dieselben /api-Routen bereit, die auch der
 * Produktions-Server (server/index.mjs) bedient. So verhält sich `npm run dev`
 * exakt wie `npm run build && npm run preview`.
 */
function apiDevServer() {
  return {
    name: 'symmedis-api-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()
        handleApiRequest(req, res).catch(() => {
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'internal_error' }))
          }
        })
      })
    },
  }
}

export default defineConfig(() => {
  const standalone = process.env.SYMMEDIS_STANDALONE === 'true'
  const publicBase = standalone ? '/symmedis/' : '/'
  return {
    base: publicBase,
    plugins: [react(), tailwindcss(), apiDevServer()],
    server: {
      host: true,
      port: 5173,
    },
    build: standalone ? {
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    } : undefined,
  }
})
