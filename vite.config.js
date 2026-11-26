import { defineConfig } from 'vite';
import foodHandler from './api/food.js';
import syncHandler from './api/sync.js';

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/food', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        req.query = Object.fromEntries(url.searchParams.entries());
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (obj) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
          return res;
        };
        await foodHandler(req, res);
      });

      server.middlewares.use('/api/sync', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        req.query = Object.fromEntries(url.searchParams.entries());
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (obj) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
          return res;
        };

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try { req.body = JSON.parse(body); } catch(e) { req.body = {}; }
            await syncHandler(req, res);
          });
        } else {
          await syncHandler(req, res);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [apiDevPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
