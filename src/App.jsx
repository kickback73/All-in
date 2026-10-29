// src/App.jsx
import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Layers,
  Syringe,
  Dumbbell,
  X,
  Plus,
  Search,
  CheckCircle2,
  Camera,
  HeartPulse,
  Flame,
  Trash2,
  Bike,
  Activity,
} from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import StackManager from './components/StackManager';
import PeptideCalculator from './components/PeptideCalculator';
import UserProfileModal from './components/UserProfileModal';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import { TILE_BACKGROUNDS } from './utils/backgroundEngine';
import {
  lookupVerifiedNutrients,
  VERIFIED_NUTRIENT_DATABASE,
} from './utils/nutrientEngine';

/**
 * SVG Macro Ring / Doughnut Chart (Protein, Fats, Carbs breakdown) + Caloric & Fiber Progress
 */
const MacroDoughnutChart = ({
  protein = 0,
  carbs = 0,
  fats = 0,
  calories = 0,
  targetCalories = 1900,
  size = 56,
}) => {
  const protKcal = Math.max(0, Number(protein) * 4);
  const carbKcal = Math.max(0, Number(carbs) * 4);
  const fatKcal = Math.max(0, Number(fats) * 9);
  const totalMacroKcal = Math.max(1, protKcal + carbKcal + fatKcal);

  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;

  const protFrac = protKcal / totalMacroKcal;
  const carbFrac = carbKcal / totalMacroKcal;
  const fatFrac = fatKcal / totalMacroKcal;

  const protLen = protFrac * circumference;
  const carbLen = carbFrac * circumference;
  const fatLen = fatFrac * circumference;

  const calPct = Math.min(100, Math.round((calories / Math.max(1, targetCalories)) * 100));

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="5"
        />
        {/* Protein Segment (Emerald) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#10b981"
          strokeWidth="5"
          strokeDasharray={`${protLen} ${circumference}`}
          strokeDashoffset={0}
        />
        {/* Carbs Segment (Cyan) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#06b6d4"
          strokeWidth="5"
          strokeDasharray={`${carbLen} ${circumference}`}
          strokeDashoffset={-protLen}
        />
        {/* Fats Segment (Amber) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f59e0b"
          strokeWidth="5"
          strokeDasharray={`${fatLen} ${circumference}`}
          strokeDashoffset={-(protLen + carbLen)}
        />
      </svg>
      <span className="absolute text-[10px] font-black text-white drop-shadow">
        {calPct}%
      </span>
    </div>
  );
};

/**
 * Compact SVG Syringe Fill Gauge for Peptides Tile
 */
const MiniSyringeChart = ({ units = 60 }) => {
  const pct = Math.min(100, Math.max(10, Number(units) || 60));
  return (
    <div className="w-16 flex flex-col items-end gap-1">
      <div className="w-full h-3 rounded-full bg-white/20 border border-white/40 overflow-hidden p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] font-extrabold text-violet-200 uppercase">
        {units}U Pull
      </span>
    </div>
  );
};

/**
 * Tile 2 Modal: Nutrition Overhaul (Macro Ring Chart + Calorie/Fiber Progress + Enter/Lookup + UPC Scanner)
 */
const NutritionDetailModal = ({ onClose }) => {
  const {
    dailyNutrition,
    setDailyNutrition,
    logStackToDaily,
    setIsScannerOpen,
  } = useAppContext();

  const [foodQuery, setFoodQuery] = useState('');
  const [foodGrams, setFoodGrams] = useState('');
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [stagedFood, setStagedFood] = useState(null);
  const [lastVerifiedSource, setLastVerifiedSource] = useState('');

  // Perform verified lookup (populates staged fields immediately, never leaves fields blank)
  const handleLookupFood = async (e) => {
    if (e) e.preventDefault();
    if (!foodQuery.trim()) return;
    setLoadingLookup(true);
    const verified = await lookupVerifiedNutrients(foodQuery, foodGrams || null);
    setLoadingLookup(false);
    if (verified) {
      setStagedFood({
        name: foodQuery.trim(),
        servingGrams: verified.servingGrams,
        calories: verified.calories,
        protein: verified.protein,
        carbs: verified.carbs,
        fiber: verified.fiber,
        netCarbs: verified.netCarbs,
        fats: verified.fats,
        micros: verified.micros,
        aminos: verified.aminos,
      });
      setLastVerifiedSource(verified.source);
    }
  };

  const handleSelectStaple = async (keyword) => {
    if (!keyword) return;
    setFoodQuery(keyword);
    setLoadingLookup(true);
    const verified = await lookupVerifiedNutrients(keyword, foodGrams || null);
    setLoadingLookup(false);
    if (verified) {
      setStagedFood({
        name: verified.source.split(' (')[0],
        servingGrams: verified.servingGrams,
        calories: verified.calories,
        protein: verified.protein,
        carbs: verified.carbs,
        fiber: verified.fiber,
        netCarbs: verified.netCarbs,
        fats: verified.fats,
        micros: verified.micros,
        aminos: verified.aminos,
      });
      setLastVerifiedSource(verified.source);
    }
  };

  const handleCommitStagedFood = () => {
    if (!stagedFood) return;
    logStackToDaily(stagedFood, stagedFood.name);
    setFoodQuery('');
    setFoodGrams('');
    setStagedFood(null);
  };

  const calPct = Math.min(
    100,
    Math.round((dailyNutrition.calories / Math.max(1, dailyNutrition.targetCalories)) * 100)
  );
  const fiberPct = Math.min(
    100,
    Math.round(((dailyNutrition.fiber || 0) / Math.max(1, dailyNutrition.targetFiber || 32)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#F4F8FB] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-600 text-white">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Nutrition &amp; Verified Macro Engine
              </h2>
              <p className="text-[11px] text-slate-500">
                Target: 1,850–1,950 kcal • 170–190g Protein • Facial Fat Pad Preservation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3.5">
          {/* Graphical Visualizations: SVG Macro Doughnut + Caloric & Fiber Progress Bars */}
          <div className="rounded-2xl bg-slate-900 text-white p-3.5 flex items-center gap-3.5 shadow-md">
            <MacroDoughnutChart
              protein={dailyNutrition.protein}
              carbs={dailyNutrition.carbs}
              fats={dailyNutrition.fats}
              calories={dailyNutrition.calories}
              targetCalories={dailyNutrition.targetCalories}
              size={74}
            />
            <div className="flex-1 space-y-2 min-w-0">
              {/* Caloric Budget Progress Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-0.5">
                  <span className="text-slate-300 uppercase">Daily Caloric Budget</span>
                  <span className="text-emerald-300 font-mono">
                    {dailyNutrition.calories} / {dailyNutrition.targetCalories} kcal
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${calPct}%` }}
                  />
                </div>
              </div>

              {/* Dietary Fiber Progress Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-0.5">
                  <span className="text-slate-300 uppercase">
                    Fiber &amp; Net Carbs ({dailyNutrition.netCarbs || 0}g Net)
                  </span>
                  <span className="text-cyan-300 font-mono">
                    {dailyNutrition.fiber || 0} / {dailyNutrition.targetFiber || 32}g Fiber
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{ width: `${fiberPct}%` }}
                  />
                </div>
              </div>

              {/* Macro Legend */}
              <div className="grid grid-cols-3 gap-1 text-[10px] font-bold pt-0.5">
                <span className="text-emerald-400">● PRO: {dailyNutrition.protein}g</span>
                <span className="text-cyan-300">● CARB: {dailyNutrition.carbs}g</span>
                <span className="text-amber-300">● FAT: {dailyNutrition.fats}g</span>
              </div>
            </div>
          </div>

          {/* Ingredient Entry with Explicit "Enter / Lookup" Button + UPC Barcode Camera Trigger */}
          <div className="rounded-2xl bg-[#F4F8FB] border border-sky-200 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-sky-900">
                Verified Nutritional Lookup (USDA / Baseline Staples)
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsScannerOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center gap-1 shadow-xs"
              >
                <Camera className="w-3 h-3" />
                <span>Scan UPC Barcode</span>
              </button>
            </div>

            {/* Quick Verified Staple Selector */}
            <select
              defaultValue=""
              onChange={(e) => handleSelectStaple(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800"
            >
              <option value="">⚡ Instant Staple Lookup (Banana, Eggs, Oats, White Fish, Olive Oil)...</option>
              {VERIFIED_NUTRIENT_DATABASE.map((item, i) => (
                <option key={i} value={item.keywords[0]}>
                  {item.label} ({item.defaultServingGrams}g)
                </option>
              ))}
            </select>

            <form onSubmit={handleLookupFood} className="flex gap-1.5">
              <input
                type="text"
                value={foodQuery}
                onChange={(e) => setFoodQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLookupFood(e);
                  }
                }}
                placeholder="Type food (e.g. Banana, Eggs, Oats, White Fish, Olive Oil)..."
                className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold"
              />
              <input
                type="number"
                value={foodGrams}
                onChange={(e) => setFoodGrams(e.target.value)}
                placeholder="g/ml"
                className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-bold"
              />
              <button
                type="submit"
                disabled={loadingLookup}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-1 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loadingLookup ? '...' : 'Enter / Lookup'}</span>
              </button>
            </form>

            {/* Auto-Populated Staged Food Result (Never leaves fields blank) */}
            {stagedFood && (
              <div className="rounded-xl bg-white border border-emerald-300 p-2.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lastVerifiedSource}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {stagedFood.servingGrams}g
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1 text-center">
                  <div className="bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <div className="text-[8px] font-bold text-slate-500">Kcal</div>
                    <div className="text-xs font-black text-slate-900">{stagedFood.calories}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <div className="text-[8px] font-bold text-slate-500">Protein</div>
                    <div className="text-xs font-black text-emerald-700">{stagedFood.protein}g</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <div className="text-[8px] font-bold text-slate-500">Carbs</div>
                    <div className="text-xs font-black text-sky-700">{stagedFood.carbs}g</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <div className="text-[8px] font-bold text-slate-500">Fiber</div>
                    <div className="text-xs font-black text-teal-700">{stagedFood.fiber}g</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <div className="text-[8px] font-bold text-slate-500">Net C</div>
                    <div className="text-xs font-black text-cyan-700">{stagedFood.netCarbs}g</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <div className="text-[8px] font-bold text-slate-500">Fats</div>
                    <div className="text-xs font-black text-amber-700">{stagedFood.fats}g</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 flex flex-wrap gap-2 font-semibold">
                  <span>Na: {stagedFood.micros?.sodium || 0}mg</span>
                  <span>K: {stagedFood.micros?.potassium || 0}mg</span>
                  <span>Mg: {stagedFood.micros?.magnesium || 0}mg</span>
                  <span>Vit C: {stagedFood.micros?.vitaminC || 0}mg</span>
                  <span>Leu: {stagedFood.aminos?.leucine || 0}mg</span>
                </div>

                <button
                  type="button"
                  onClick={handleCommitStagedFood}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {stagedFood.name} to Daily Totals</span>
                </button>
              </div>
            )}
          </div>

          {/* Direct Editable Daily Totals */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase text-slate-500">
              Edit Daily Nutrition Totals Directly
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Calories', key: 'calories' },
                { label: 'Target Kcal', key: 'targetCalories' },
                { label: 'Protein (g)', key: 'protein' },
                { label: 'Total Carbs (g)', key: 'carbs' },
                { label: 'Fiber (g)', key: 'fiber' },
                { label: 'Fats (g)', key: 'fats' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-[9px] font-extrabold text-slate-600 uppercase mb-0.5">
                    {label}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={dailyNutrition[key] ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDailyNutrition((prev) => {
                        const updated = { ...prev, [key]: val };
                        const c = Number(updated.carbs) || 0;
                        const f = Number(updated.fiber) || 0;
                        updated.netCarbs = Math.max(0, Math.round((c - f) * 10) / 10);
                        return updated;
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Tile 4 Modal: Athletic Training & Dynamic Calorie / Heart Rate Calculators
 * 1. Spin Bike (Duration, Avg HR, 15-Sec Pulse × 4 Calculator, 5 HR Zones for Age 53, Active Fat Burn Zone highlight)
 * 2. Ab Wheel Rollouts (Strictly Body Weight lbs/kg, Reps, Sets, Kneeling/Standing — Mechanical Work Formula)
 * 3. Resistance Bands (Strictly Band Rating lbs tension, Reps, Sets — Mechanical Volume Load)
 */
const AthleticTrainingModal = ({ onClose }) => {
  const {
    userProfile,
    dailyActivity,
    addTrainingSession,
    deleteTrainingSession,
  } = useAppContext();

  const [activeSubTab, setActiveSubTab] = useState('spin');

  // 1. Spin Bike State
  const [spinMinutes, setSpinMinutes] = useState(30);
  const [pulseCount15Sec, setPulseCount15Sec] = useState('');
  const [avgBpm, setAvgBpm] = useState(112); // Zone 2 default for Age 53 (Max HR 167 -> Zone 2 is 100-117 BPM)

  const athleteAge = Number(userProfile.age) || 53;
  const maxHr = Number(userProfile.maxHr) || 220 - athleteAge;
  const bodyWeightLbs = Number(userProfile.weightLbs) || 229;
  const bodyWeightKg = bodyWeightLbs * 0.45359237;

  const hrZones = useMemo(
    () => [
      {
        zone: 'Zone 1 (Active Recovery)',
        pctLabel: '50–60%',
        min: Math.round(maxHr * 0.5),
        max: Math.round(maxHr * 0.6),
        met: 4.5,
        isFatBurn: false,
      },
      {
        zone: 'Zone 2 (Fat Burn / Aerobic Base)',
        pctLabel: '60–70%',
        min: Math.round(maxHr * 0.6),
        max: Math.round(maxHr * 0.7),
        met: 6.8,
        isFatBurn: true,
      },
      {
        zone: 'Zone 3 (Aerobic / Tempo)',
        pctLabel: '70–80%',
        min: Math.round(maxHr * 0.7),
        max: Math.round(maxHr * 0.8),
        met: 8.5,
        isFatBurn: false,
      },
      {
        zone: 'Zone 4 (Threshold)',
        pctLabel: '80–90%',
        min: Math.round(maxHr * 0.8),
        max: Math.round(maxHr * 0.9),
        met: 10.5,
        isFatBurn: false,
      },
      {
        zone: 'Zone 5 (Neuromuscular / Max)',
        pctLabel: '90–100%',
        min: Math.round(maxHr * 0.9),
        max: maxHr,
        met: 12.5,
        isFatBurn: false,
      },
    ],
    [maxHr]
  );

  const activeSpinZone = useMemo(() => {
    const bpm = Number(avgBpm) || 0;
    return (
      hrZones.find((z) => bpm >= z.min && bpm <= z.max) ||
      (bpm < hrZones[0].min ? hrZones[0] : hrZones[hrZones.length - 1])
    );
  }, [avgBpm, hrZones]);

  // Calorie burn = (MET * 3.5 * weightKg / 200) * durationMinutes
  const spinCalories = useMemo(() => {
    const mins = Math.max(0, Number(spinMinutes) || 0);
    const met = activeSpinZone?.met || 6.8;
    return Math.round(((met * 3.5 * bodyWeightKg) / 200) * mins);
  }, [spinMinutes, activeSpinZone, bodyWeightKg]);

  const handlePulse15Change = (val) => {
    setPulseCount15Sec(val);
    const num = Number(val);
    if (num > 0) {
      setAvgBpm(Math.round(num * 4));
    }
  };

  // 2. Ab Wheel Rollouts State (Strictly Body Weight, Reps, Sets, Kneeling vs. Standing)
  const [abWeightUnit, setAbWeightUnit] = useState('lbs');
  const [abWeightValue, setAbWeightValue] = useState(bodyWeightLbs);
  const [abReps, setAbReps] = useState(12);
  const [abSets, setAbSets] = useState(3);
  const [abStance, setAbStance] = useState('kneeling'); // 'kneeling' (0.85m) | 'standing' (1.25m)

  const abCalculation = useMemo(() => {
    const totalReps = Math.max(0, (Number(abReps) || 0) * (Number(abSets) || 0));
    const weightKg =
      abWeightUnit === 'kg'
        ? Number(abWeightValue) || 0
        : (Number(abWeightValue) || 0) * 0.45359237;
    const displacementMeters = abStance === 'standing' ? 1.25 : 0.85;

    // Exact mechanical work formula: Total Reps * ((WeightKg * 9.80665 * Displacement) / (4184 * 0.23))
    const rawMechanicalKcal =
      totalReps * ((weightKg * 9.80665 * displacementMeters) / (4184 * 0.23));
    // Calisthenic MET 6.0 set-volume density adjustment (anti-extension isometric core stabilization)
    const setDensityKcal = (Number(abSets) || 0) * 3.2;
    const totalKcal = Math.max(1, Math.round((rawMechanicalKcal + setDensityKcal) * 10) / 10);

    return {
      totalReps,
      weightKg: weightKg.toFixed(1),
      displacementMeters,
      rawMechanicalKcal: rawMechanicalKcal.toFixed(2),
      totalKcal: Math.round(totalKcal),
    };
  }, [abWeightUnit, abWeightValue, abReps, abSets, abStance]);

  // 3. Resistance Bands State (Strictly Band Rating lbs tension, Reps, Sets)
  const [bandFocus, setBandFocus] = useState('Back / V-Taper (Lat Pulldown & Row)');
  const [bandTensionLbs, setBandTensionLbs] = useState(60);
  const [bandReps, setBandReps] = useState(12);
  const [bandSets, setBandSets] = useState(4);

  const bandCalculation = useMemo(() => {
    const tensionLbs = Math.max(0, Number(bandTensionLbs) || 0);
    const reps = Math.max(0, Number(bandReps) || 0);
    const sets = Math.max(0, Number(bandSets) || 0);
    const totalReps = reps * sets;
    const totalVolumeLbs = tensionLbs * totalReps;
    // Mechanical work expenditure from resistance volume (lbs * reps * sets) & eccentric time-under-tension density
    const forceNewtons = tensionLbs * 4.44822;
    const strokeMeters = 0.65;
    const mechanicalKcal = (totalReps * forceNewtons * strokeMeters) / (4184 * 0.22);
    const densityBonus = sets * 4.5;
    const calories = Math.max(1, Math.round(mechanicalKcal + densityBonus));

    return {
      totalReps,
      totalVolumeLbs,
      calories,
    };
  }, [bandTensionLbs, bandReps, bandSets]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#F4F8FB] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-indigo-600 text-white">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Athletic Training &amp; Load Calculators
              </h2>
              <p className="text-[11px] text-slate-500">
                Spin Bike HR Zones • Ab Wheel Mechanical Work • Band Volume
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modality Sub-Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 mx-4 mt-3 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('spin')}
            className={`py-1.5 rounded-xl text-[11px] font-black transition ${
              activeSubTab === 'spin'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            1. Spin Bike HR
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('abwheel')}
            className={`py-1.5 rounded-xl text-[11px] font-black transition ${
              activeSubTab === 'abwheel'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            2. Ab Wheel
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('bands')}
            className={`py-1.5 rounded-xl text-[11px] font-black transition ${
              activeSubTab === 'bands'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            3. Bands (lbs)
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3.5">
          {/* TAB 1: SPIN BIKE (HEART RATE & ZONES) */}
          {activeSubTab === 'spin' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={spinMinutes}
                    onChange={(e) => setSpinMinutes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-rose-700 uppercase mb-1">
                    15s Pulse (×4)
                  </label>
                  <input
                    type="number"
                    value={pulseCount15Sec}
                    onChange={(e) => handlePulse15Change(e.target.value)}
                    placeholder="e.g. 28 → 112"
                    className="w-full rounded-xl border border-rose-300 bg-rose-50/50 px-2.5 py-1.5 text-xs font-black text-rose-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Avg HR (BPM)
                  </label>
                  <input
                    type="number"
                    value={avgBpm}
                    onChange={(e) => setAvgBpm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
              </div>

              {/* Dynamic Training Zones Table based on Age (53 -> Max HR 167) */}
              <div className="rounded-2xl border border-slate-200 bg-[#F4F8FB] p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-600">
                  <span>
                    Age {athleteAge} HR Zones (Max HR: {maxHr} BPM)
                  </span>
                  <span className="text-emerald-700">★ Zone 2 Fat Burn Target</span>
                </div>
                <div className="space-y-1">
                  {hrZones.map((z) => {
                    const isCurrent = activeSpinZone?.zone === z.zone;
                    return (
                      <div
                        key={z.zone}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] border transition ${
                          z.isFatBurn
                            ? isCurrent
                              ? 'bg-emerald-600 text-white border-emerald-700 font-black shadow-xs'
                              : 'bg-emerald-50 text-emerald-950 border-emerald-300 font-extrabold'
                            : isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-700 font-black'
                            : 'bg-white text-slate-700 border-slate-200/80 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{z.zone}</span>
                          {z.isFatBurn && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-300 text-slate-950 font-black">
                              FAT BURN
                            </span>
                          )}
                        </div>
                        <span className="font-mono">
                          {z.pctLabel} ({z.min}–{z.max} BPM)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-indigo-700">
                    Active Zone: {activeSpinZone?.zone}
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    Estimated Burn: {spinCalories} kcal{' '}
                    <span className="text-xs font-semibold text-slate-600">
                      ({spinMinutes} min @ {avgBpm} BPM)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addTrainingSession({
                      type: 'Spin Bike',
                      summary: `${spinMinutes} min • ${avgBpm} BPM (${activeSpinZone?.zone.split(' (')[0]})`,
                      calories: spinCalories,
                      durationMinutes: Number(spinMinutes) || 0,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Spin</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AB WHEEL ROLLOUTS (STRICTLY BODY WEIGHT, REPS, SETS) */}
          {activeSubTab === 'abwheel' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Body Weight
                  </label>
                  <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <input
                      type="number"
                      value={abWeightValue}
                      onChange={(e) => setAbWeightValue(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-black"
                    />
                    <select
                      value={abWeightUnit}
                      onChange={(e) => setAbWeightUnit(e.target.value)}
                      className="bg-slate-100 px-2 text-[10px] font-extrabold border-l border-slate-200"
                    >
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Rollout Mechanics
                  </label>
                  <select
                    value={abStance}
                    onChange={(e) => setAbStance(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option value="kneeling">Kneeling Rollout (0.85m disp)</option>
                    <option value="standing">Standing Rollout (1.25m disp)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Reps per Set
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={abReps}
                    onChange={(e) => setAbReps(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Total Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={abSets}
                    onChange={(e) => setAbSets(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-[#F4F8FB] border border-slate-200 p-3 space-y-1 text-[11px]">
                <div className="font-extrabold text-slate-800">
                  Calisthenic Mechanical Work Model ({abCalculation.totalReps} Total Reps)
                </div>
                <div className="text-slate-600 font-mono text-[10px]">
                  Mass: {abCalculation.weightKg} kg • Displacement: {abCalculation.displacementMeters} m • Work: {abCalculation.rawMechanicalKcal} kcal + Core Isometric Density
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-indigo-700">
                    {abSets} Sets × {abReps} Reps ({abStance})
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    Expenditure: {abCalculation.totalKcal} kcal
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addTrainingSession({
                      type: 'Ab Wheel Rollouts',
                      summary: `${abStance} • ${abWeightValue}${abWeightUnit} • ${abReps} reps × ${abSets} sets`,
                      calories: abCalculation.totalKcal,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Ab Wheel</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RESISTANCE BANDS (STRICTLY BAND TENSION LBS, REPS, SETS) */}
          {activeSubTab === 'bands' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                  Target Muscle Group (Dan&apos;s V-Taper Protocol)
                </label>
                <select
                  value={bandFocus}
                  onChange={(e) => setBandFocus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold"
                >
                  <option value="Back / V-Taper (Lat Pulldown & Seated Row)">
                    Back / V-Taper (Lat Pulldown &amp; Seated Row)
                  </option>
                  <option value="Chest (Banded Press & Crossover Fly)">
                    Chest (Banded Press &amp; Crossover Fly)
                  </option>
                  <option value="Biceps (Strict Banded Peak Curl)">
                    Biceps (Strict Banded Peak Curl)
                  </option>
                  <option value="Shoulders / Rear Delts (Face Pulls)">
                    Shoulders / Rear Delts (Face Pulls)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Band Rating (lbs)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={bandTensionLbs}
                    onChange={(e) => setBandTensionLbs(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bandReps}
                    onChange={(e) => setBandReps(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bandSets}
                    onChange={(e) => setBandSets(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-indigo-700">
                    Mechanical Load Volume: {bandCalculation.totalVolumeLbs.toLocaleString()} lbs
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    Expenditure: {bandCalculation.calories} kcal{' '}
                    <span className="text-xs font-semibold text-slate-600">
                      ({bandCalculation.totalReps} total reps)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addTrainingSession({
                      type: 'Resistance Bands',
                      summary: `${bandFocus.split(' (')[0]} • ${bandTensionLbs} lbs × ${bandReps} reps × ${bandSets} sets`,
                      calories: bandCalculation.calories,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Bands</span>
                </button>
              </div>
            </div>
          )}

          {/* Logged Athletic Training Sessions Today */}
          <div className="rounded-2xl border border-slate-200 p-3 bg-white space-y-2">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-600">
              <span>Today&apos;s Logged Training ({dailyActivity.trainingLogs?.length || 0})</span>
              <span className="text-indigo-700">
                Total Burned: {dailyActivity.caloriesBurned} kcal
              </span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {(dailyActivity.trainingLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-black text-slate-900">{log.type}</div>
                    <div className="text-[10px] text-slate-600 truncate">{log.summary}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-black text-indigo-700">
                      {log.calories} kcal
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteTrainingSession(log.id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function DashboardContent() {
  const {
    dailyNutrition,
    dailyActivity,
    savedStacks,
    setSavedStacks,
    peptideHistory,
    logStackToDaily,
    setIsScannerOpen,
  } = useAppContext();

  // Active modal state: null | 'stacks' | 'nutrition' | 'peptides' | 'activity' | 'profile'
  const [activeTileModal, setActiveTileModal] = useState(null);

  const handleSaveStack = (newStack) => {
    setSavedStacks((prev) => {
      const exists = prev.some((s) => s.id === newStack.id);
      return exists
        ? prev.map((s) => (s.id === newStack.id ? newStack : s))
        : [newStack, ...prev];
    });
  };

  const handleDeleteStack = (id) => {
    setSavedStacks((prev) => prev.filter((s) => s.id !== id));
  };

  const latestPeptide = peptideHistory[0] || {
    peptideName: 'Retatrutide',
    desiredDoseValue: 3,
    desiredDoseUnit: 'mg',
    syringeUnits: 60,
    site: 'Abdomen (Periumbilical, left/right)',
  };

  const calPct = Math.min(
    100,
    Math.round((dailyNutrition.calories / Math.max(1, dailyNutrition.targetCalories)) * 100)
  );
  const fiberPct = Math.min(
    100,
    Math.round(((dailyNutrition.fiber || 0) / Math.max(1, dailyNutrition.targetFiber || 32)) * 100)
  );

  // 4 Core Dashboard Tiles (Morning Stack at Top-Left, Nutrition at Top-Right, Peptides at Bottom-Left, Athletic Training at Bottom-Right)
  const tiles = [
    {
      id: 'stacks',
      title: 'Morning Stack',
      subtitle: '750ml + Organika + 5g Creatine + 14g Collagen',
      primaryStat: `${savedStacks.length} Active`,
      secondaryStat: '50 kcal • 12.6g PRO • 750ml H2O',
      bgImage: TILE_BACKGROUNDS.stacks,
      icon: Layers,
      accent: 'from-amber-500/85 to-slate-950/95',
      chart: (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-end gap-1 h-8">
            <div className="w-2 bg-sky-300 rounded-t h-8" title="750ml Water" />
            <div className="w-2 bg-amber-300 rounded-t h-6" title="Organika Electrolytes" />
            <div className="w-2 bg-emerald-300 rounded-t h-5" title="5g Creatine" />
            <div className="w-2 bg-cyan-300 rounded-t h-7" title="14g Bovine Collagen" />
          </div>
          <span className="text-[9px] font-black text-amber-200 uppercase">Top-Left Stack</span>
        </div>
      ),
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      subtitle: `${dailyNutrition.protein}g / ${dailyNutrition.targetProtein}g PRO • ${dailyNutrition.netCarbs || 0}g Net C`,
      primaryStat: `${dailyNutrition.calories} kcal`,
      secondaryStat: `Budget: ${dailyNutrition.targetCalories} kcal • Fiber: ${dailyNutrition.fiber || 0}g`,
      bgImage: TILE_BACKGROUNDS.nutrition,
      icon: Utensils,
      accent: 'from-emerald-600/80 to-slate-950/95',
      chart: (
        <MacroDoughnutChart
          protein={dailyNutrition.protein || 45}
          carbs={dailyNutrition.carbs || 30}
          fats={dailyNutrition.fats || 15}
          calories={dailyNutrition.calories}
          targetCalories={dailyNutrition.targetCalories}
          size={54}
        />
      ),
      extraFooter: (
        <div className="space-y-1 mt-1">
          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${calPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-200 font-bold">
            <span>Fiber: {fiberPct}%</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsScannerOpen(true);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/50"
            >
              <Camera className="w-2.5 h-2.5" />
              UPC Scan
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'peptides',
      title: 'Peptides & NHL Guard',
      subtitle: `${latestPeptide.peptideName.split(' ')[0]} ${latestPeptide.desiredDoseValue}${latestPeptide.desiredDoseUnit}`,
      primaryStat: `${latestPeptide.syringeUnits} Units`,
      secondaryStat: `Site: ${latestPeptide.site?.split(' (')[0] || 'Abdomen'}`,
      bgImage: TILE_BACKGROUNDS.peptides,
      icon: Syringe,
      accent: 'from-violet-600/80 to-slate-950/95',
      chart: <MiniSyringeChart units={latestPeptide.syringeUnits} />,
    },
    {
      id: 'activity',
      title: 'Athletic Training',
      subtitle: 'Spin HR Zones • Ab Wheel • Bands (lbs)',
      primaryStat: `${dailyActivity.caloriesBurned} kcal`,
      secondaryStat: `${dailyActivity.trainingLogs?.length || 0} Sessions • Zone 2 Fat Burn`,
      bgImage: TILE_BACKGROUNDS.activity,
      icon: Dumbbell,
      accent: 'from-indigo-600/80 to-slate-950/95',
      chart: (
        <div className="flex flex-col items-end gap-1">
          <div className="px-2 py-1 rounded-lg bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[9px] font-black flex items-center gap-1">
            <HeartPulse className="w-3 h-3 text-rose-400" />
            <span>Z2: 100–117</span>
          </div>
          <span className="text-[9px] font-bold text-indigo-200">Age 53 • Max 167</span>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-white flex flex-col overflow-hidden select-none">
      {/* Persistent Top Header with Sync Status, Athlete Avatar, Compact Hydration & Linear mTOR Spectrum */}
      <Header onOpenProfile={() => setActiveTileModal('profile')} />

      {/* Main 2x2 Tile Grid (Fits comfortably on Pixel 8 without scrolling) */}
      <main className="flex-1 max-w-md w-full mx-auto p-2.5 grid grid-cols-2 grid-rows-2 gap-2.5 overflow-hidden">
        {tiles.map((tile) => {
          const IconComponent = tile.icon;
          return (
            <div
              key={tile.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTileModal(tile.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveTileModal(tile.id);
              }}
              className="relative rounded-2xl overflow-hidden border border-white/15 shadow-lg group text-left flex flex-col justify-between p-3 transition-transform active:scale-[0.98] cursor-pointer"
            >
              {/* Background Image from /public/images/ */}
              <img
                src={tile.bgImage}
                alt={tile.title}
                className="absolute inset-0 w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-500"
              />
              {/* Readability Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${tile.accent} via-slate-950/65 to-slate-950/35`}
              />

              {/* Top Row: Title + Badge */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-xl bg-white/15 backdrop-blur-md text-white">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black tracking-tight text-white drop-shadow">
                    {tile.title}
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/40 text-white/85 border border-white/15">
                  Open
                </span>
              </div>

              {/* Bottom Row: Daily Info + Visual Chart */}
              <div className="relative z-10 w-full mt-auto pt-2">
                <div className="flex items-end justify-between gap-1.5">
                  <div className="min-w-0">
                    <div className="text-base font-black text-white leading-tight drop-shadow truncate">
                      {tile.primaryStat}
                    </div>
                    <div className="text-[10px] font-bold text-slate-200 truncate">
                      {tile.subtitle}
                    </div>
                    <div className="text-[9px] font-medium text-slate-300/90 truncate">
                      {tile.secondaryStat}
                    </div>
                  </div>
                  <div className="shrink-0">{tile.chart}</div>
                </div>
                {tile.extraFooter}
              </div>
            </div>
          );
        })}
      </main>

      {/* Modals for Each Tile */}
      {activeTileModal === 'stacks' && (
        <StackManager
          isOpen={true}
          stacks={savedStacks}
          onSaveStack={handleSaveStack}
          onDeleteStack={handleDeleteStack}
          onLogStack={(stack) => logStackToDaily(stack.totals, stack.name)}
          onClose={() => setActiveTileModal(null)}
        />
      )}

      {activeTileModal === 'nutrition' && (
        <NutritionDetailModal onClose={() => setActiveTileModal(null)} />
      )}

      {activeTileModal === 'peptides' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3.5 bg-[#F4F8FB] border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-violet-600 text-white">
                  <Syringe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Peptide Injection &amp; Clinical Remission Protocol
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Auto BAC Water Calculator • NHL Remission Guardrail • Full CRUD
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTileModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <PeptideCalculator isOpen={true} />
            </div>
          </div>
        </div>
      )}

      {activeTileModal === 'activity' && (
        <AthleticTrainingModal onClose={() => setActiveTileModal(null)} />
      )}

      {/* All-In Athlete Profile & Historical Logs Modal */}
      <UserProfileModal
        isOpen={activeTileModal === 'profile'}
        onClose={() => setActiveTileModal(null)}
      />

      {/* Embedded UPC Barcode Camera Scanner Modal */}
      <BarcodeScannerModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
