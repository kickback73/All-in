// src/app/api/peptide-search/route.js
import { NextResponse } from 'next/server';

const ONCOLOGY_CONTRAINDICATION_RULES = [
  {
    id: 'angiogenesis-vegf',
    severity: 'HIGH_RISK',
    category: 'Angiogenesis & Vascular Endothelial Growth (VEGF)',
    peptides: ['bpc-157', 'bpc 157', 'tb-500', 'tb500', 'thymosin beta-4', 'ghk-cu', 'ghk cu'],
    keywords: ['angiogenesis', 'vegf', 'vascular endothelial', 'neovascularization', 'endothelial proliferation', 'microvascular'],
    clinicalWarning:
      'ONCOLOGY CONTRAINDICATION (NHL Remission): Directly promotes VEGF expression, endothelial migration, or angiogenesis. May accelerate vascularization of dormant clonal lymphoid microenvironments.',
  },
  {
    id: 'gh-igf1-mitogenic',
    severity: 'HIGH_RISK',
    category: 'GH / IGF-1 Axis & Cellular Proliferation',
    peptides: [
      'cjc-1295', 'ipamorelin', 'tesamorelin', 'sermorelin', 'mk-677',
      'igf-1', 'igf-1 lr3', 'igf-1 des', 'hexarelin', 'ghrp-6', 'ghrp-2', 'peg-mgf',
    ],
    keywords: ['igf-1', 'insulin-like growth factor', 'mitogenic', 'cellular proliferation', 'anti-apoptotic', 'pi3k/akt/mtor'],
    clinicalWarning:
      'ONCOLOGY CONTRAINDICATION (NHL Remission): Upregulates systemic GH/IGF-1 signaling and downstream PI3K/Akt/mTOR pathways, inhibiting apoptosis and promoting lymphocyte proliferation.',
  },
  {
    id: 'mitochondrial-biogenesis',
    severity: 'MODERATE_HIGH_RISK',
    category: 'Mitochondrial Biogenesis & Telomerase Activation',
    peptides: ['mots-c', 'ss-31', 'elamipretide', 'humanin', 'epitalon', 'epithalon', 'nad+'],
    keywords: ['mitochondrial biogenesis', 'pgc-1a', 'telomerase', 'oxidative phosphorylation', 'metabolic rescue', 'oxphos'],
    clinicalWarning:
      'ONCOLOGY CAUTION (NHL Remission): Stimulates robust mitochondrial biogenesis, OXPHOS, or telomerase activity. Indolent B-cell and T-cell lymphomas often exploit mitochondrial metabolic plasticity for clonal persistence.',
  },
];

export function evaluateOncologySafety(queryText = '', results = []) {
  const combinedCorpus = [
    queryText,
    ...results.map((r) => `${r.title || ''} ${r.snippet || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  const matchedFlags = [];

  for (const rule of ONCOLOGY_CONTRAINDICATION_RULES) {
    const matchedPeptides = rule.peptides.filter((p) => combinedCorpus.includes(p));
    const matchedKeywords = rule.keywords.filter((k) => combinedCorpus.includes(k));

    if (matchedPeptides.length > 0 || matchedKeywords.length > 0) {
      matchedFlags.push({
        id: rule.id,
        severity: rule.severity,
        category: rule.category,
        matchedTerms: [...new Set([...matchedPeptides, ...matchedKeywords])],
        clinicalWarning: rule.clinicalWarning,
      });
    }
  }

  return {
    isFlagged: matchedFlags.length > 0,
    highestSeverity: matchedFlags.some((f) => f.severity === 'HIGH_RISK')
      ? 'HIGH_RISK'
      : matchedFlags.length > 0
      ? 'MODERATE_HIGH_RISK'
      : 'CLEAR',
    flags: matchedFlags,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query) {
    return NextResponse.json({ error: 'Search query parameter "q" is required.' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  const preliminarySafety = evaluateOncologySafety(query, []);

  // Zero fake/mock fallback data if environment variables are missing
  if (!apiKey || !cx) {
    const missingKeys = [
      !apiKey ? 'GOOGLE_SEARCH_API_KEY' : null,
      !cx ? 'GOOGLE_SEARCH_CX' : null,
    ].filter(Boolean);

    return NextResponse.json(
      {
        configured: false,
        missingKeys,
        message:
          'Google Custom Search credentials are unconfigured. Please add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX in your Vercel Project Settings -> Environment Variables and redeploy.',
        safetyAnalysis: preliminarySafety,
        results: [],
      },
      { status: 503 }
    );
  }

  try {
    const endpoint = new URL('https://www.googleapis.com/customsearch/v1');
    endpoint.searchParams.set('key', apiKey);
    endpoint.searchParams.set('cx', cx);
    endpoint.searchParams.set('q', `${query} peptide oncology mechanism mTOR angiogenesis lymphoma`);
    endpoint.searchParams.set('num', '5');

    const res = await fetch(endpoint.toString(), { cache: 'no-store' });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          configured: true,
          error: data?.error?.message || 'Google Custom Search API request failed.',
          safetyAnalysis: preliminarySafety,
          results: [],
        },
        { status: res.status }
      );
    }

    const items = Array.isArray(data.items)
      ? data.items.map((item) => ({
          title: item.title,
          link: item.link,
          displayLink: item.displayLink,
          snippet: item.snippet,
        }))
      : [];

    const safetyAnalysis = evaluateOncologySafety(query, items);

    return NextResponse.json({
      configured: true,
      query,
      safetyAnalysis,
      results: items,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        error: error.message || 'Server error while contacting Google Custom Search.',
        safetyAnalysis: preliminarySafety,
        results: [],
      },
      { status: 500 }
    );
  }
}

