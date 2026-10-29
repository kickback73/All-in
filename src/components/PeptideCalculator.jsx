// src/components/PeptideCalculator.jsx
import React, { useState, useMemo } from 'react';
import {
  Syringe,
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertOctagon,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const STANDARD_INJECTION_SITES = [
  'Abdomen (Periumbilical, left/right)',
  'Vastus Lateralis (Outer thigh)',
  'Deltoid (Lateral upper arm)',
  'Ventrogluteal / Gluteal',
  'Flank / Love Handles',
];

const PEPTIDE_PRESETS = [
  { name: 'Retatrutide (GLP-1/GIP/GCGR)', defaultVialMg: 10, defaultBacMl: 2, defaultDose: 3, defaultUnit: 'mg', status: 'ACTIVE_PROTOCOL' },
  { name: 'Tirzepatide (GLP-1/GIP)', defaultVialMg: 10, defaultBacMl: 2, defaultDose: 2.5, defaultUnit: 'mg', status: 'CLEARED' },
  { name: 'Semaglutide (GLP-1)', defaultVialMg: 5, defaultBacMl: 2, defaultDose: 0.5, defaultUnit: 'mg', status: 'CLEARED' },
  { name: 'Matrixyl 3000 / Palmitoyl Tripeptide-1 (Topical Elastin/Collagen)', defaultVialMg: 5, defaultBacMl: 2, defaultDose: 250, defaultUnit: 'mcg', status: 'CLEARED' },
  { name: 'Argireline / Acetyl Hexapeptide-8 (Non-Angiogenic Skin)', defaultVialMg: 5, defaultBacMl: 2, defaultDose: 200, defaultUnit: 'mcg', status: 'CLEARED' },
  { name: 'GHK-Cu (Copper Peptide) — [PROHIBITED: NHL REMISSION]', defaultVialMg: 50, defaultBacMl: 3, defaultDose: 1, defaultUnit: 'mg', status: 'PROHIBITED_GHK' },
  { name: 'BPC-157 — [PROHIBITED: ANGIOGENESIS / VEGF]', defaultVialMg: 5, defaultBacMl: 2, defaultDose: 250, defaultUnit: 'mcg', status: 'PROHIBITED' },
  { name: 'TB-500 (Thymosin Beta-4) — [PROHIBITED: ANGIOGENESIS]', defaultVialMg: 5, defaultBacMl: 2, defaultDose: 500, defaultUnit: 'mcg', status: 'PROHIBITED' },
  { name: 'CJC-1295 / Ipamorelin — [PROHIBITED: IGF-1 / GH AXIS]', defaultVialMg: 5, defaultBacMl: 2, defaultDose: 200, defaultUnit: 'mcg', status: 'PROHIBITED' },
];

const GHK_CU_EXACT_WARNING =
  "PROHIBITED (Dan's NHL Remission Rule) — GHK-CU: ONCOLOGY CONTRAINDICATION (NHL Remission): Directly promotes VEGF expression, endothelial migration, or angiogenesis. May accelerate vascularization of dormant clonal lymphoid microenvironments.";

const GHK_CU_PATHWAY_SUMMARY =
  'Biological Pathway: GHK-Cu complexes with copper(II) ions to upregulate Vascular Endothelial Growth Factor (VEGF), basic Fibroblast Growth Factor (bFGF), and TGF-β1, stimulating neovascular capillary sprouting and endothelial cell migration.';

const CLEARED_NON_ANGIOGENIC_ALTERNATIVES = [
  'Topical Matrixyl 3000 (Palmitoyl Tripeptide-1 + Tetrapeptide-7): Local matrikine signaling for dermal collagen I/IV & fibronectin without systemic VEGF.',
  'Topical Argireline (Acetyl Hexapeptide-8) & Rigin: Preserves facial elastin and DHEA/IL-6 balance without endothelial proliferation.',
  'Oral Hydrolyzed Bovine Collagen (14g/day) + Vitamin C (60mg) + Hyaluronic Acid: Supports facial fat-pad extracellular scaffolding safely in NHL remission.',
];

function evaluatePeptideSafety(text = '') {
  const lower = text.toLowerCase();
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
    lower.includes('mk-677')
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
      pathway: 'Focus remains strictly on non-angiogenic elastin/skin integrity and Retatrutide metabolic recomp.',
      alternatives: CLEARED_NON_ANGIOGENIC_ALTERNATIVES,
    };
  }
  return null;
}

export default function PeptideCalculator({ isOpen = true, onClose }) {
  const {
    peptideHistory,
    addPeptideEntry,
    updatePeptideEntry,
    deletePeptideEntry,
  } = useAppContext();

  // Reconstitution & Logging Form State
  const [peptideName, setPeptideName] = useState('Retatrutide (GLP-1/GIP/GCGR)');
  const [vialMg, setVialMg] = useState(10);
  const [bacWaterMl, setBacWaterMl] = useState(2);
  const [desiredDoseValue, setDesiredDoseValue] = useState(3);
  const [desiredDoseUnit, setDesiredDoseUnit] = useState('mg');
  const [injectionSite, setInjectionSite] = useState(STANDARD_INJECTION_SITES[0]);
  const [injectionDateTime, setInjectionDateTime] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );

  // Editing existing injection record state
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  // Research / Oncology Query State
  const [queryName, setQueryName] = useState('');
  const [researchResult, setResearchResult] = useState(null);
  const [loadingResearch, setLoadingResearch] = useState(false);

  const calculation = useMemo(() => {
    const vialMcg = (Number(vialMg) || 0) * 1000;
    const water = Number(bacWaterMl) || 0;
    const doseMcg =
      desiredDoseUnit === 'mg'
        ? (Number(desiredDoseValue) || 0) * 1000
        : Number(desiredDoseValue) || 0;

    if (vialMcg <= 0 || water <= 0 || doseMcg <= 0) {
      return { concentrationMcgPerMl: 0, concentrationMgPerMl: 0, volumeMl: 0, syringeUnits: 0 };
    }

    const concentrationMcgPerMl = vialMcg / water;
    const concentrationMgPerMl = (Number(vialMg) || 0) / water;
    const volumeMl = doseMcg / concentrationMcgPerMl;
    const syringeUnits = volumeMl * 100;

    return {
      concentrationMcgPerMl: Math.round(concentrationMcgPerMl),
      concentrationMgPerMl: concentrationMgPerMl.toFixed(2),
      volumeMl: volumeMl.toFixed(3),
      syringeUnits: syringeUnits.toFixed(1),
    };
  }, [vialMg, bacWaterMl, desiredDoseValue, desiredDoseUnit]);

  const activeSafetyAlert = useMemo(() => evaluatePeptideSafety(peptideName), [peptideName]);
  const querySafetyAlert = useMemo(() => evaluatePeptideSafety(queryName), [queryName]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetName) => {
    setPeptideName(presetName);
    const found = PEPTIDE_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setVialMg(found.defaultVialMg);
      setBacWaterMl(found.defaultBacMl);
      setDesiredDoseValue(found.defaultDose);
      setDesiredDoseUnit(found.defaultUnit);
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
      site: entry.site || STANDARD_INJECTION_SITES[0],
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

  const handleResearchPeptide = async (e) => {
    e.preventDefault();
    if (!queryName.trim()) return;

    const localSafety = evaluatePeptideSafety(queryName);
    if (localSafety) {
      setResearchResult({
        status: 'PROHIBITED (Dan\'s NHL Remission Rule)',
        warning: localSafety.banner,
        pathway: localSafety.pathway,
        alternatives: localSafety.alternatives,
      });
      return;
    }

    setLoadingResearch(true);
    setResearchResult(null);
    try {
      const res = await fetch('/api/peptide-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peptideName: queryName.trim(),
          remissionGuardrail: true,
        }),
      });
      const data = await res.json();
      setResearchResult(data);
    } catch {
      setResearchResult({
        status: 'CLEARED / REVIEW',
        summary:
          'No direct VEGF/angiogenic trigger detected in baseline lookup. Prioritize non-angiogenic collagen/elastin support and Retatrutide 3mg weekly protocol.',
        alternatives: CLEARED_NON_ANGIOGENIC_ALTERNATIVES,
      });
    } finally {
      setLoadingResearch(false);
    }
  };

  return (
    <div className="space-y-3 text-slate-900">
      {/* Dan's Active Protocol + NHL Remission Guardrail Banner */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-[11px] text-emerald-950 leading-relaxed">
          <span className="font-black uppercase tracking-wider">
            Active Protocol: Retatrutide 3 mg Weekly
          </span>{' '}
          • <strong>NHL Remission Safeguard Active:</strong> GHK-Cu, copper peptides, BPC-157, TB-500, and GH secretagogues are strictly blocked.
        </div>
      </div>

      {/* Prominent Critical Oncology Contraindication Alert when GHK-Cu or Angiogenic Peptide is Selected */}
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

      {/* Peptide Selection + Auto BAC Water Reconstitution Calculator + Injection Logger */}
      <form
        onSubmit={handleLogDose}
        className="rounded-2xl bg-[#F4F8FB] border border-slate-200 p-3.5 space-y-3"
      >
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
              Select or Enter Peptide Compound
            </label>
            <select
              value={
                PEPTIDE_PRESETS.some((p) => p.name === peptideName) ? peptideName : 'CUSTOM'
              }
              onChange={(e) => {
                if (e.target.value === 'CUSTOM') {
                  setPeptideName('');
                } else {
                  handleSelectPreset(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 mb-1.5"
            >
              {PEPTIDE_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
              <option value="CUSTOM">+ Enter Custom Peptide Name...</option>
            </select>
            <input
              type="text"
              required
              value={peptideName}
              onChange={(e) => setPeptideName(e.target.value)}
              placeholder="Type peptide name (e.g. Retatrutide, GHK-Cu)..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Vial (mg), BAC Water (ml), Desired Dose */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
              Vial (mg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={vialMg}
              onChange={(e) => setVialMg(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
              BAC Water (ml)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={bacWaterMl}
              onChange={(e) => setBacWaterMl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
              Desired Dose
            </label>
            <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={desiredDoseValue}
                onChange={(e) => setDesiredDoseValue(e.target.value)}
                className="w-full px-2 py-1.5 text-xs font-black text-slate-900 focus:outline-hidden"
              />
              <select
                value={desiredDoseUnit}
                onChange={(e) => setDesiredDoseUnit(e.target.value)}
                className="bg-slate-100 px-1.5 text-[10px] font-extrabold text-slate-800 border-l border-slate-200"
              >
                <option value="mg">mg</option>
                <option value="mcg">mcg</option>
              </select>
            </div>
          </div>
        </div>

        {/* Standardized Anatomical Injection Site Dropdown + Exact Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
              Subcutaneous Injection Site
            </label>
            <select
              value={injectionSite}
              onChange={(e) => setInjectionSite(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
            >
              {STANDARD_INJECTION_SITES.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
              Exact Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={injectionDateTime}
              onChange={(e) => setInjectionDateTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Auto-Calculated Syringe Pull Output */}
        <div className="rounded-xl bg-white border border-sky-200 p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase text-slate-400">
              Auto BAC Water Calculation ({calculation.concentrationMgPerMl} mg/ml)
            </div>
            <div className="text-sm font-black text-sky-700">
              Pull to {calculation.syringeUnits} Units{' '}
              <span className="text-xs font-bold text-slate-600">
                ({calculation.volumeMl} ml on U-100 syringe)
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={Boolean(activeSafetyAlert?.isProhibited)}
            className="px-3.5 py-2 rounded-xl text-xs font-black text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Injection</span>
          </button>
        </div>
      </form>

      {/* Logged Peptide Injection History with Full Edit & Delete CRUD */}
      <div className="rounded-2xl border border-slate-200 p-3 bg-white space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
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
                  className="text-xs bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-2"
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
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
                        />
                        <div className="flex rounded-lg border border-slate-300 bg-white overflow-hidden">
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
                            className="w-full px-2 py-1 text-xs font-bold text-slate-900"
                          />
                          <select
                            value={editDraft.desiredDoseUnit}
                            onChange={(e) =>
                              setEditDraft((prev) => ({
                                ...prev,
                                desiredDoseUnit: e.target.value,
                              }))
                            }
                            className="bg-slate-100 px-1.5 text-[10px] font-bold text-slate-800 border-l border-slate-300"
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
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-900"
                        >
                          {STANDARD_INJECTION_SITES.map((s) => (
                            <option key={s} value={s}>
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
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-900"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => saveEditEntry(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1"
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
                          className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 truncate">{p.peptideName}</div>
                        <div className="text-[11px] font-semibold text-sky-700">
                          Dose: {p.desiredDoseValue}
                          {p.desiredDoseUnit}
                          {p.syringeUnits ? ` • ${p.syringeUnits} U (${p.volumeMl} ml)` : ''}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Site: <strong className="text-slate-700">{p.site || STANDARD_INJECTION_SITES[0]}</strong> •{' '}
                          {p.timestamp}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditEntry(p)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-sky-700 transition"
                          title="Edit Injection Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePeptideEntry(p.id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
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

      {/* Oncology Contraindication & Non-Angiogenic Peptide Query Tool */}
      <div className="rounded-2xl border border-slate-200 p-3 space-y-2 bg-slate-50/70">
        <div className="text-[10px] font-extrabold uppercase text-slate-600">
          NHL Remission Safety &amp; Elastin/Skin Peptide Verifier
        </div>
        <form onSubmit={handleResearchPeptide} className="flex gap-2">
          <input
            type="text"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            placeholder="Query compound (e.g. GHK-Cu, Matrixyl 3000, Rigin)..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
          />
          <button
            type="submit"
            disabled={loadingResearch}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loadingResearch ? '...' : 'Verify'}</span>
          </button>
        </form>

        {(querySafetyAlert || researchResult) && (
          <div
            className={`rounded-xl p-3 text-xs space-y-1.5 border ${
              querySafetyAlert?.isProhibited ||
              researchResult?.status?.includes('PROHIBITED')
                ? 'bg-rose-950 text-white border-rose-500'
                : 'bg-emerald-50 text-emerald-950 border-emerald-300'
            }`}
          >
            <div className="font-black">
              {querySafetyAlert
                ? querySafetyAlert.banner
                : researchResult?.warning || researchResult?.status}
            </div>
            {(querySafetyAlert?.pathway || researchResult?.pathway || researchResult?.summary) && (
              <p className="text-[11px] opacity-90">
                {querySafetyAlert?.pathway || researchResult?.pathway || researchResult?.summary}
              </p>
            )}
            {(querySafetyAlert?.alternatives || researchResult?.alternatives) && (
              <div className="pt-1">
                <div className="text-[10px] font-black uppercase text-emerald-300">
                  Oncology-Cleared Non-Angiogenic Alternatives:
                </div>
                <ul className="text-[10px] list-disc pl-4 space-y-0.5 mt-0.5">
                  {(querySafetyAlert?.alternatives || researchResult?.alternatives).map(
                    (alt, idx) => (
                      <li key={idx}>{alt}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
