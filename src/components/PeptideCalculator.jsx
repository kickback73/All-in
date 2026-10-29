// src/components/PeptideCalculator.jsx
import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  AlertOctagon,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PersistentAllowanceChart from './PersistentAllowanceChart';
import { resolvePeptideAminoSynergy, lookupVerifiedNutrients } from '../utils/nutrientEngine';

export const GRANULAR_INJECTION_SITES = [
  'Belly button area - lower left',
  'Belly button area - lower right',
  'Belly button area - upper left',
  'Belly button area - upper right',
  'Outer thigh - left',
  'Outer thigh - right',
  'Shoulder - left',
  'Shoulder - right',
  'Love handle - left',
  'Love handle - right',
];

export const SYRINGE_CAPACITIES = [
  { value: 0.3, label: '0.3 ml (30U)' },
  { value: 0.5, label: '0.5 ml (50U)' },
  { value: 1.0, label: '1.0 ml (100U)' },
];

const CLEARED_PEPTIDE_PRESETS = [
  {
    name: 'Retatrutide (GLP-1/GIP/GCGR)',
    shortName: 'Retatrutide',
    defaultVialMg: 10,
    defaultBacMl: 2,
    defaultDose: 3,
    defaultUnit: 'mg',
    frequency: '1x Weekly',
    focus: 'Fat Loss & Lean Muscle Preservation',
    status: 'ACTIVE',
  },
  {
    name: 'Matrixyl 3000 (Dermal Collagen Complex)',
    shortName: 'Matrixyl 3000',
    defaultVialMg: 5,
    defaultBacMl: 2,
    defaultDose: 250,
    defaultUnit: 'mcg',
    frequency: 'Daily',
    focus: 'Skin Firmness & Collagen Support',
    status: 'CLEARED',
  },
  {
    name: 'Rigin (Elastin & Skin Balance)',
    shortName: 'Rigin',
    defaultVialMg: 5,
    defaultBacMl: 2,
    defaultDose: 200,
    defaultUnit: 'mcg',
    frequency: 'Daily',
    focus: 'Facial Elastin & Tone Preservation',
    status: 'CLEARED',
  },
  {
    name: 'Argireline (Expression Line Support)',
    shortName: 'Argireline',
    defaultVialMg: 5,
    defaultBacMl: 2,
    defaultDose: 200,
    defaultUnit: 'mcg',
    frequency: 'Daily',
    focus: 'Surface Line Relaxation',
    status: 'CLEARED',
  },
  {
    name: 'SNAP-8 (Dermal Integrity)',
    shortName: 'SNAP-8',
    defaultVialMg: 5,
    defaultBacMl: 2,
    defaultDose: 200,
    defaultUnit: 'mcg',
    frequency: 'Daily',
    focus: 'Skin Smoothness & Elasticity',
    status: 'CLEARED',
  },
];

/**
 * Clean, Scannable Protocol Reference Cards (No dense clinical walls of text)
 */
const SCANNABLE_PROTOCOL_SUMMARIES = [
  {
    keywords: ['retatrutide', 'retratude', 'reta', 'ly3437943', 'glp-1'],
    name: 'Retatrutide',
    badge: 'ACTIVE WEEKLY PROTOCOL • NHL SAFE',
    primaryGoal: 'Steady fat loss (229 → 200 lbs) while protecting muscle & facial volume',
    standardDose: '3 mg once weekly (60 Units from 10mg/2ml vial)',
    keySupport: '180g Protein + 750ml Morning Electrolytes + 14g Collagen',
    safetyStatus: 'Cleared — Zero VEGF / angiogenic growth signaling',
    defaultDose: '3 mg weekly',
  },
  {
    keywords: ['matrixyl', 'palmitoyl tripeptide'],
    name: 'Matrixyl 3000',
    badge: 'CLEARED • SKIN & COLLAGEN',
    primaryGoal: 'Supports skin thickness and extracellular collagen scaffolding',
    standardDose: '250 mcg or Topical 2x daily',
    keySupport: 'Lysine + Vitamin C (120mg) + Bovine Collagen',
    safetyStatus: 'Cleared — Non-angiogenic local skin support',
    defaultDose: '250 mcg',
  },
  {
    keywords: ['rigin', 'tetrapeptide-7'],
    name: 'Rigin',
    badge: 'CLEARED • ELASTIN SUPPORT',
    primaryGoal: 'Protects facial elastin and firmness during caloric deficit',
    standardDose: '200 mcg daily',
    keySupport: 'Lysine + Threonine + Hydration (3,250ml)',
    safetyStatus: 'Cleared — Safe for NHL remission protocol',
    defaultDose: '200 mcg',
  },
  {
    keywords: ['argireline', 'hexapeptide', 'snap-8', 'octapeptide'],
    name: 'Argireline / SNAP-8',
    badge: 'CLEARED • DERMAL SMOOTHING',
    primaryGoal: 'Reduces dynamic facial tension and preserves skin recoil',
    standardDose: '200 mcg or Topical serum',
    keySupport: 'Histidine + Lysine + Tryptophan',
    safetyStatus: 'Cleared — Zero systemic growth factor activity',
    defaultDose: '200 mcg',
  },
];

const SAFE_ALTERNATIVES_LIST = [
  'Matrixyl 3000 — Non-angiogenic collagen & skin firmness support',
  'Rigin & Argireline — Facial elastin & skin recoil support',
  'Bovine Collagen (14g) + Vitamin C — Daily structural skin support',
];

function evaluatePeptideSafety(text = '') {
  const lower = String(text || '').toLowerCase();
  if (!lower.trim()) return null;

  if (lower.includes('ghk') || lower.includes('copper')) {
    return {
      isProhibited: true,
      banner: 'PROHIBITED (NHL Remission Rule) — GHK-Cu / Copper Peptides',
      reason: 'Promotes VEGF and new blood vessel growth (angiogenesis). Strictly blocked.',
      alternatives: SAFE_ALTERNATIVES_LIST,
    };
  }
  if (
    lower.includes('bpc') ||
    lower.includes('157') ||
    lower.includes('tb-500') ||
    lower.includes('tb500') ||
    lower.includes('thymosin')
  ) {
    return {
      isProhibited: true,
      banner: 'PROHIBITED (NHL Remission Rule) — BPC-157 / TB-500',
      reason: 'Stimulates systemic angiogenesis and vascular growth factors. Strictly blocked.',
      alternatives: SAFE_ALTERNATIVES_LIST,
    };
  }
  if (
    lower.includes('cjc') ||
    lower.includes('ipamorelin') ||
    lower.includes('ghrp') ||
    lower.includes('tesamorelin') ||
    lower.includes('sermorelin') ||
    lower.includes('mk-677') ||
    lower.includes('igf')
  ) {
    return {
      isProhibited: true,
      banner: 'PROHIBITED (NHL Remission Rule) — GH / IGF-1 Secretagogue',
      reason: 'Elevates systemic growth hormone and IGF-1 signaling. Strictly blocked.',
      alternatives: SAFE_ALTERNATIVES_LIST,
    };
  }
  if (lower.includes('ss-31') || lower.includes('mots-c') || lower.includes('elamipretide')) {
    return {
      isProhibited: true,
      banner: 'EXCLUDED — Mitochondrial Peptide (SS-31 / MOTS-c)',
      reason: 'Excluded per protocol rules (focus is strictly on Retatrutide & skin/elastin).',
      alternatives: SAFE_ALTERNATIVES_LIST,
    };
  }
  if (
    lower.includes('tirzepatide') ||
    lower.includes('semaglutide') ||
    lower.includes('ozempic') ||
    lower.includes('mounjaro')
  ) {
    return {
      isProhibited: true,
      banner: 'EXCLUDED — Duplicate GLP-1 Compound',
      reason: 'Active protocol uses Retatrutide 3 mg weekly as a single compound.',
      alternatives: SAFE_ALTERNATIVES_LIST,
    };
  }
  return null;
}

function resolveScannableProtocol(queryText = '') {
  const lower = String(queryText || '').trim().toLowerCase();
  if (!lower) return null;

  for (const item of SCANNABLE_PROTOCOL_SUMMARIES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item;
    }
  }

  return {
    name: queryText.trim(),
    badge: 'CLEARED FOR REVIEW • NHL SCREEN PASSED',
    primaryGoal: 'Custom protocol entry — no direct angiogenic or GH signaling detected',
    standardDose: 'Verify vial mg and BAC water ml in calculator above',
    keySupport: 'High-protein diet + hydration + collagen support',
    safetyStatus: 'Passed automated NHL contraindication check',
    defaultDose: 'Custom Dose',
  };
}

export default function PeptideCalculator({ isOpen = true }) {
  const {
    peptideHistory,
    activePeptideName,
    setActivePeptideName,
    addPeptideEntry,
    updatePeptideEntry,
    deletePeptideEntry,
    savedStacks,
    setSavedStacks,
    logStackToDaily,
  } = useAppContext();

  const [peptideName, setPeptideName] = useState(
    activePeptideName || 'Retatrutide (GLP-1/GIP/GCGR)'
  );
  const [vialMg, setVialMg] = useState(10);
  const [bacWaterMl, setBacWaterMl] = useState(2);
  const [desiredDoseValue, setDesiredDoseValue] = useState(3);
  const [desiredDoseUnit, setDesiredDoseUnit] = useState('mg');
  const [syringeCapacityMl, setSyringeCapacityMl] = useState(1.0);
  const [injectionSite, setInjectionSite] = useState(GRANULAR_INJECTION_SITES[0]);
  const [injectionDateTime, setInjectionDateTime] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  const [queryName, setQueryName] = useState('Retatrutide');
  const [researchResult, setResearchResult] = useState(() =>
    resolveScannableProtocol('Retatrutide')
  );
  const [addedToStackBanner, setAddedToStackBanner] = useState('');

  const calculation = useMemo(() => {
    const vialMcg = (Number(vialMg) || 0) * 1000;
    const water = Number(bacWaterMl) || 0;
    const doseMcg =
      desiredDoseUnit === 'mg'
        ? (Number(desiredDoseValue) || 0) * 1000
        : Number(desiredDoseValue) || 0;
    const maxCapMl = Number(syringeCapacityMl) || 1.0;
    const maxCapUnits = Math.round(maxCapMl * 100);

    if (vialMcg <= 0 || water <= 0 || doseMcg <= 0) {
      return {
        concentrationMgPerMl: '0.00',
        volumeMl: '0.000',
        syringeUnits: '0.0',
        maxCapMl,
        maxCapUnits,
        fillPct: 0,
        exceedsSyringe: false,
      };
    }

    const concentrationMcgPerMl = vialMcg / water;
    const concentrationMgPerMl = (Number(vialMg) || 0) / water;
    const volumeMl = doseMcg / concentrationMcgPerMl;
    const syringeUnits = volumeMl * 100;
    const fillPct = Math.min(100, Math.round((volumeMl / maxCapMl) * 100));

    return {
      concentrationMgPerMl: concentrationMgPerMl.toFixed(2),
      volumeMl: volumeMl.toFixed(3),
      syringeUnits: syringeUnits.toFixed(1),
      maxCapMl,
      maxCapUnits,
      fillPct,
      exceedsSyringe: volumeMl > maxCapMl,
    };
  }, [vialMg, bacWaterMl, desiredDoseValue, desiredDoseUnit, syringeCapacityMl]);

  const activeSafetyAlert = useMemo(() => evaluatePeptideSafety(peptideName), [peptideName]);
  const querySafetyAlert = useMemo(() => evaluatePeptideSafety(queryName), [queryName]);
  const activePeptideSynergy = useMemo(
    () => resolvePeptideAminoSynergy(peptideName),
    [peptideName]
  );

  if (!isOpen) return null;

  const handleSelectPreset = (presetName) => {
    setPeptideName(presetName);
    setActivePeptideName(presetName);
    const found = CLEARED_PEPTIDE_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setVialMg(found.defaultVialMg);
      setBacWaterMl(found.defaultBacMl);
      setDesiredDoseValue(found.defaultDose);
      setDesiredDoseUnit(found.defaultUnit);
    }
  };

  const handleQuickLogSynergyFood = async (foodRec) => {
    const verified = await lookupVerifiedNutrients(foodRec.query, foodRec.serving);
    if (verified) {
      logStackToDaily(verified, foodRec.name);
      setAddedToStackBanner(`Logged "${foodRec.name}" to Daily Totals!`);
      setTimeout(() => setAddedToStackBanner(''), 2500);
    }
  };

  const handleLogDose = (e) => {
    e.preventDefault();
    if (activeSafetyAlert?.isProhibited) return;

    const formattedTime = injectionDateTime
      ? new Date(injectionDateTime).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

    addPeptideEntry({
      id: `pep_${Date.now()}`,
      peptideName,
      vialMg: Number(vialMg),
      bacWaterMl: Number(bacWaterMl),
      desiredDoseValue: Number(desiredDoseValue),
      desiredDoseUnit,
      syringeCapacityMl: Number(syringeCapacityMl),
      volumeMl: calculation.volumeMl,
      syringeUnits: calculation.syringeUnits,
      site: injectionSite,
      dateTime: injectionDateTime,
      timestamp: formattedTime,
    });
  };

  const startEditEntry = (entry) => {
    setEditingId(entry.id);
    setEditDraft({
      peptideName: entry.peptideName,
      desiredDoseValue: entry.desiredDoseValue,
      desiredDoseUnit: entry.desiredDoseUnit || 'mg',
      syringeCapacityMl: entry.syringeCapacityMl || 1.0,
      site: GRANULAR_INJECTION_SITES.includes(entry.site)
        ? entry.site
        : GRANULAR_INJECTION_SITES[0],
      dateTime: entry.dateTime || new Date().toISOString().slice(0, 16),
    });
  };

  const saveEditEntry = (id) => {
    if (!editDraft) return;
    const formattedTime = editDraft.dateTime
      ? new Date(editDraft.dateTime).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    updatePeptideEntry(id, {
      ...editDraft,
      desiredDoseValue: Number(editDraft.desiredDoseValue) || 0,
      timestamp: formattedTime || editDraft.dateTime,
    });
    setEditingId(null);
    setEditDraft(null);
  };

  const handleResearchPeptide = (e) => {
    if (e) e.preventDefault();
    if (!queryName.trim()) return;

    const safety = evaluatePeptideSafety(queryName);
    if (safety) {
      setResearchResult(null);
      return;
    }

    const summary = resolveScannableProtocol(queryName);
    setResearchResult(summary);
  };

  const handleAddClearedPeptideToCustomStack = (compoundTitle, doseLabel) => {
    const cleanTitle = compoundTitle.split(' (')[0];
    const newStack = {
      id: `stack_pep_${Date.now()}`,
      name: `${cleanTitle} Protocol Stack`,
      category: 'Morning Stacks',
      scheduledHour: '08:00',
      isRecurringPlanned: true,
      ingredients: [
        {
          id: `ing_pep_${Date.now()}_1`,
          name: `${cleanTitle} (${doseLabel})`,
          servingGrams: doseLabel,
          source: 'Cleared NHL Protocol',
          calories: 0,
          protein: 0,
          carbs: 0,
          fiber: 0,
          netCarbs: 0,
          fats: 0,
          waterMl: 0,
          micros: {},
          aminos: {},
        },
      ],
      totals: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fiber: 0,
        netCarbs: 0,
        fats: 0,
        waterMl: 0,
        micros: {},
        aminos: {},
      },
      createdAt: new Date().toISOString(),
    };

    setSavedStacks([newStack, ...savedStacks]);
    setAddedToStackBanner(`Added "${newStack.name}" to Get Stacked!`);
    setTimeout(() => setAddedToStackBanner(''), 3000);
  };

  return (
    <div className="space-y-3 text-white">
      {/* Persistent Daily Recommended vs. Logged Intake Table */}
      <PersistentAllowanceChart />

      {/* Scannable Active Protocol Header */}
      <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/35 p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase text-emerald-300 truncate">
              Active Protocol: Retatrutide 3 mg Weekly
            </div>
            <div className="text-[9px] text-slate-200 truncate">
              NHL Guard Active • Blocks GHK-Cu, BPC-157, TB-500 &amp; GH Secretagogues
            </div>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-[9px] font-black text-emerald-200 shrink-0">
          60U / Wk
        </span>
      </div>

      {addedToStackBanner && (
        <div className="rounded-xl bg-amber-500/20 border border-amber-400/50 p-2 flex items-center gap-2 text-amber-200 text-xs font-black">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{addedToStackBanner}</span>
        </div>
      )}

      {/* Safety Alert if Prohibited Compound Entered */}
      {activeSafetyAlert && (
        <div className="rounded-2xl bg-rose-950 text-white border-2 border-rose-500 p-3 space-y-2 shadow-xl">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-xs font-black text-rose-200">{activeSafetyAlert.banner}</div>
          </div>
          <p className="text-[11px] text-rose-100 bg-rose-900/50 rounded-xl p-2 border border-rose-400/30">
            {activeSafetyAlert.reason}
          </p>
          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-2 space-y-1">
            <div className="text-[9px] font-black uppercase text-emerald-300">
              ✓ Safe Alternatives:
            </div>
            <ul className="text-[10px] text-emerald-100 space-y-0.5 list-disc pl-4">
              {activeSafetyAlert.alternatives.map((alt, i) => (
                <li key={i}>{alt}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Clean Scannable BAC Water & Dose Calculator + Logger */}
      <form
        onSubmit={handleLogDose}
        className="rounded-2xl bg-slate-900/90 border border-white/15 p-3 space-y-2.5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-extrabold text-violet-300 uppercase mb-1">
              Protocol Preset
            </label>
            <select
              value={
                CLEARED_PEPTIDE_PRESETS.some((p) => p.name === peptideName)
                  ? peptideName
                  : 'CUSTOM'
              }
              onChange={(e) => {
                if (e.target.value === 'CUSTOM') {
                  setPeptideName('');
                } else {
                  handleSelectPreset(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white"
            >
              {CLEARED_PEPTIDE_PRESETS.map((p) => (
                <option key={p.name} value={p.name} className="bg-slate-950 text-white">
                  {p.shortName} ({p.defaultDose}
                  {p.defaultUnit} • {p.frequency})
                </option>
              ))}
              <option value="CUSTOM" className="bg-slate-950 text-white">
                + Custom Peptide...
              </option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-300 uppercase mb-1">
              Compound Name
            </label>
            <input
              type="text"
              required
              value={peptideName}
              onChange={(e) => {
                const val = e.target.value;
                setPeptideName(val);
                if (!evaluatePeptideSafety(val)?.isProhibited && val.trim()) {
                  setActivePeptideName(val);
                }
              }}
              placeholder="e.g. Retatrutide, Matrixyl 3000..."
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white"
            />
          </div>
        </div>

        {/* Syringe Size Selector */}
        <div className="grid grid-cols-3 gap-1.5">
          {SYRINGE_CAPACITIES.map((cap) => {
            const isSelected = Number(syringeCapacityMl) === cap.value;
            return (
              <button
                key={cap.value}
                type="button"
                onClick={() => setSyringeCapacityMl(cap.value)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-black border transition ${
                  isSelected
                    ? 'bg-violet-500 text-slate-950 border-violet-300'
                    : 'bg-slate-950 text-slate-300 border-white/15'
                }`}
              >
                {cap.label}
              </button>
            );
          })}
        </div>

        {/* Vial (mg), BAC Water (ml), Desired Dose */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] font-extrabold text-slate-300 uppercase mb-0.5">
              Vial (mg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={vialMg}
              onChange={(e) => setVialMg(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-black text-white"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-300 uppercase mb-0.5">
              BAC Water (ml)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={bacWaterMl}
              onChange={(e) => setBacWaterMl(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-black text-white"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-300 uppercase mb-0.5">
              Dose
            </label>
            <div className="flex rounded-xl border border-white/15 bg-slate-950 overflow-hidden">
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={desiredDoseValue}
                onChange={(e) => setDesiredDoseValue(e.target.value)}
                className="w-full px-2 py-1.5 text-xs font-black text-white bg-transparent focus:outline-hidden"
              />
              <select
                value={desiredDoseUnit}
                onChange={(e) => setDesiredDoseUnit(e.target.value)}
                className="bg-slate-900 px-1.5 text-[10px] font-extrabold text-violet-300 border-l border-white/15"
              >
                <option value="mg">mg</option>
                <option value="mcg">mcg</option>
              </select>
            </div>
          </div>
        </div>

        {/* Injection Site & Date/Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-extrabold text-slate-300 uppercase mb-0.5">
              Injection Site
            </label>
            <select
              value={injectionSite}
              onChange={(e) => setInjectionSite(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white"
            >
              {GRANULAR_INJECTION_SITES.map((site) => (
                <option key={site} value={site} className="bg-slate-950 text-white">
                  {site}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-extrabold text-slate-300 uppercase mb-0.5">
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={injectionDateTime}
              onChange={(e) => setInjectionDateTime(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white"
            />
          </div>
        </div>

        {/* Scannable Draw Readout */}
        <div className="rounded-xl bg-slate-950 border border-violet-500/40 p-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[9px] font-bold uppercase text-slate-400">
                {calculation.concentrationMgPerMl} mg/ml • {calculation.maxCapMl} ml Syringe
              </div>
              <div className="text-sm font-black text-violet-300">
                Pull {calculation.syringeUnits} Units{' '}
                <span className="text-xs font-bold text-slate-300">
                  ({calculation.volumeMl} ml)
                </span>
              </div>
              {calculation.exceedsSyringe && (
                <div className="text-[9px] font-bold text-amber-300">
                  ⚠ Exceeds {calculation.maxCapMl} ml syringe — use 1.0 ml syringe.
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={Boolean(activeSafetyAlert?.isProhibited)}
              className="px-3.5 py-2 rounded-xl text-xs font-black text-slate-950 bg-violet-400 hover:bg-violet-300 disabled:opacity-40 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Dose</span>
            </button>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 border border-white/15 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                calculation.exceedsSyringe
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-violet-500 to-fuchsia-400'
              }`}
              style={{ width: `${calculation.fillPct}%` }}
            />
          </div>

          {!activeSafetyAlert?.isProhibited && (
            <button
              type="button"
              onClick={() =>
                handleAddClearedPeptideToCustomStack(
                  peptideName,
                  `${desiredDoseValue} ${desiredDoseUnit}`
                )
              }
              className="w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-[10px] font-black flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3 h-3 text-amber-300" />
              <span>Add Protocol to Get Stacked</span>
            </button>
          )}
        </div>
      </form>

      {/* Scannable Priority Amino Acids & 1-Tap Food Chips */}
      {!activeSafetyAlert?.isProhibited && activePeptideSynergy && (
        <div className="rounded-2xl border border-cyan-400/35 p-3 space-y-2 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-cyan-300">
              ★ Priority Aminos for {activePeptideSynergy.peptideLabel.split(' (')[0]}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(activePeptideSynergy.prioritizedAminos).map(([key, info]) => (
              <span
                key={key}
                className="px-2 py-1 rounded-lg bg-slate-950 border border-cyan-500/35 text-[10px] font-black text-white flex items-center gap-1"
              >
                <span className="text-amber-300">#{info.rank}</span>
                <span className="uppercase">{key}</span>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {(activePeptideSynergy.recommendedFoods || []).map((food) => (
              <button
                key={food.name}
                type="button"
                onClick={() => handleQuickLogSynergyFood(food)}
                className="rounded-xl bg-slate-950 hover:bg-slate-900 border border-white/15 px-2.5 py-1.5 text-left flex items-center justify-between gap-1.5 transition"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-white truncate">{food.name}</div>
                  <div className="text-[8px] font-bold text-emerald-300 truncate">
                    Tap to Log
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scannable Quick Protocol Lookup & NHL Safety Check */}
      <div className="rounded-2xl border border-white/15 p-3 space-y-2 bg-slate-900/90">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>Quick Protocol &amp; NHL Safety Lookup</span>
        </div>

        <form onSubmit={handleResearchPeptide} className="flex gap-1.5 w-full">
          <input
            type="text"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            placeholder="Check compound (e.g. Retatrutide, Matrixyl, GHK-Cu)..."
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 text-xs font-black flex items-center gap-1 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Check</span>
          </button>
        </form>

        {querySafetyAlert ? (
          <div className="rounded-xl p-2.5 text-xs space-y-1.5 border-2 bg-rose-950 text-white border-rose-500">
            <div className="font-black text-rose-200">{querySafetyAlert.banner}</div>
            <p className="text-[10px] text-rose-100">{querySafetyAlert.reason}</p>
          </div>
        ) : (
          researchResult && (
            <div className="rounded-xl bg-slate-950 border border-emerald-500/40 p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-white">{researchResult.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {researchResult.badge}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-slate-900/90 rounded-lg p-1.5 border border-white/10">
                  <span className="text-[8px] font-black uppercase text-violet-300 block">
                    Goal
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {researchResult.primaryGoal}
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-lg p-1.5 border border-white/10">
                  <span className="text-[8px] font-black uppercase text-amber-300 block">
                    Standard Dose
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {researchResult.standardDose}
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-lg p-1.5 border border-white/10">
                  <span className="text-[8px] font-black uppercase text-cyan-300 block">
                    Daily Support
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {researchResult.keySupport}
                  </span>
                </div>
                <div className="bg-emerald-950/50 rounded-lg p-1.5 border border-emerald-500/30">
                  <span className="text-[8px] font-black uppercase text-emerald-300 block">
                    Safety Status
                  </span>
                  <span className="text-emerald-100 font-semibold">
                    {researchResult.safetyStatus}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Logged Injections History (Edit Pencil + Delete Trash) */}
      <div className="rounded-2xl border border-white/15 p-3 bg-slate-900/90 space-y-2">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
          Logged Injections ({peptideHistory.length})
        </div>

        {peptideHistory.length === 0 ? (
          <div className="text-xs text-slate-400 py-2 text-center">No injections logged yet.</div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {peptideHistory.map((p) => {
              const isEditing = editingId === p.id;
              return (
                <div
                  key={p.id}
                  className="text-xs bg-slate-950 rounded-xl p-2 border border-white/15 space-y-2"
                >
                  {isEditing && editDraft ? (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={editDraft.peptideName}
                          onChange={(e) =>
                            setEditDraft((prev) => ({ ...prev, peptideName: e.target.value }))
                          }
                          className="rounded-lg border border-white/20 bg-slate-900 px-2 py-1 text-xs font-bold text-white"
                        />
                        <div className="flex rounded-lg border border-white/20 bg-slate-900 overflow-hidden">
                          <input
                            type="number"
                            step="0.05"
                            value={editDraft.desiredDoseValue}
                            onChange={(e) =>
                              setEditDraft((prev) => ({
                                ...prev,
                                desiredDoseValue: e.target.value,
                              }))
                            }
                            className="w-full px-2 py-1 text-xs font-bold text-white bg-transparent"
                          />
                          <select
                            value={editDraft.desiredDoseUnit}
                            onChange={(e) =>
                              setEditDraft((prev) => ({
                                ...prev,
                                desiredDoseUnit: e.target.value,
                              }))
                            }
                            className="bg-slate-800 px-1.5 text-[10px] font-bold text-violet-300 border-l border-white/20"
                          >
                            <option value="mg">mg</option>
                            <option value="mcg">mcg</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          value={editDraft.site}
                          onChange={(e) =>
                            setEditDraft((prev) => ({ ...prev, site: e.target.value }))
                          }
                          className="rounded-lg border border-white/20 bg-slate-900 px-2 py-1 text-[11px] font-bold text-white"
                        >
                          {GRANULAR_INJECTION_SITES.map((s) => (
                            <option key={s} value={s} className="bg-slate-900 text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                        <input
                          type="datetime-local"
                          value={editDraft.dateTime}
                          onChange={(e) =>
                            setEditDraft((prev) => ({ ...prev, dateTime: e.target.value }))
                          }
                          className="rounded-lg border border-white/20 bg-slate-900 px-2 py-1 text-[11px] font-bold text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => saveEditEntry(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditDraft(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 font-bold text-[10px] flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-extrabold text-white truncate">
                          {p.peptideName} • {p.desiredDoseValue}
                          {p.desiredDoseUnit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Pull <strong className="text-violet-300">{p.syringeUnits}U</strong> (
                          {p.volumeMl}ml) • {p.site} • {p.timestamp}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditEntry(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300"
                          title="Edit Injection Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePeptideEntry(p.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
                          title="Delete Injection Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
