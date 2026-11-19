import { defineConfig } from 'vite';
import foodHandler from './api/food.js';

function foodApiDevPlugin() {
  return {
    name: 'food-api-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/food', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        req.query = Object.fromEntries(url.searchParams.entries());
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (obj) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
          return res;
        };
        await foodHandler(req, res);
      });
    },
  };
}

export default defineConfig({
  plugins: [foodApiDevPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
