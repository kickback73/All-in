// Vercel serverless function: Relays sync requests to the user's Google Sheets Apps Script Web App
// Handles CORS and redirect following seamlessly on Vercel

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const scriptUrl = req.method === 'GET' ? req.query.url : req.body?.url;

  if (!scriptUrl || typeof scriptUrl !== 'string' || !scriptUrl.startsWith('https://script.google.com/')) {
    return res.status(400).json({ error: 'Valid Google Apps Script Web App URL required (must start with https://script.google.com/)' });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(scriptUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Google Sheets responded with HTTP ${response.status}` });
      }

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return res.status(200).json(json);
      } catch (parseErr) {
        return res.status(502).json({ error: 'Invalid JSON response from Google Apps Script', raw: text.slice(0, 200) });
      }
    }

    if (req.method === 'POST') {
      const state = req.body?.state;
      if (!state) {
        return res.status(400).json({ error: 'Missing state payload' });
      }

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
        redirect: 'follow'
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Google Sheets responded with HTTP ${response.status}` });
      }

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return res.status(200).json(json);
      } catch (parseErr) {
        return res.status(200).json({ success: true, notice: 'Transmitted successfully' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Sync relay error:', err);
    return res.status(500).json({ error: 'Failed to communicate with Google Sheets', message: err.message });
  }
}
