// Vercel serverless route: Live Yahoo Finance quotes, Yahoo Finance news ticker,
// and Men's Lifestyle & Health RSS feed aggregator (CORS-free).
// Usage:
//   /api/feeds?type=stocks&symbols=AAPL,NVDA,TSLA,SPY,BTC-USD
//   /api/feeds?type=news&symbols=AAPL,NVDA,SPY
//   /api/feeds?type=rss&url=https://www.menshealth.com/rss/all.xml/

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function decodeXml(str = '') {
  return String(str)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRssItems(xml, sourceLabel = '', limit = 8) {
  const items = [];
  const itemRegex = /<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
  let m;
  while ((m = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = m[1];
    const titleMatch = block.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch =
      block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i) ||
      block.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i);
    const dateMatch =
      block.match(/<pubDate\b[^>]*>([\s\S]*?)<\/pubDate>/i) ||
      block.match(/<updated\b[^>]*>([\s\S]*?)<\/updated>/i) ||
      block.match(/<published\b[^>]*>([\s\S]*?)<\/published>/i);
    const descMatch =
      block.match(/<description\b[^>]*>([\s\S]*?)<\/description>/i) ||
      block.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    const imgMatch =
      block.match(/<media:content\b[^>]*url=["']([^"']+)["']/i) ||
      block.match(/<media:thumbnail\b[^>]*url=["']([^"']+)["']/i) ||
      block.match(/<enclosure\b[^>]*url=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i) ||
      block.match(/<img\b[^>]*src=["']([^"']+)["']/i);

    const title = decodeXml(titleMatch ? titleMatch[1] : '');
    const link = decodeXml(linkMatch ? linkMatch[1] : '');
    if (!title || !link) continue;

    items.push({
      title,
      link,
      pubDate: dateMatch ? decodeXml(dateMatch[1]) : '',
      summary: descMatch ? decodeXml(descMatch[1]).slice(0, 180) : '',
      image: imgMatch ? imgMatch[1] : '',
      source: sourceLabel,
    });
  }
  return items;
}

async function fetchYahooQuote(symbol) {
  const sym = String(symbol || '').trim().toUpperCase();
  if (!sym) return null;
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } }
    );
    if (!r.ok) return null;
    const data = await r.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || meta.regularMarketPrice === undefined) return null;
    const price = Number(meta.regularMarketPrice) || 0;
    const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? price) || price;
    const change = price - prev;
    const pct = prev > 0 ? (change / prev) * 100 : 0;
    return {
      symbol: meta.symbol || sym,
      name: meta.shortName || meta.longName || sym,
      price: Math.round(price * 100) / 100,
      prevClose: Math.round(prev * 100) / 100,
      change: Math.round(change * 100) / 100,
      pct: Math.round(pct * 100) / 100,
      currency: meta.currency || 'USD',
    };
  } catch {
    return null;
  }
}

async function fetchYahooNews(symbolsList = []) {
  const cleanSyms = symbolsList.map((s) => String(s).trim().toUpperCase()).filter(Boolean).slice(0, 8);
  const urls = [];
  if (cleanSyms.length) {
    urls.push(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(cleanSyms.join(','))}&region=US&lang=en-US`);
  }
  urls.push('https://finance.yahoo.com/news/rssindex');

  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml' } });
      if (!r.ok) continue;
      const xml = await r.text();
      const items = parseRssItems(xml, 'Yahoo Finance', 14);
      if (items.length) return items;
    } catch {
      // try next URL
    }
  }
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { type, symbols, url, name } = req.query || {};

  try {
    if (type === 'stocks') {
      const syms = String(symbols || 'SPY,QQQ,AAPL,NVDA,TSLA,BTC-USD')
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 16);

      const [quotesRaw, news] = await Promise.all([
        Promise.all(syms.map(fetchYahooQuote)),
        fetchYahooNews(syms),
      ]);
      const quotes = quotesRaw.filter(Boolean);
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
      return res.status(200).json({ quotes, news, ts: Date.now() });
    }

    if (type === 'rss') {
      if (!url || !/^https?:\/\//i.test(String(url))) {
        return res.status(400).json({ error: 'Valid http(s) RSS URL required' });
      }
      const r = await fetch(String(url), {
        headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
      });
      if (!r.ok) {
        return res.status(502).json({ error: `Feed returned ${r.status}`, items: [] });
      }
      const xml = await r.text();
      const items = parseRssItems(xml, String(name || ''), 8);
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ items, ts: Date.now() });
    }

    return res.status(400).json({ error: 'Invalid type. Use type=stocks or type=rss.' });
  } catch (e) {
    return res.status(502).json({ error: e.message || 'Feed fetch failed' });
  }
}
