// src/components/PeptideCalculator.jsx
import React, { useState, useMemo } from 'react';
import {
  Syringe,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

const PROHIBITED_NHL_PEPTIDES = [
  'ghk-cu', 'ghk', 'copper', 'bpc-157', 'bpc 157', 'tb-500', 'tb500',
  'cjc-1295', 'cjc', 'ipamorelin', 'ghrp', 'tesamorelin', 'sermorelin',
  'igf-1', 'mots-c', 'ss-31', 'elamipretide', 'epitalon',
];

export default function PeptideCalculator({ onQuickLogDose }) {
  // Reconstitution & Auto BAC Water Calculator State (Defaulting to Dan's Retatrutide 3 mg weekly protocol)
  const [peptideType, setPeptideType] = useState('Retatrutide');
  const [vialMg, setVialMg] = useState(10);
  const [bacWaterMl, setBacWaterMl] = useState(2.0);
  const [desiredDose, setDesiredDose] = useState(3.0);
  const [doseUnit, setDoseUnit] = useState('mg'); // 'mg' | 'mcg'
  const [syringeSizeMl, setSyringeSizeMl] = useState(1.0);
  const [site, setSite] = useState('SubQ Periumbilical');

  // Google Custom Search & Oncology Guardrail State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState({
    loading: false,
    hasSearched: false,
    configured: true,
    missingKeys: [],
    error: null,
    safetyAnalysis: null,
    results: [],
  });

  // Check if typed peptide triggers Dan's NHL Remission Prohibition
  const isProhibitedCompound = useMemo(() => {
    const lower = (peptideType || '').toLowerCase();
    return PROHIBITED_NHL_PEPTIDES.some((p) => lower.includes(p));
  }, [peptideType]);

  // Auto BAC Water & Syringe Dose Calculation
  const calc = useMemo(() => {
    const mg = Number(vialMg) || 0;
    const ml = Number(bacWaterMl) || 0;
    const rawDose = Number(desiredDose) || 0;
    const doseMcg = doseUnit === 'mg' ? rawDose * 1000 : rawDose;
    const doseMg = doseUnit === 'mg' ? rawDose : rawDose / 1000;

    if (mg <= 0 || ml <= 0 || doseMcg <= 0) {
      return {
        concentrationMgPerMl: 0,
        concentrationMcgPerMl: 0,
        drawVolumeMl: 0,
        syringeUnits: 0,
        dosesPerVial: 0,
        idealBacFor30Units: 0,
      };
    }

    const totalMcg = mg * 1000;
    const concentrationMgPerMl = mg / ml;
    const concentrationMcgPerMl = totalMcg / ml;
    const drawVolumeMl = doseMcg / concentrationMcgPerMl;
    const syringeUnits = drawVolumeMl * 100; // U-100 insulin syringe standard (100 IU = 1.0 mL)
    const dosesPerVial = Math.round((totalMcg / doseMcg) * 10) / 10;

    // Auto BAC Water recommendation so desired dose = clean 30 Units (0.30 mL)
    const idealBacFor30Units = Number(((mg / doseMg) * 0.3).toFixed(2));

    return {
      concentrationMgPerMl: Number(concentrationMgPerMl.toFixed(2)),
      concentrationMcgPerMl: Math.round(concentrationMcgPerMl),
      drawVolumeMl: Number(drawVolumeMl.toFixed(3)),
      syringeUnits: Number(syringeUnits.toFixed(1)),
      dosesPerVial,
      idealBacFor30Units,
      doseMcg,
      doseMg,
    };
  }, [vialMg, bacWaterMl, desiredDose, doseUnit]);

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
        error: data.error || null,
        safetyAnalysis: data.safetyAnalysis || null,
        results: data.results || [],
      });
    } catch {
      setSearchState({
        loading: false,
        hasSearched: true,
        configured: true,
        missingKeys: [],
        error: 'Network error communicating with peptide search service.',
        safetyAnalysis: null,
        results: [],
      });
    }
  };

  const maxUnits = syringeSizeMl * 100;
  const fillPct = Math.min(100, Math.max(0, (calc.syringeUnits / maxUnits) * 100));

  return (
    <div className="space-y-3 text-slate-900">
      {/* 1. Auto BAC Water & Syringe Dose Calculator */}
      <div className="rounded-2xl bg-white/85 backdrop-blur-xs border border-slate-200/90 p-3.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Syringe className="w-4 h-4 text-sky-700" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Peptide & Auto BAC Water Calculator
            </h4>
          </div>
          <span className="text-[11px] font-black text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
            {calc.concentrationMgPerMl} mg/mL ({calc.concentrationMcgPerMl} mcg/mL)
          </span>
        </div>

        {/* Peptide Type Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-0.5">
              Peptide Type / Compound
            </label>
            <input
              type="text"
              value={peptideType}
              onChange={(e) => setPeptideType(e.target.value)}
              placeholder="e.g., Retatrutide"
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-0.5">
              Injection Site
            </label>
            <input
              type="text"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Immediate NHL Remission Contraindication Alert if Prohibited Peptide Typed */}
        {isProhibitedCompound && (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-400 p-2.5 text-xs text-rose-900 font-bold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase block">STRICT NHL REMISSION PROHIBITION:</span>
              {peptideType} is flagged for angiogenic / VEGF / mitogenic or mitochondrial proliferation risk. Do not administer.
            </div>
          </div>
        )}

        {/* Vial (mg), BAC Water (mL), Desired Dose (mg/mcg) */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600">Vial Amount (mg)</label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={vialMg}
              onChange={(e) => setVialMg(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600">BAC Water (mL)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={bacWaterMl}
              onChange={(e) => setBacWaterMl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-900 bg-white"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold text-slate-600">Desired Dose</label>
              <button
                type="button"
                onClick={() => {
                  if (doseUnit === 'mg') {
                    setDoseUnit('mcg');
                    setDesiredDose(Number(desiredDose) * 1000);
                  } else {
                    setDoseUnit('mg');
                    setDesiredDose(Number(desiredDose) / 1000);
                  }
                }}
                className="text-[9px] font-black text-sky-700 bg-sky-50 px-1.5 rounded border border-sky-200 cursor-pointer"
              >
                {doseUnit.toUpperCase()} ⇄
              </button>
            </div>
            <input
              type="number"
              min="0.01"
              step="any"
              value={desiredDose}
              onChange={(e) => setDesiredDose(e.target.value)}
              className="w-full rounded-xl border border-sky-300 px-2.5 py-1.5 text-xs font-black text-sky-950 bg-white"
            />
          </div>
        </div>

        {/* Auto-Calculated Draw Output Banner */}
        <div className="rounded-xl bg-[#F4F8FB] border border-sky-200 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Auto-Calculated Syringe Pull
              </span>
              <span className="text-base font-black text-sky-800">
                Pull {calc.syringeUnits} Units (IU)
              </span>
              <span className="text-xs font-bold text-slate-600 ml-1.5">
                = {calc.drawVolumeMl} mL
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 block">Vial Yield</span>
              <span className="text-xs font-black text-slate-800">{calc.dosesPerVial} doses</span>
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${fillPct}%` }}
            />
          </div>

          {calc.idealBacFor30Units > 0 && calc.idealBacFor30Units <= 5 && (
            <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5">
              <span>
                💡 Want this dose to equal an easy <strong>30 Units (0.30 mL)</strong>?
              </span>
              <button
                type="button"
                onClick={() => setBacWaterMl(calc.idealBacFor30Units)}
                className="font-extrabold text-sky-700 hover:underline cursor-pointer"
              >
                Use {calc.idealBacFor30Units} mL BAC
              </button>
            </div>
          )}
        </div>

        {onQuickLogDose && (
          <button
            type="button"
            onClick={() => {
              if (!peptideType.trim()) return;
              onQuickLogDose({
                name: peptideType.trim(),
                doseMg: calc.doseMg,
                doseMcg: calc.doseMcg,
                vialMg: Number(vialMg),
                bacWaterMl: Number(bacWaterMl),
                units: calc.syringeUnits,
                drawVolumeMl: calc.drawVolumeMl,
                site,
              });
            }}
            className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition shadow-2xs cursor-pointer"
          >
            Record {peptideType || 'Peptide'} ({desiredDose} {doseUnit} • {calc.syringeUnits} IU)
          </button>
        )}
      </div>

      {/* 2. Non-Mitochondrial / Elastin Peptide Search & NHL Safety Engine */}
      <div className="rounded-2xl bg-white/85 backdrop-blur-xs border border-slate-200/90 p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-700" />
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
              Peptide Safety & Elastin Lookup (NHL Guard)
            </h4>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-1.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Screen peptide (e.g. Matrixyl, Rigin, GHK-Cu)..."
            className="flex-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-white"
          />
          <button
            type="submit"
            disabled={searchState.loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
          >
            {searchState.loading ? '...' : 'Screen'}
          </button>
        </form>

        {searchState.safetyAnalysis?.isFlagged && (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-300 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-900 font-extrabold text-[11px] uppercase">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>PROHIBITED (Dan&apos;s NHL Remission Rule)</span>
            </div>
            {searchState.safetyAnalysis.flags.map((flag) => (
              <p key={flag.id} className="text-[11px] text-rose-800 leading-snug">
                <strong>{flag.matchedTerms.join(', ').toUpperCase()}:</strong> {flag.clinicalWarning}
              </p>
            ))}
          </div>
        )}

        {searchState.hasSearched && searchState.safetyAnalysis && !searchState.safetyAnalysis.isFlagged && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-2 text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>No angiogenesis, VEGF, GH/IGF-1, or mitochondrial flags detected.</span>
          </div>
        )}

        {!searchState.configured && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-2.5 text-[11px] text-amber-950">
            <strong>Google Search Keys Missing:</strong> Add <code>GOOGLE_SEARCH_API_KEY</code> &{' '}
            <code>GOOGLE_SEARCH_CX</code> in Vercel Environment Variables.
          </div>
        )}

        {searchState.results.length > 0 && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {searchState.results.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-slate-200 p-2 hover:border-sky-500 bg-white text-[11px]"
              >
                <div className="font-bold text-sky-700 line-clamp-1 flex items-center justify-between">
                  <span>{item.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </div>
                <div className="text-slate-600 line-clamp-2 mt-0.5">{item.snippet}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
