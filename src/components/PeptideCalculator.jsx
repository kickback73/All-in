// src/components/PeptideCalculator.jsx
import React, { useState, useMemo } from 'react';
import {
  Syringe,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function PeptideCalculator({ onQuickLogDose }) {
  // Reconstitution Calculator State
  const [peptideName, setPeptideName] = useState('');
  const [vialMg, setVialMg] = useState(5);
  const [bacWaterMl, setBacWaterMl] = useState(2);
  const [desiredDoseMcg, setDesiredDoseMcg] = useState(250);
  const [syringeSizeMl, setSyringeSizeMl] = useState(1.0);

  // Google Custom Search & Oncology Guardrail State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState({
    loading: false,
    hasSearched: false,
    configured: true,
    missingKeys: [],
    message: '',
    error: null,
    safetyAnalysis: null,
    results: [],
  });

  const calc = useMemo(() => {
    const mg = Number(vialMg) || 0;
    const ml = Number(bacWaterMl) || 0;
    const mcg = Number(desiredDoseMcg) || 0;

    if (mg <= 0 || ml <= 0 || mcg <= 0) {
      return { concentrationMcgPerMl: 0, drawVolumeMl: 0, syringeUnits: 0, dosesPerVial: 0 };
    }

    const totalMcg = mg * 1000;
    const concentrationMcgPerMl = totalMcg / ml;
    const drawVolumeMl = mcg / concentrationMcgPerMl;
    const syringeUnits = drawVolumeMl * 100; // U-100 syringe scale standard
    const dosesPerVial = Math.floor(totalMcg / mcg);

    return {
      concentrationMcgPerMl: Math.round(concentrationMcgPerMl),
      drawVolumeMl: Number(drawVolumeMl.toFixed(3)),
      syringeUnits: Number(syringeUnits.toFixed(1)),
      dosesPerVial,
    };
  }, [vialMg, bacWaterMl, desiredDoseMcg]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchState((prev) => ({ ...prev, loading: true, error: null, hasSearched: true }));
    try {
      const res = await fetch(`/api/peptide-search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      setSearchState({
        loading: false,
        hasSearched: true,
        configured: data.configured !== false,
        missingKeys: data.missingKeys || [],
        message: data.message || '',
        error: data.error || null,
        safetyAnalysis: data.safetyAnalysis || null,
        results: data.results || [],
      });
    } catch (err) {
      setSearchState({
        loading: false,
        hasSearched: true,
        configured: true,
        missingKeys: [],
        message: '',
        error: 'Network error communicating with peptide search service.',
        safetyAnalysis: null,
        results: [],
      });
    }
  };

  const maxUnits = syringeSizeMl * 100;
  const fillPct = Math.min(100, Math.max(0, (calc.syringeUnits / maxUnits) * 100));

  return (
    <div className="space-y-3.5 text-slate-900">
      {/* 1. Reconstitution & Dosage Calculator */}
      <div className="rounded-2xl bg-white/75 backdrop-blur-[2px] border border-slate-200/80 p-3.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Syringe className="w-4 h-4 text-sky-700" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Reconstitution & Dosage
            </h4>
          </div>
          <span className="text-[11px] font-bold text-sky-800 bg-sky-50/90 border border-sky-200 px-2.5 py-0.5 rounded-full">
            {calc.concentrationMcgPerMl.toLocaleString()} mcg/mL
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700">Vial Mass (mg)</label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={vialMg}
              onChange={(e) => setVialMg(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-900 bg-white/90"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700">BAC Water (mL)</label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={bacWaterMl}
              onChange={(e) => setBacWaterMl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-900 bg-white/90"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700">Dose (mcg)</label>
            <input
              type="number"
              min="1"
              step="25"
              value={desiredDoseMcg}
              onChange={(e) => setDesiredDoseMcg(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-900 bg-white/90"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700">U-100 Syringe</label>
            <select
              value={syringeSizeMl}
              onChange={(e) => setSyringeSizeMl(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-900 bg-white/90"
            >
              <option value={0.3}>0.3 mL (30 IU)</option>
              <option value={0.5}>0.5 mL (50 IU)</option>
              <option value={1.0}>1.0 mL (100 IU)</option>
            </select>
          </div>
        </div>

        {/* Syringe Visual Gauge */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Draw to: <strong className="text-slate-900 text-sm font-black">{calc.syringeUnits} IU</strong> ({calc.drawVolumeMl} mL)
            </span>
            <span className="text-slate-600 font-bold">{calc.dosesPerVial} doses/vial</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {onQuickLogDose && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={peptideName}
              onChange={(e) => setPeptideName(e.target.value)}
              placeholder="Compound name to log..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-900 bg-white/90"
            />
            <button
              type="button"
              onClick={() => {
                if (!peptideName.trim()) return;
                onQuickLogDose({
                  name: peptideName.trim(),
                  doseMcg: Number(desiredDoseMcg),
                  units: calc.syringeUnits,
                  site: 'SubQ Periumbilical',
                });
                setPeptideName('');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition shadow-2xs cursor-pointer shrink-0"
            >
              Log Dose
            </button>
          </div>
        )}
      </div>

      {/* 2. Google Custom Search Peptide Lookup & Oncology Safety Engine */}
      <div className="rounded-2xl bg-white/75 backdrop-blur-[2px] border border-slate-200/80 p-3.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Search className="w-4 h-4 text-slate-700" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Peptide Lookup & NHL Safety Screen
            </h4>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Google Search</span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search (e.g., BPC-157, GHK-Cu, Thymosin)..."
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 bg-white/90 focus:border-sky-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={searchState.loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold disabled:opacity-50 transition cursor-pointer shrink-0"
          >
            {searchState.loading ? '...' : 'Screen'}
          </button>
        </form>

        {/* Oncology Contraindication Warning Banner */}
        {searchState.safetyAnalysis?.isFlagged && (
          <div className="rounded-2xl bg-rose-50/95 border-2 border-rose-300 p-3 space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-1.5 text-rose-900 font-extrabold text-xs uppercase">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Oncology Safety Flag (NHL Remission)</span>
            </div>
            {searchState.safetyAnalysis.flags.map((flag) => (
              <div key={flag.id} className="text-xs text-rose-800 space-y-0.5">
                <div className="font-extrabold text-rose-950">
                  {flag.category} — {flag.matchedTerms.join(', ').toUpperCase()}
                </div>
                <p className="leading-relaxed">{flag.clinicalWarning}</p>
              </div>
            ))}
          </div>
        )}

        {searchState.hasSearched && searchState.safetyAnalysis && !searchState.safetyAnalysis.isFlagged && (
          <div className="rounded-2xl bg-emerald-50/95 border border-emerald-200 px-3 py-2 text-xs text-emerald-900 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              No direct VEGF angiogenesis, GH/IGF-1 mitogenic, or mitochondrial biogenesis contraindications matched.
            </span>
          </div>
        )}

        {/* Missing Credentials Warning (Zero Mock Fallback Data) */}
        {!searchState.configured && (
          <div className="rounded-2xl bg-amber-50/95 border border-amber-300 p-3 text-xs text-amber-950 space-y-1 animate-fade-in">
            <div className="flex items-center gap-1.5 font-extrabold uppercase text-[11px] text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Google Custom Search Keys Required</span>
            </div>
            <p className="leading-relaxed text-amber-900">
              Add <code className="font-mono font-bold">GOOGLE_SEARCH_API_KEY</code> and{' '}
              <code className="font-mono font-bold">GOOGLE_SEARCH_CX</code> in{' '}
              <strong>Vercel Project Settings &rarr; Environment Variables</strong> to enable live web snippets.
            </p>
          </div>
        )}

        {searchState.error && searchState.configured && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 font-medium">
            {searchState.error}
          </div>
        )}

        {/* Real Live Search Results from Google Custom Search */}
        {searchState.results.length > 0 && (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {searchState.results.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-slate-200 p-2.5 hover:border-sky-500 bg-white/90 transition group shadow-2xs"
              >
                <div className="text-xs font-bold text-sky-700 group-hover:text-sky-800 flex items-center justify-between">
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 ml-1" />
                </div>
                <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                  {item.snippet}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
