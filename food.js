// Vercel serverless route: proxies the Canadian Nutrient File (CNF).
// Usage: /api/food?q=salmon   or   /api/food?nutrients=1
// Nutrient names list confirmed live at:
//   https://food-nutrition.canada.ca/api/canadian-nutrient-file/nutrientname/?lang=en&type=json
// The food search endpoint is NOT yet verified. See FOOD_PATH below.

const BASE = 'https://food-nutrition.canada.ca/api/canadian-nutrient-file';
// TODO: confirm the food search path and parameters before relying on it.
const FOOD_PATH = '/food/';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, nutrients } = req.query;
  try {
    if (nutrients) {
      const r = await fetch(`${BASE}/nutrientname/?lang=en&type=json`);
      if (!r.ok) throw new Error('CNF nutrient list ' + r.status);
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
      return res.status(200).json(await r.json());
    }
    if (!q) return res.status(400).json({ error: 'Missing q' });
    const r = await fetch(`${BASE}${FOOD_PATH}?lang=en&type=json&q=${encodeURIComponent(q)}`);
    if (!r.ok) return res.status(502).json({ error: 'CNF food search ' + r.status });
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json(await r.json());
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
