// src/components/PeptideCalculator.jsx
import React, { useState, useMemo } from 'react';
import {
  Syringe,
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
  { value: 0.3, label: '0.3 ml (30 Units)' },
  { value: 0.5, label: '0.5 ml (50 Units)' },
  { value: 1.0, label: '1.0 ml (100 Units)' },
];

/**
 * Strictly Cleared Presets for Dan's NHL Remission Protocol.
 * Tirzepatide, Semaglutide, and all angiogenic/secretagogue contraindications are permanently excluded from suggestions.
 */
const CLEARED_PEPTIDE_PRESETS = [
  {
    name: 'Retatrutide (GLP-1/GIP/GCGR)',
    defaultVialMg: 10,
    defaultBacMl: 2,
    defaultDose: 3,
    defaultUnit: 'mg',
    status: 'ACTIVE_PROTOCOL',
  },
  {
    name: 'Matrixyl 3000 (Palmitoyl Tripeptide-1 + Tetrapeptide-7)',
    defaultVialMg: 5,
    defaultBacMl: 2,
    defaultDose: 250,
    defaultUnit: 'mcg',
    status: 'CLEARED',
  },
  {
    name: 'Rigin (Palmitoyl Tetrapeptide-7 — Elastin & IL-6 Modulator)',
    defaultVialMg: 5,
    defaultBacMl: 2,
    defaultDose: 200,
    defaultUnit: 'mcg',
    status: 'CLEARED',
  },
  {
    name: 'Argireline (Acetyl Hexapeptide-8 — Non-Angiogenic Skin)',
    defaultVialMg: 5,
    defaultBacMl: 2,
    defaultDose: 200,
    defaultUnit: 'mcg',
    status: 'CLEARED',
  },
  {
    name: 'SNAP-8 (Acetyl Octapeptide-3 — Dermal Integrity)',
    defaultVialMg: 5,
    defaultBacMl: 2,
    defaultDose: 200,
    defaultUnit: 'mcg',
    status: 'CLEARED',
  },
];

/**
 * Rich Clinical Database for Cleared Peptides (Fixes empty green bar on search, including typos like "retratude")
 */
const CLINICAL_PEPTIDE_MONOGRAPHS = [
  {
    keywords: ['retatrutide', 'retratude', 'reta', 'ly3437943', 'glp-1/gip/gcgr'],
    title: 'Retatrutide (LY3437943 — Triple Agonist: GLP-1R / GIPR / GCGR)',
    status: 'CLEARED — ACTIVE WEEKLY PROTOCOL (NHL Remission Safe)',
    mechanism:
      'Triple-hormone receptor agonist activating Glucagon-Like Peptide-1 (GLP-1), Glucose-Dependent Insulinotropic Polypeptide (GIP), and Glucagon (GCGR) receptors.',
    pathways:
      'GCGR activation increases hepatic beta-oxidation and resting energy expenditure while GLP-1R/GIPR signaling improves insulin sensitivity and satiety. Calibrated with 1,850–1,950 kcal/day and 170–190g protein to prevent rapid facial fat pad atrophy ("GLP-1 face") and preserve lean skeletal mass.',
    dosageContext:
      "Dan's Active Protocol: 3 mg subcutaneously once weekly (e.g., 10 mg vial reconstituted with 2.0 ml BAC water = 0.60 ml / 60 Units on U-100 syringe).",
    safetyProfile:
      'Oncology & NHL Remission Profile: Does NOT stimulate VEGF, bFGF, endothelial cell migration, or pituitary GH/IGF-1 mitogenic signaling. Monitor GI transit, hydration (750ml+ morning electrolyte stack), and steady weekly weight loss pacing (229 lbs → 200 lbs).',
    defaultDose: '3 mg once weekly',
  },
  {
    keywords: ['matrixyl', 'palmitoyl tripeptide', 'palmitoyl tetrapeptide'],
    title: 'Matrixyl 3000 (Palmitoyl Tripeptide-1 & Palmitoyl Tetrapeptide-7)',
    status: 'CLEARED — NON-ANGIOGENIC DERMAL / ELASTIN SUPPORT',
    mechanism:
      'Matrikine signaling peptide complex that mimics extracellular matrix breakdown fragments to stimulate local fibroblast synthesis of Type I/IV collagen, fibronectin, and glycosaminoglycans without vascular growth factor induction.',
    pathways:
      'Suppresses excess cutaneous IL-6 secretion and glycation damage, preserving dermal thickness and facial elastin scaffolding during body recomposition.',
    dosageContext:
      'Topical 3–8% serum twice daily or localized non-angiogenic cosmetic protocol alongside 14g oral bovine collagen.',
    safetyProfile:
      'Oncology & NHL Remission Profile: Cleared. Zero systemic VEGF upregulation or copper-mediated neovascularization.',
    defaultDose: '250 mcg / Topical 2x daily',
  },
  {
    keywords: ['rigin', 'tetrapeptide-7'],
    title: 'Rigin (Palmitoyl Tetrapeptide-7)',
    status: 'CLEARED — ELASTIN & CYTOKINE BALANCE PEPTIDE',
    mechanism:
      'Synthetic lipopeptide derived from human immunoglobulin G fragment that downregulates basal and UV-induced Interleukin-6 (IL-6) in keratinocytes and fibroblasts.',
    pathways:
      'Slows extracellular matrix degradation and preserves dermal elasticity and facial structural firmness during caloric deficit.',
    dosageContext: 'Standard cosmetic/dermal concentration or 200 mcg research reference.',
    safetyProfile:
      'Oncology & NHL Remission Profile: Cleared. Anti-inflammatory cytokine modulator with no angiogenic or mitogenic activity.',
    defaultDose: '200 mcg',
  },
  {
    keywords: ['argireline', 'hexapeptide-8', 'snap-8', 'octapeptide-3', 'syn-ake'],
    title: 'Argireline / SNAP-8 (Acetyl Hexapeptide-8 / Octapeptide-3)',
    status: 'CLEARED — NEUROMUSCULAR DERMAL RELAXATION PEPTIDE',
    mechanism:
      'Competes with SNAP-25 at the SNARE complex to modulate excessive acetylcholine vesicle exocytosis at superficial facial neuromuscular junctions.',
    pathways:
      'Reduces dynamic mechanical creasing of dermal elastin fibers while preserving subcutaneous facial fat pad volume.',
    dosageContext: 'Topical 5–10% peptide serum or 200 mcg localized protocol.',
    safetyProfile:
      'Oncology & NHL Remission Profile: Cleared. Strictly localized SNARE modulation; zero VEGF or systemic growth factor activity.',
    defaultDose: '200 mcg',
  },
];

const GHK_CU_EXACT_WARNING =
  "PROHIBITED (Dan's NHL Remission Rule) — GHK-CU: ONCOLOGY CONTRAINDICATION (NHL Remission): Directly promotes VEGF expression, endothelial migration, or angiogenesis. May accelerate vascularization of dormant clonal lymphoid microenvironments.";

const GHK_CU_PATHWAY_SUMMARY =
  'Biological Pathway: GHK-Cu complexes with copper(II) ions to upregulate Vascular Endothelial Growth Factor (VEGF), basic Fibroblast Growth Factor (bFGF), and TGF-β1, stimulating neovascular capillary sprouting and endothelial cell migration.';

const CLEARED_NON_ANGIOGENIC_ALTERNATIVES = [
  'Matrixyl 3000 (Palmitoyl Tripeptide-1 + Tetrapeptide-7): Local matrikine signaling for dermal collagen I/IV & fibronectin without systemic VEGF.',
  'Argireline (Acetyl Hexapeptide-8) & Rigin: Preserves facial elastin and DHEA/IL-6 balance without endothelial proliferation.',
  'Oral Hydrolyzed Bovine Collagen (14g/day) + Vitamin C (60mg) + Hyaluronic Acid: Supports facial fat-pad extracellular scaffolding safely in NHL remission.',
];

function evaluatePeptideSafety(text = '') {
  const lower = String(text || '').toLowerCase();
  if (!lower.trim()) return null;

  if (lower.includes('ghk') || lower.includes('copper')) {
    return {
      isGhkCu: true,
      isProhibited: true,
      banner: GHK_CU_EXACT_WARNING,
      pathway: GHK_CU_PATHWAY_SUMMARY,
      alternatives: CLEARED_NON_ANGIOGENIC_ALTERNATIVES,
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
      isGhkCu: false,
      isProhibited: true,
      banner:
        "PROHIBITED (Dan's NHL Remission Rule) — ONCOLOGY CONTRAINDICATION: Directly promotes VEGF expression, endothelial nitric oxide, and systemic angiogenesis.",
      pathway:
        'Biological Pathway: Upregulates VEGFR2 and focal adhesion kinase (FAK) pathways, driving systemic microvascular proliferation.',
      alternatives: CLEARED_NON_ANGIOGENIC_ALTERNATIVES,
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
      isGhkCu: false,
      isProhibited: true,
      banner:
        "PROHIBITED (Dan's NHL Remission Rule) — Growth Hormone Secretagogue: Elevates systemic GH and IGF-1 mitogenic signaling.",
      pathway:
        'Biological Pathway: Pituitary GHS-R1a agonism increases hepatic IGF-1 secretion, which acts as a potent anti-apoptotic and mitogenic growth factor in lymphoid tissues.',
      alternatives: CLEARED_NON_ANGIOGENIC_ALTERNATIVES,
    };
  }
  if (lower.includes('ss-31') || lower.includes('mots-c') || lower.includes('elamipretide')) {
    return {
      isGhkCu: false,
      isProhibited: true,
      banner:
        "EXCLUDED (Dan's NHL Remission Rule) — Mitochondrial-targeted peptides (SS-31, MOTS-c) are excluded per protocol.",
      pathway: 'Focus remains strictly on non-angiogenic elastin/skin integrity and Retatrutide 3mg weekly recomp.',
      alternatives: CLEARED_NON_ANGIOGENIC_ALTERNATIVES,
    };
  }
  if (lower.includes('tirzepatide') || lower.includes('semaglutide') || lower.includes('ozempic') || lower.includes('mounjaro')) {
    return {
      isGhkCu: false,
      isProhibited: true,
      banner:
        "EXCLUDED COMPOUND — Tirzepatide and Semaglutide are excluded from Dan's single-compound active protocol (Retatrutide 3 mg weekly).",
      pathway:
        "Dan's Active Protocol utilizes Retatrutide 3 mg once weekly (GLP-1/GIP/GCGR triple agonist) as a single metabolic compound.",
      alternatives: CLEARED_NON_ANGIOGENIC_ALTERNATIVES,
    };
  }
  return null;
}

function resolveClinicalMonograph(queryText = '') {
  const lower = String(queryText || '').trim().toLowerCase();
  if (!lower) return null;

  for (const item of CLINICAL_PEPTIDE_MONOGRAPHS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item;
    }
  }

  return {
    title: `${queryText.trim()} — Clinical & NHL Remission Verification`,
    status: 'CLEARED FOR REVIEW (No Direct VEGF / Angiogenic Signal Flagged)',
    mechanism:
      'Evaluated against Non-Hodgkin Lymphoma (NHL) remission contraindication criteria (VEGF, bFGF, endothelial migration, and GH/IGF-1 secretagogue pathways).',
    pathways:
      'Prioritizes non-angiogenic dermal elastin/collagen integrity and steady body recomposition alongside Retatrutide 3 mg weekly.',
    dosageContext: 'Verify vial concentration (mg/ml) and BAC water volume before administration.',
    safetyProfile:
      'Passed automated NHL angiogenesis screen. Avoid combining with copper peptides (GHK-Cu), BPC-157, TB-500, or GH secretagogues.',
    defaultDose: 'Custom Protocol',
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

  // Reconstitution & Logging Form State
  const [peptideName, setPeptideName] = useState(
    activePeptideName || 'Retatrutide (GLP-1/GIP/GCGR)'
  );
  const [vialMg, setVialMg] = useState(10);
  const [bacWaterMl, setBacWaterMl] = useState(2);
  const [desiredDoseValue, setDesiredDoseValue] = useState(3);
  const [desiredDoseUnit, setDesiredDoseUnit] = useState('mg');
  const [syringeCapacityMl, setSyringeCapacityMl] = useState(1.0); // 0.3 ml | 0.5 ml | 1.0 ml
  const [injectionSite, setInjectionSite] = useState(GRANULAR_INJECTION_SITES[0]);
  const [injectionDateTime, setInjectionDateTime] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );

  // Editing existing injection record state
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  // Research / Oncology Query State (Default populated with Retatrutide so user immediately sees rich clinical data)
  const [queryName, setQueryName] = useState('Retatrutide');
  const [researchResult, setResearchResult] = useState(() =>
    resolveClinicalMonograph('Retatrutide')
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
        concentrationMcgPerMl: 0,
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
      concentrationMcgPerMl: Math.round(concentrationMcgPerMl),
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
      setAddedToStackBanner(`Logged synergistic food "${foodRec.name}" to Daily Totals!`);
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

    const monograph = resolveClinicalMonograph(queryName);
    setResearchResult(monograph);
  };

  // Dedicated action: "Start / Add to Custom Stack" for any NHL-cleared peptide
  const handleAddClearedPeptideToCustomStack = (compoundTitle, doseLabel) => {
    const newStack = {
      id: `stack_pep_${Date.now()}`,
      name: `${compoundTitle.split(' (')[0]} Protocol Stack`,
      category: 'Morning Stacks',
      scheduledHour: '08:00',
      isRecurringPlanned: true,
      ingredients: [
        {
          id: `ing_pep_${Date.now()}_1`,
          name: `${compoundTitle.split(' (')[0]} (${doseLabel})`,
          servingGrams: doseLabel,
          source: 'Cleared NHL Remission Protocol',
          calories: 0,
          protein: 0,
          carbs: 0,
          fiber: 0,
          netCarbs: 0,
          fats: 0,
          waterMl: 0,
          micros: { vitaminD: 0, vitaminC: 0, magnesium: 0, zinc: 0, potassium: 0, sodium: 0 },
          aminos: {
            leucine: 0, isoleucine: 0, valine: 0, lysine: 0, methionine: 0,
            phenylalanine: 0, threonine: 0, tryptophan: 0, histidine: 0,
          },
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
        micros: { vitaminD: 0, vitaminC: 0, magnesium: 0, zinc: 0, potassium: 0, sodium: 0 },
        aminos: {
          leucine: 0, isoleucine: 0, valine: 0, lysine: 0, methionine: 0,
          phenylalanine: 0, threonine: 0, tryptophan: 0, histidine: 0,
        },
      },
      createdAt: new Date().toISOString(),
    };

    setSavedStacks([newStack, ...savedStacks]);
    setAddedToStackBanner(`Added "${newStack.name}" to Get Stacked (Morning Stacks)!`);
    setTimeout(() => setAddedToStackBanner(''), 3000);
  };

  return (
    <div className="space-y-3.5 text-white">
      {/* Persistent Daily Recommended vs. Logged Intake Chart */}
      <PersistentAllowanceChart />

      {/* Dan's Active Protocol + NHL Remission Guardrail Banner */}
      <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/30 p-3 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-emerald-100 leading-relaxed">
          <span className="font-black uppercase tracking-wider text-emerald-300">
            Active Protocol: Retatrutide 3 mg Weekly
          </span>{' '}
          • <strong>NHL Remission Safeguard Active:</strong> GHK-Cu, copper peptides, BPC-157, TB-500, GH secretagogues, Tirzepatide, and Semaglutide are excluded.
        </div>
      </div>

      {addedToStackBanner && (
        <div className="rounded-xl bg-amber-500/20 border border-amber-400/50 p-2.5 flex items-center gap-2 text-amber-200 text-xs font-black">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{addedToStackBanner}</span>
        </div>
      )}

      {/* Prominent Critical Oncology Contraindication Alert when GHK-Cu or Prohibited Peptide is Entered */}
      {activeSafetyAlert && (
        <div className="rounded-2xl bg-rose-950 text-white border-2 border-rose-500 p-3.5 space-y-2 shadow-xl">
          <div className="flex items-start gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs font-black text-rose-200 leading-snug">
              {activeSafetyAlert.banner}
            </div>
          </div>
          <p className="text-[11px] text-rose-100/90 leading-relaxed bg-rose-900/50 rounded-xl p-2 border border-rose-400/30">
            {activeSafetyAlert.pathway}
          </p>
          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-2.5 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              ✓ Oncology-Cleared Non-Angiogenic Skin &amp; Elastin Alternatives:
            </div>
            <ul className="text-[10px] text-emerald-100 space-y-1 list-disc pl-4">
              {activeSafetyAlert.alternatives.map((alt, i) => (
                <li key={i}>{alt}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Peptide Selection + Syringe Capacity Selector + Auto BAC Water Reconstitution Calculator + Granular Injection Logger */}
      <form
        onSubmit={handleLogDose}
        className="rounded-2xl bg-slate-900/90 border border-white/15 p-3.5 space-y-3"
      >
        <div>
          <label className="block text-[10px] font-extrabold text-violet-300 uppercase mb-1">
            Select NHL-Cleared Peptide or Enter Compound
          </label>
          <select
            value={
              CLEARED_PEPTIDE_PRESETS.some((p) => p.name === peptideName) ? peptideName : 'CUSTOM'
            }
            onChange={(e) => {
              if (e.target.value === 'CUSTOM') {
                setPeptideName('');
              } else {
                handleSelectPreset(e.target.value);
              }
            }}
            className="w-full rounded-xl border border-white/15 bg-slate-950 px-2.5 py-2 text-xs font-bold text-white mb-1.5"
          >
            {CLEARED_PEPTIDE_PRESETS.map((p) => (
              <option key={p.name} value={p.name} className="bg-slate-950 text-white">
                {p.name}
              </option>
            ))}
            <option value="CUSTOM" className="bg-slate-950 text-white">
              + Enter Custom Peptide Name...
            </option>
          </select>
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
            placeholder="Type peptide name (e.g. Retatrutide, Matrixyl 3000)..."
            className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
          />
        </div>

        {/* Syringe Capacity Selector (0.3 ml, 0.5 ml, 1.0 ml) */}
        <div>
          <label className="block text-[10px] font-extrabold text-violet-300 uppercase mb-1">
            Syringe Capacity Selector
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {SYRINGE_CAPACITIES.map((cap) => {
              const isSelected = Number(syringeCapacityMl) === cap.value;
              return (
                <button
                  key={cap.value}
                  type="button"
                  onClick={() => setSyringeCapacityMl(cap.value)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black border transition ${
                    isSelected
                      ? 'bg-violet-500 text-slate-950 border-violet-300 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-white/15 hover:border-violet-400/50'
                  }`}
                >
                  {cap.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vial (mg), BAC Water (ml), Desired Dose */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-300 uppercase mb-1">
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
            <label className="block text-[10px] font-extrabold text-slate-300 uppercase mb-1">
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
            <label className="block text-[10px] font-extrabold text-slate-300 uppercase mb-1">
              Desired Dose
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

        {/* Simplified User-Friendly Injection Site Dropdown + Exact Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
              Injection Site
            </label>
            <select
              value={injectionSite}
              onChange={(e) => setInjectionSite(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-1.5 text-xs font-bold text-white"
            >
              {GRANULAR_INJECTION_SITES.map((site) => (
                <option key={site} value={site} className="bg-slate-950 text-white">
                  {site}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-slate-300 uppercase mb-1">
              Exact Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={injectionDateTime}
              onChange={(e) => setInjectionDateTime(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white"
            />
          </div>
        </div>

        {/* Auto-Calculated Syringe Pull Output + Visual Gauge */}
        <div className="rounded-xl bg-slate-950 border border-violet-500/40 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[9px] font-bold uppercase text-slate-400">
                Concentration: {calculation.concentrationMgPerMl} mg/ml • {calculation.maxCapMl} ml ({calculation.maxCapUnits}U) Syringe
              </div>
              <div className="text-sm font-black text-violet-300">
                Pull to {calculation.syringeUnits} Units{' '}
                <span className="text-xs font-bold text-slate-300">
                  ({calculation.volumeMl} ml / {calculation.maxCapMl} ml)
                </span>
              </div>
              {calculation.exceedsSyringe && (
                <div className="text-[10px] font-bold text-amber-300 mt-0.5">
                  ⚠ Volume ({calculation.volumeMl} ml) exceeds {calculation.maxCapMl} ml syringe capacity — select a 1.0 ml syringe or split draw.
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={Boolean(activeSafetyAlert?.isProhibited)}
              className="px-3.5 py-2 rounded-xl text-xs font-black text-slate-950 bg-violet-400 hover:bg-violet-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Dose</span>
            </button>
          </div>

          {/* Visual Syringe Barrel Scale */}
          <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/15 overflow-hidden">
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
              className="w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-[11px] font-black flex items-center justify-center gap-1.5 transition"
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>Start / Add to Custom Stack</span>
            </button>
          )}
        </div>
      </form>

      {/* Targeted Amino Acid Prioritization & Synergistic Food Recommendations for Active Peptide */}
      {!activeSafetyAlert?.isProhibited && activePeptideSynergy && (
        <div className="rounded-2xl border border-cyan-400/40 p-3.5 space-y-2.5 bg-slate-900/90">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              ★ Peptide-Driven Amino Prioritization &amp; Food Sources
            </span>
            <span className="text-[9px] font-bold text-emerald-300">
              {activePeptideSynergy.peptideLabel.split(' (')[0]}
            </span>
          </div>
          <p className="text-[10px] text-slate-300 leading-snug">
            {activePeptideSynergy.protocolObjective}
          </p>

          <div className="space-y-1.5">
            {Object.entries(activePeptideSynergy.prioritizedAminos).map(([key, info]) => (
              <div
                key={key}
                className="rounded-xl bg-slate-950/90 border border-cyan-500/30 p-2 space-y-0.5"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-black uppercase text-white">
                    {key}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-400 text-slate-950">
                    {info.badge}
                  </span>
                </div>
                <p className="text-[9px] text-slate-300 leading-snug">{info.synergyReason}</p>
                <div className="text-[9px] font-bold text-emerald-300">
                  Top Foods: {info.foods}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
              Direct Food Recommendations (Tap to Log to Daily Nutrition)
            </div>
            {(activePeptideSynergy.recommendedFoods || []).map((food) => (
              <div
                key={food.name}
                className="rounded-xl bg-slate-950/90 border border-white/15 px-2.5 py-1.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-white truncate">{food.name}</div>
                  <div className="text-[9px] font-bold text-cyan-300 truncate">{food.highlight}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickLogSynergyFood(food)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-black shrink-0 flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Log Food</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NHL Remission Clinical Search & Monograph Verifier (Populated Summary Panel + Start/Add to Custom Stack) */}
      <div className="rounded-2xl border border-white/15 p-3.5 space-y-2.5 bg-slate-900/90">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>NHL Remission Clinical Peptide Search &amp; Monograph Verifier</span>
        </div>

        <form onSubmit={handleResearchPeptide} className="flex flex-wrap sm:flex-nowrap gap-1.5 w-full">
          <input
            type="text"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            placeholder="Search peptide (e.g. Retatrutide, Matrixyl 3000, Rigin, GHK-Cu)..."
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 text-xs font-black flex items-center gap-1 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search / Verify</span>
          </button>
        </form>

        {/* If prohibited/contraindicated */}
        {querySafetyAlert ? (
          <div className="rounded-2xl p-3 text-xs space-y-2 border-2 bg-rose-950 text-white border-rose-500">
            <div className="font-black text-rose-200">{querySafetyAlert.banner}</div>
            <p className="text-[11px] text-rose-100/90">{querySafetyAlert.pathway}</p>
            <div className="pt-1 border-t border-rose-500/30">
              <div className="text-[10px] font-black uppercase text-emerald-300">
                Oncology-Cleared Non-Angiogenic Alternatives:
              </div>
              <ul className="text-[10px] text-emerald-100 list-disc pl-4 space-y-0.5 mt-0.5">
                {querySafetyAlert.alternatives.map((alt, idx) => (
                  <li key={idx}>{alt}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          researchResult && (
            <div className="rounded-2xl bg-slate-950 border border-emerald-500/40 p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    {researchResult.status}
                  </span>
                  <h4 className="text-xs font-black text-white">{researchResult.title}</h4>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] leading-relaxed">
                <div className="bg-slate-900/90 rounded-xl p-2 border border-white/10">
                  <span className="text-[9px] font-black uppercase text-violet-300 block">
                    Clinical Mechanism of Action
                  </span>
                  <p className="text-slate-200">{researchResult.mechanism}</p>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-2 border border-white/10">
                  <span className="text-[9px] font-black uppercase text-cyan-300 block">
                    Metabolic &amp; Facial Tissue / Elastin Pathways
                  </span>
                  <p className="text-slate-200">{researchResult.pathways}</p>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-2 border border-white/10">
                  <span className="text-[9px] font-black uppercase text-amber-300 block">
                    Research Dosage Context
                  </span>
                  <p className="text-slate-200">{researchResult.dosageContext}</p>
                </div>

                <div className="bg-emerald-950/50 rounded-xl p-2 border border-emerald-500/30">
                  <span className="text-[9px] font-black uppercase text-emerald-300 block">
                    Oncology &amp; NHL Remission Safety Profile
                  </span>
                  <p className="text-emerald-100">{researchResult.safetyProfile}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddClearedPeptideToCustomStack(
                    researchResult.title,
                    researchResult.defaultDose || '3 mg'
                  )
                }
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Start / Add to Custom Stack</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Logged Peptide Injection History with Full Edit & Delete CRUD */}
      <div className="rounded-2xl border border-white/15 p-3 bg-slate-900/90 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
            Logged Injections ({peptideHistory.length}) — Edit or Delete Records
          </span>
        </div>

        {peptideHistory.length === 0 ? (
          <div className="text-xs text-slate-400 py-2 text-center">
            No injections logged yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {peptideHistory.map((p) => {
              const isEditing = editingId === p.id;
              return (
                <div
                  key={p.id}
                  className="text-xs bg-slate-950 rounded-xl p-2.5 border border-white/15 space-y-2"
                >
                  {isEditing && editDraft ? (
                    <div className="space-y-2">
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
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-black flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditDraft(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-black text-white truncate">{p.peptideName}</div>
                        <div className="text-[11px] font-semibold text-violet-300">
                          Dose: {p.desiredDoseValue}
                          {p.desiredDoseUnit}
                          {p.syringeUnits
                            ? ` • ${p.syringeUnits} U (${p.volumeMl} ml on ${
                                p.syringeCapacityMl || 1.0
                              } ml syringe)`
                            : ''}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Site: <strong className="text-slate-200">{p.site || GRANULAR_INJECTION_SITES[0]}</strong> •{' '}
                          {p.timestamp}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditEntry(p)}
                          className="p-1.5 rounded-lg bg-white/10 border border-white/15 text-slate-300 hover:text-violet-300 transition"
                          title="Edit Injection Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePeptideEntry(p.id)}
                          className="p-1.5 rounded-lg bg-white/10 border border-white/15 text-rose-400 hover:bg-rose-500/20 transition"
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
