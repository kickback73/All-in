import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Local dev middleware for /api/peptide-search to mirror Vercel Serverless behavior
function peptideSearchDevPlugin() {
  return {
    name: 'peptide-search-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/peptide-search', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const query = (url.searchParams.get('q') || '').trim();

        if (!query) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Search query parameter "q" is required.' }));
          return;
        }

        const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const cx = process.env.GOOGLE_SEARCH_CX;

        // Local oncology ruleset
        const lowerQ = query.toLowerCase();
        const flagged = ['bpc-157', 'bpc 157', 'tb-500', 'ghk-cu', 'ghk cu', 'cjc-1295', 'ipamorelin', 'igf-1', 'mots-c']
          .filter(p => lowerQ.includes(p));

        const preliminarySafety = {
          isFlagged: flagged.length > 0,
          highestSeverity: flagged.length > 0 ? 'HIGH_RISK' : 'CLEAR',
          flags: flagged.map(f => ({
            id: f,
            severity: 'HIGH_RISK',
            category: 'Angiogenesis / Mitogenic Proliferation / Mitochondrial Biogenesis',
            matchedTerms: [f],
            clinicalWarning: `ONCOLOGY CONTRAINDICATION (NHL Remission): ${f.toUpperCase()} is contraindicated due to potential vascularization or proliferation of clonal lymphoid cells.`
          }))
        };

        if (!apiKey || !cx) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            configured: false,
            missingKeys: [
              !apiKey ? 'GOOGLE_SEARCH_API_KEY' : null,
              !cx ? 'GOOGLE_SEARCH_CX' : null,
            ].filter(Boolean),
            message: 'Google Custom Search credentials are unconfigured. Please add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX in your Vercel Project Settings -> Environment Variables and redeploy.',
            safetyAnalysis: preliminarySafety,
            results: []
          }));
          return;
        }

        try {
          const endpoint = new URL('https://www.googleapis.com/customsearch/v1');
          endpoint.searchParams.set('key', apiKey);
          endpoint.searchParams.set('cx', cx);
          endpoint.searchParams.set('q', `${query} peptide oncology mechanism mTOR angiogenesis lymphoma`);
          endpoint.searchParams.set('num', '5');

          const googleRes = await fetch(endpoint.toString());
          const data = await googleRes.json();

          res.statusCode = googleRes.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            configured: true,
            query,
            safetyAnalysis: preliminarySafety,
            results: (data.items || []).map(item => ({
              title: item.title,
              link: item.link,
              displayLink: item.displayLink,
              snippet: item.snippet
            }))
          }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            configured: true,
            error: err.message,
            safetyAnalysis: preliminarySafety,
            results: []
          }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    peptideSearchDevPlugin()
  ],
  server: {
    port: 5173,
    host: true,
  },
});
