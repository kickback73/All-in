export default async function handler(req, res) {
  const { q, barcode } = req.query;
  const apiKey = process.env.USDA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing USDA_API_KEY in Vercel environment' });
  }

  const searchTerm = barcode || q;
  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }

  const dataTypes = barcode
    ? ['Branded']
    : ['Foundation', 'SR Legacy', 'Branded'];

  try {
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchTerm.trim(),
          dataType: dataTypes,
          pageSize: barcode ? 5 : 8
        })
      }
    );

    const remaining = usdaRes.headers.get('X-RateLimit-Remaining');
    if (remaining) res.setHeader('X-RateLimit-Remaining', remaining);

    if (!usdaRes.ok) {
      return res.status(usdaRes.status).json({ error: 'USDA API error' });
    }

    const data = await usdaRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach USDA servers' });
  }
}
