import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createJamendoHandler } from './server/jamendo.ts'

export default defineConfig(({ mode }) => ({
  plugins: [react(), {
    name: 'jamendo-search',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), 'JAMENDO_')
      const handler = createJamendoHandler(() => process.env.JAMENDO_CLIENT_ID ?? env.JAMENDO_CLIENT_ID ?? '')
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/jamendo') return next()
        void handler(req, res).catch(() => { res.statusCode = 500; res.end(JSON.stringify({ error: 'Search is temporarily unavailable.' })) })
      })
    },
  }],
  server: { host: '127.0.0.1', port: 5173 },
}))
