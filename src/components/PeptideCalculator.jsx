import React, { useState, useMemo } from 'react';
import {
  Syringe,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  History,
  Trash2,
  Send,
  HelpCircle,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { feedbackEngine } from '../utils/soundEffects';

export const SYRINGE_SCALES = [
  { id: 'u100-1ml', label: 'U-100 (1.0 mL)', maxUnits: 100, volumeMl: 1.0, unitsPerMl: 100 },
  { id: 'u100-05ml', label: '0.5 mL (50 Units)', maxUnits: 50, volumeMl: 0.5, unitsPerMl: 100 },
  { id: 'u100-03ml', label: '0.3 mL (30 Units)', maxUnits: 30, volumeMl: 0.3, unitsPerMl: 100 },
  { id: 'u40-1ml', label: 'U-40 (1.0 mL)', maxUnits: 40, volumeMl: 1.0, unitsPerMl: 40 }
];

export const INJECTION_SITES = [
  'Lower Left Abdomen (Periumbilical)',
  'Lower Right Abdomen (Periumbilical)',
  'Upper Left Abdomen',
  'Upper Right Abdomen',
  'Outer Left Thigh (Vastus Lateralis)',
  'Outer Right Thigh (Vastus Lateralis)',
  'Posterior Left Arm (Tricep SubQ)',
  'Posterior Right Arm (Tricep SubQ)'
];

// Comprehensive peptide database with clinical mechanisms & personalized suitability telemetry
export const COMPREHENSIVE_PEPTIDE_DIRECTORY = [
  {
    id: 'klow',
    name: 'Klotho (KLOW / α-Klotho / KLOW-80)',
    aliases: ['klow', 'klotho', 'klow-80', 'alpha-klotho'],
    category: 'Longevity & FGF23 Endocrine Co-Receptor Protein',
    suitabilityScore: 'conditional', // 'suitable' | 'conditional' | 'prohibited'
    suitabilityVerdict: 'CONDITIONAL: Research & Longevity Telemetry (Physician Review Advised)',
    badgeColour: 'cyan',
    whatItDoes: 'Klotho functions as an obligate co-receptor for Fibroblast Growth Factor 23 (FGF23), regulating systemic phosphate homeostasis, vitamin D metabolism, and vascular calcification. In human physiology, Klotho powerfully downregulates intracellular insulin/IGF-1 signaling cascades, inhibits Wnt/β-catenin transcriptional activity, and upregulates mitochondrial antioxidant enzymes (SOD2 and catalase). It acts as an endogenous brake on cellular senescence, arterial stiffening, and cognitive decline.',
    goals: ['longevity', 'kidney health', 'vascular elasticity', 'neuroprotection', 'insulin sensitivity'],
    angiogenicRisk: 'Negligible / Non-Angiogenic. Does not stimulate VEGF or endothelial capillary sprouting.',
    mitochondrialImpact: 'Protects mitochondrial cristae from oxidative stress without driving non-specific proliferative biogenesis.',
    suitabilityAnalysis: 'Is it suitable for you? In oncologic literature, soluble Klotho acts predominantly as a tumor suppressor by attenuating IGF-1 and Wnt survival pathways. For indolent Non-Hodgkin Lymphoma (NHL) remission, Klotho does NOT stimulate the angiogenic capillary beds that dormant lymphoma clones rely upon. However, because commercial "KLOW" peptides are investigational recombinant constructs, ensure verified third-party endotoxin testing before subcutaneous introduction.'
  },
  {
    id: 'retatrutide',
    name: 'Retatrutide (LY3437943)',
    aliases: ['retatrutide', 'reta', 'triple agonist'],
    category: 'GLP-1 / GIP / Glucagon Receptor Agonist',
    suitabilityScore: 'suitable',
    suitabilityVerdict: 'HIGHLY SUITABLE: Core Metabolic & Lean Mass Safeguard',
    badgeColour: 'emerald',
    whatItDoes: 'Retatrutide simultaneously activates three distinct incretin receptors. GLP-1 slows gastric emptying and curbs appetite; GIP enhances subcutaneous adipocyte lipid buffering and insulin sensitivity; Glucagon stimulates hepatic mitochondrial beta-oxidation and energy expenditure. It yields unprecedented metabolic rate elevation while preserving functional skeletal muscle when paired with high protein.',
    goals: ['fat loss', 'metabolic rate', 'visceral adipose reduction', 'insulin sensitivity', 'liver fat clearance'],
    angiogenicRisk: 'None. Operates via G-protein coupled metabolic receptors without triggering angiogenic growth factors.',
    mitochondrialImpact: 'Increases fatty acid oxidation and brown fat thermogenesis without mutagenic acceleration.',
    suitabilityAnalysis: 'Is it suitable for you? Exceptionally suitable. Rapidly clears ectopic visceral and hepatic fat, lowers baseline systemic inflammation, and improves glycemic stability. Does not trigger angiogenic sprouting or hematologic clone proliferation. Requires pairing with adequate leucine (≥3.0g) to safeguard lean tissue during rapid caloric deficits.'
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu (Copper Tripeptide-1)',
    aliases: ['ghk', 'ghk-cu', 'copper peptide'],
    category: 'Angiogenic Copper Complex & Wound Healing Factor',
    suitabilityScore: 'prohibited',
    suitabilityVerdict: 'STRICTLY PROHIBITED: Significant Angiogenic Hazard for NHL Remission',
    badgeColour: 'rose',
    whatItDoes: 'GHK-Cu complexes with ionic copper to stimulate extracellular collagen synthesis, glycosaminoglycan production, and tissue remodeling. However, its primary clinical mechanism in vivo is the potent upregulation of Vascular Endothelial Growth Factor (VEGF) and basic Fibroblast Growth Factor (bFGF), inducing rapid microvascular capillary formation (angiogenesis) and stem cell mobilization.',
    goals: ['skin remodeling', 'hair follicle stimulation', 'deep wound repair', 'collagen synthesis'],
    angiogenicRisk: 'Severe. Documented driver of endothelial proliferation and new capillary network formation.',
    mitochondrialImpact: 'Stimulates robust mitochondrial biogenesis to support rapid cell division.',
    suitabilityAnalysis: 'Is it suitable for you? Absolutely UNSUITABLE. Indolent Non-Hodgkin Lymphoma (NHL) cells reside in a dormant, avascular microenvironment. Agents that stimulate angiogenesis (like GHK-Cu) risk vascularizing dormant malignant lymphoid niches and waking up indolent clones. Must be strictly avoided.'
  },
  {
    id: 'cjc-ipamorelin',
    name: 'CJC-1295 / Ipamorelin',
    category: 'Growth Hormone Releasing Hormone & Secretagogue (GHS)',
    suitabilityScore: 'prohibited',
    suitabilityVerdict: 'PROHIBITED: Systemic IGF-1 Elevation Hazard',
    badgeColour: 'rose',
    whatItDoes: 'CJC-1295 acts on Pituitary GHRH receptors, while Ipamorelin selectively targets the Ghrelin/GHS receptor. Together, they stimulate pulsatile release of endogenous Human Growth Hormone (hGH), which drives hepatic synthesis and circulating secretion of Insulin-like Growth Factor 1 (IGF-1).',
    goals: ['muscle hypertrophy', 'deep slow-wave sleep', 'connective tissue healing', 'body composition'],
    angiogenicRisk: 'Elevated downstream via IGF-1-mediated vascular proliferation.',
    mitochondrialImpact: 'Accelerates general cellular turnover, protein translation, and DNA synthesis.',
    suitabilityAnalysis: 'Is it suitable for you? UNSUITABLE. IGF-1 is one of the most potent anti-apoptotic and pro-survival signals for B-cell lymphoma clones. Artificially elevating circulating GH and IGF-1 directly contradicts the oncology objective of maintaining indolent NHL quiescence.'
  },
  {
    id: 'bpc-157',
    name: 'BPC-157 (Body Protection Compound)',
    aliases: ['bpc', 'bpc-157', 'pentadecapeptide'],
    category: 'Angiogenic Gastric Pentadecapeptide',
    suitabilityScore: 'prohibited',
    suitabilityVerdict: 'EXCLUDED: Endothelial VEGFR2 Upregulation Risk',
    badgeColour: 'rose',
    whatItDoes: 'Derived from gastric juices, BPC-157 orchestrates tendon, ligament, and gut mucosal healing by dramatically activating the FAK-paxillin pathway and directly upregulating VEGFR2 gene expression, promoting rapid granulation and new capillary loops to damaged tissue.',
    goals: ['tendon repair', 'gut lining restoration', 'ligament healing', 'joint inflammation'],
    angiogenicRisk: 'High. Acts fundamentally by stimulating endothelial sprouting and neovascularization.',
    mitochondrialImpact: 'Drives rapid endothelial cell division and tissue repair.',
    suitabilityAnalysis: 'Is it suitable for you? EXCLUDED. While highly effective for musculoskeletal injuries in healthy individuals, its reliance on VEGF-driven angiogenesis poses an unneeded risk profile for individuals with indolent lymphoma histories.'
  },
  {
    id: 'mots-c',
    name: 'MOTS-c (Mitochondrial ORF of the 12S rRNA Type-c)',
    aliases: ['mots', 'mots-c', 'mitochondrial peptide'],
    category: 'Mitochondrial-Derived Peptide (MDP)',
    suitabilityScore: 'conditional',
    suitabilityVerdict: 'CONDITIONAL: Metabolic AMPK Activator (Caution on Mitochondrial Load)',
    badgeColour: 'cyan',
    whatItDoes: 'MOTS-c translocates to the nucleus under metabolic stress to regulate cellular adaptive responses. It activates AMP-activated protein kinase (AMPK), promotes glucose clearance into skeletal muscle independent of insulin, and enhances fatty acid oxidation.',
    goals: ['insulin sensitivity', 'metabolic flexibility', 'exercise capacity', 'glucose disposal'],
    angiogenicRisk: 'Low. Operates via cellular energetic cascades rather than vascular growth factors.',
    mitochondrialImpact: 'Optimizes mitochondrial respiration efficiency.',
    suitabilityAnalysis: 'Is it suitable for you? Moderately compatible with retatrutide for insulin sensitivity, but because it acts directly on mitochondrial bioenergetics, caution is warranted to avoid over-stimulating cellular pathways during active remission protocols.'
  },
  {
    id: 'marine-collagen-tripeptides',
    name: 'Marine Collagen Tripeptides (Pro-Hyp / Gly-Pro-Hyp)',
    aliases: ['collagen', 'marine collagen', 'proline', 'glycine'],
    category: 'Structural Connective Bioactive Peptides',
    suitabilityScore: 'suitable',
    suitabilityVerdict: 'HIGHLY SUITABLE: Connective Tissue Shield with Low mTOR Burden',
    badgeColour: 'emerald',
    whatItDoes: 'Delivers di- and tri-peptides (prolyl-hydroxyproline) that resist gastric degradation and signal dermal and chondrocyte fibroblasts to produce structural collagen. Possesses an exceptionally low methionine content, preventing chronic mTORC1 overactivation while protecting joints and skin.',
    goals: ['joint cartilage', 'skin elasticity', 'gut epithelial tight junctions', 'tendon elasticity'],
    angiogenicRisk: 'Zero. Completely non-angiogenic.',
    mitochondrialImpact: 'Pure structural amino substrate; neutral on mitotic activity.',
    suitabilityAnalysis: 'Is it suitable for you? Perfectly suitable. Essential for counteracting skin laxity and tendon stiffness during rapid retatrutide fat loss, while remaining completely safe for indolent NHL remission.'
  }
];

export default function PeptideCalculator() {
  const { addNotification, peptideHistory, addPeptideHistoryEntry, deletePeptideHistoryEntry } = useApp();

  // Free-form string inputs
  const [vialInput, setVialInput] = useState('10');
  const [bacWaterInput, setBacWaterInput] = useState('2.0');
  const [targetDoseInput, setTargetDoseInput] = useState('2.0');
  const [selectedSyringeId, setSelectedSyringeId] = useState('u100-1ml');
  const [selectedSite, setSelectedSite] = useState(INJECTION_SITES[0]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [executedSearch, setExecutedSearch] = useState('');
  const [dismissedWarnings, setDismissedWarnings] = useState({});

  const selectedSyringe = useMemo(() => {
    return SYRINGE_SCALES.find(s => s.id === selectedSyringeId) || SYRINGE_SCALES[0];
  }, [selectedSyringeId]);

  const vialMg = parseFloat(vialInput) || 0;
  const bacWaterMl = parseFloat(bacWaterInput) || 0;
  const targetDoseMg = parseFloat(targetDoseInput) || 0;

  // Concentration (mg/ml)
  const concentrationMgPerMl = (vialMg > 0 && bacWaterMl > 0) ? (vialMg / bacWaterMl) : 0;

  // Draw volume and syringe units
  const volumeMl = concentrationMgPerMl > 0 ? (targetDoseMg / concentrationMgPerMl) : 0;
  const syringeUnits = Math.round(volumeMl * selectedSyringe.unitsPerMl);

  const handleExecuteSearch = (e) => {
    if (e) e.preventDefault();
    setExecutedSearch(searchQuery.trim());
  };

  // Search results query evaluation
  const searchResults = useMemo(() => {
    const q = (executedSearch || searchQuery).toLowerCase().trim();
    if (!q) return COMPREHENSIVE_PEPTIDE_DIRECTORY;

    const matches = COMPREHENSIVE_PEPTIDE_DIRECTORY.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.aliases && p.aliases.some(a => a.includes(q))) ||
      p.goals.some(g => g.toLowerCase().includes(q))
    );

    if (matches.length > 0) return matches;

    // Synthesized query result for trusted oncology review
    return [
      {
        id: `synth-${q}`,
        name: `${(executedSearch || searchQuery).toUpperCase()}`,
        category: 'Investigational Peptide / Biomolecule Review',
        suitabilityScore: 'conditional',
        suitabilityVerdict: 'RESEARCH SYNTHESIS: Verification Against Angiogenic / VEGF Databases Required',
        badgeColour: 'cyan',
        whatItDoes: `Investigational compound queried as "${executedSearch || searchQuery}". Cellular mechanism requires verification against scientific literature for receptor affinity, impact on cell cycle checkpoints, and potential influence on systemic growth factors.`,
        goals: ['investigational', 'cellular response'],
        angiogenicRisk: 'Must verify that this compound does not upregulate VEGF, basic FGF, or endothelial cell proliferation.',
        mitochondrialImpact: 'Evaluate whether it stimulates excessive mitochondrial turnover.',
        suitabilityAnalysis: `Is it suitable for you? In the context of indolent Non-Hodgkin Lymphoma (NHL) remission and retatrutide therapy, compounds are ONLY suitable if they are confirmed non-angiogenic and do not elevate IGF-1. Always verify independent HPLC purity before administration.`
      }
    ];
  }, [executedSearch, searchQuery]);

  const handleDismissWarning = (peptideId) => {
    setDismissedWarnings(prev => ({ ...prev, [peptideId]: true }));
  };

  const handleLogInjection = () => {
    const entry = {
      id: `pep-log-${Date.now()}`,
      compound: 'Retatrutide',
      doseMg: targetDoseMg,
      unitsPulled: syringeUnits,
      syringeLabel: selectedSyringe.label,
      site: selectedSite,
      concentration: Number(concentrationMgPerMl.toFixed(2)),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    addPeptideHistoryEntry(entry);
    feedbackEngine.playChime('sync');
    feedbackEngine.triggerConfetti();

    addNotification({
      type: 'workout',
      title: `Retatrutide Dose Logged: ${targetDoseMg} mg`,
      message: `${syringeUnits} units at ${selectedSite.split(' ')[0]} ${selectedSite.split(' ')[1]}.`
    });
  };

  return (
    <div className="space-y-4">
      {/* Module Title Card */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Clinical Peptide Suite
            </span>
            <h2 className="text-base font-extrabold text-white">Retatrutide Calculator & Safety Filters</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Precision syringe calculations & Non-Hodgkin Lymphoma remission safeguards.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Syringe className="w-5 h-5 stroke-[2.5px]" />
          </div>
        </div>
      </div>

      {/* Retatrutide Auto-Calculator Card */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <h3 className="text-sm font-extrabold text-white">Retatrutide Auto-Calculator</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Conc: {concentrationMgPerMl.toFixed(2)} mg/mL
          </span>
        </div>

        {/* Reconstitution Inputs */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <label className="text-[10px] text-slate-400 block font-sans font-semibold mb-1">
              Vial (mg)
            </label>
            <input
              type="text"
              value={vialInput}
              onChange={(e) => setVialInput(e.target.value)}
              placeholder="e.g. 10"
              className="w-full bg-transparent text-white font-extrabold text-base focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <label className="text-[10px] text-slate-400 block font-sans font-semibold mb-1">
              BAC Water (mL)
            </label>
            <input
              type="text"
              value={bacWaterInput}
              onChange={(e) => setBacWaterInput(e.target.value)}
              placeholder="e.g. 2.0"
              className="w-full bg-transparent text-white font-extrabold text-base focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/40">
            <label className="text-[10px] text-emerald-400 block font-sans font-semibold mb-1">
              Dose (mg)
            </label>
            <input
              type="text"
              value={targetDoseInput}
              onChange={(e) => setTargetDoseInput(e.target.value)}
              placeholder="e.g. 2.0"
              className="w-full bg-transparent text-emerald-300 font-extrabold text-base focus:outline-none"
            />
          </div>
        </div>

        {/* Syringe Scale Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Syringe Scale:</span>
            <span className="text-[10px] text-slate-400 font-mono">1 mL = {selectedSyringe.unitsPerMl} Units</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {SYRINGE_SCALES.map((scale) => (
              <button
                key={scale.id}
                type="button"
                onClick={() => setSelectedSyringeId(scale.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  selectedSyringeId === scale.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-white/5 hover:bg-slate-900'
                }`}
              >
                <div className="font-sans text-[11px] font-bold text-white">{scale.label}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Capacity: {scale.maxUnits} units</div>
              </button>
            ))}
          </div>
        </div>

        {/* Syringe Visualizer & Result */}
        <div className="glass-panel-glow-emerald rounded-2xl p-4 border border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Units to Draw on {selectedSyringe.label}:</span>
            <div className="text-right font-mono">
              <span className="text-xl font-black text-emerald-400">
                {syringeUnits} Units
              </span>
              <span className="text-xs text-slate-400 block">({volumeMl.toFixed(3)} mL)</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-7 w-full bg-slate-950 rounded-xl border border-white/20 relative overflow-hidden flex items-center p-1">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-lime-300 rounded-lg transition-all duration-500 relative flex items-center justify-end pr-2"
                style={{ width: `${Math.min(100, (syringeUnits / selectedSyringe.maxUnits) * 100)}%` }}
              >
                <span className="text-[10px] font-mono font-black text-slate-950">
                  ◀ {syringeUnits}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-[9px] font-mono text-slate-400 px-1">
              <span>0</span>
              <span>{Math.round(selectedSyringe.maxUnits * 0.5)}</span>
              <span>{selectedSyringe.maxUnits} Units</span>
            </div>
          </div>
        </div>

        {/* Injection Site Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Injection Site (Rotation Tracking):</span>
          </label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
          >
            {INJECTION_SITES.map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
        </div>

        {/* Log Dose Button */}
        <button
          onClick={handleLogInjection}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5px]" />
          <span>Log {targetDoseMg} mg Dose ({syringeUnits} Units at {selectedSite.split(' ')[0]} {selectedSite.split(' ')[1]})</span>
        </button>
      </div>

      {/* Injection Progress History Feed */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Injection Progress History ({peptideHistory.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Saved in local state</span>
        </div>

        {peptideHistory.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 text-center">
            No injections logged yet. Use the button above to record your first dose.
          </p>
        ) : (
          <div className="space-y-2">
            {peptideHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white">{item.compound} • {item.doseMg} mg</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {item.unitsPulled} Units
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {item.site} • {item.date} at {item.timestamp}
                  </p>
                </div>

                <button
                  onClick={() => deletePeptideHistoryEntry(item.id)}
                  className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-slate-900 transition-all"
                  title="Remove entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PEPTIDE SEARCH & IN-DEPTH "WHAT IT DOES & IS IT SUITABLE FOR ME" SECTION */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 bg-rose-950/15 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-white">Peptide Safety & Mechanism Intelligence</h3>
                <span className="bg-rose-500/20 text-rose-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-500/30">
                  Oncology Firewall
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Detailed physiological mechanisms & personalized indolent NHL remission evaluation
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar with dedicated ENTER button */}
        <form onSubmit={handleExecuteSearch} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search e.g. KLOw, Retatrutide, GHK-Cu, BPC-157..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 placeholder:text-slate-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1"
          >
            <span>Enter</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Search Results Displaying Detailed "What It Does" & "Is It Suitable For Me" */}
        <div className="space-y-3.5">
          {searchResults
            .filter(item => !dismissedWarnings[item.id])
            .map((item) => {
              const isApproved = item.suitabilityScore === 'suitable';
              const isCaution = item.suitabilityScore === 'conditional';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-3xl border transition-all relative space-y-3 ${
                    isApproved
                      ? 'glass-panel-glow-emerald border-emerald-500/40 bg-emerald-950/20'
                      : isCaution
                      ? 'bg-cyan-950/25 border-cyan-500/40'
                      : 'bg-rose-950/25 border-rose-500/40 shadow-sm'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between pr-7">
                    <div>
                      <h4 className="text-sm font-black text-white">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.category}</p>
                    </div>
                  </div>

                  {/* "X out" / Dismiss warning button */}
                  <button
                    onClick={() => handleDismissWarning(item.id)}
                    className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                    title="Dismiss / X-out Card"
                    aria-label="Dismiss Card"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Verdict Badge */}
                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
                    isApproved
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : isCaution
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                      : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  }`}>
                    {isApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : isCaution ? (
                      <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="text-[11px] leading-snug">{item.suitabilityVerdict}</span>
                  </div>

                  {/* SECTION 1: WHAT IT DOES FOR YOUR BODY */}
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 space-y-1 text-xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                      <Activity className="w-3.5 h-3.5" />
                      <span>What It Does For Your Body:</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {item.whatItDoes}
                    </p>
                  </div>

                  {/* SECTION 2: IS IT SUITABLE FOR ME? (PERSONALIZED REMISSION & RETATRUTIDE ASSESSMENT) */}
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 space-y-1 text-xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Is It Suitable For Me? (Remission & Retatrutide Evaluation):</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {item.suitabilityAnalysis}
                    </p>
                  </div>

                  {/* Angiogenesis & Mitochondrial Telemetry */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                      <span className="text-slate-400 block font-sans">Angiogenic Risk:</span>
                      <span className="text-slate-200 font-bold">{item.angiogenicRisk}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                      <span className="text-slate-400 block font-sans">Mitochondrial Impact:</span>
                      <span className="text-slate-200 font-bold">{item.mitochondrialImpact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
