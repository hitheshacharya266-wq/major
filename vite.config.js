import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'local-api-admin-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/admin')) {
            try {
              const { default: handler } = await import('./api/admin.js');
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                if (body) {
                  try { req.body = JSON.parse(body); } catch { req.body = {}; }
                } else {
                  req.body = {};
                }
                // Mock json & status helpers on Node res if missing
                if (!res.json) {
                  res.json = (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  };
                }
                if (!res.status) {
                  res.status = (code) => {
                    res.statusCode = code;
                    return res;
                  };
                }
                await handler(req, res);
              });
            } catch (err) {
              console.error('Error executing local /api/admin middleware:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    open: '/admin-dashboard'
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
})
