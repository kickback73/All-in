// src/components/QuickLogModal.jsx
import React, { useState, useMemo } from 'react';
import {
  X,
  Droplets,
  Utensils,
  Syringe,
  Activity,
  Search,
} from 'lucide-react';
import { lookupVerifiedNutrients } from '../utils/nutrientEngine';
import { DEFAULT_WORKOUT_PRESETS } from '../data/initialData';

export default function QuickLogModal({
  isOpen,
  onClose,
  activeTab = 'WATER', // Strictly defaults to WATER
  onChangeTab,
  onLogWater,
  onLogFood,
  onLogPeptide,
  onLogActivity,
  stacks = [],
}) {
  const [waterMl, setWaterMl] = useState(500);

  // Food / Stack Tab State
  const [selectedStackId, setSelectedStackId] = useState('');
  const [customFoodTitle, setCustomFoodTitle] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');
  const [customLeucineMg, setCustomLeucineMg] = useState('');
  const [customMethionineMg, setCustomMethionineMg] = useState('');
  const [foodSourceLabel, setFoodSourceLabel] = useState('');
  const [isLookingUpFood, setIsLookingUpFood] = useState(false);

  // Peptides Tab State with Auto BAC Water Calculation
  const [peptideType, setPeptideType] = useState('Retatrutide');
  const [vialMg, setVialMg] = useState(10);
  const [bacWaterMl, setBacWaterMl] = useState(2.0);
  const [doseAmount, setDoseAmount] = useState(3.0);
  const [unit, setUnit] = useState('mg');
  const [site, setSite] = useState('SubQ Periumbilical');

  // Activity Tab State (Dan's Bands / Ab Wheel / Spin Bike)
  const [activityType, setActivityType] = useState('Resistance Bands (Back/V-Taper, Chest, Biceps)');
  const [durationMin, setDurationMin] = useState(40);
  const [steps, setSteps] = useState(1200);
  const [caloriesBurned, setCaloriesBurned] = useState(240);

  // Auto BAC Water & Syringe Unit Calculation inside Quick Log Modal
  const peptideCalc = useMemo(() => {
    const mg = Number(vialMg) || 0;
    const ml = Number(bacWaterMl) || 0;
    const raw = Number(doseAmount) || 0;
    const doseMcg = unit === 'mg' ? raw * 1000 : raw;
    if (mg <= 0 || ml <= 0 || doseMcg <= 0) {
      return { concentrationMcgPerMl: 0, drawMl: 0, units: 0, doseMcg: 0 };
    }
    const concentrationMcgPerMl = (mg * 1000) / ml;
    const drawMl = doseMcg / concentrationMcgPerMl;
    const units = drawMl * 100;
    return {
      concentrationMcgPerMl: Math.round(concentrationMcgPerMl),
      drawMl: Number(drawMl.toFixed(3)),
      units: Number(units.toFixed(1)),
      doseMcg,
    };
  }, [vialMg, bacWaterMl, doseAmount, unit]);

  if (!isOpen) return null;

  const handleAutoLookupFood = async () => {
    if (!customFoodTitle.trim()) return;
    setIsLookingUpFood(true);
    const result = await lookupVerifiedNutrients(customFoodTitle, null);
    setIsLookingUpFood(false);
    if (result) {
      setCustomCalories(result.calories);
      setCustomProtein(result.protein);
      setCustomCarbs(result.carbs);
      setCustomFats(result.fats);
      setCustomLeucineMg(result.aminos?.leucine || 0);
      setCustomMethionineMg(result.aminos?.methionine || 0);
      setFoodSourceLabel(result.source);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 text-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#F4F8FB] border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Quick Log & Auto-Calculator</h3>
            <p className="text-[11px] text-slate-500">Instant state update across all 6 tiles</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Segmented Control Tab Bar */}
        <div className="p-2 bg-slate-100/90 grid grid-cols-4 gap-1 m-3 rounded-2xl">
          {[
            { id: 'WATER', label: 'Water', icon: Droplets },
            { id: 'FOOD', label: 'Food/Stack', icon: Utensils },
            { id: 'PEPTIDES', label: 'Peptides', icon: Syringe },
            { id: 'ACTIVITY', label: 'Training', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="px-5 pb-5">
          {/* TAB 1: WATER (DEFAULT) */}
          {activeTab === 'WATER' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const ml = Number(waterMl) || 0;
                if (ml > 0 && onLogWater) onLogWater(ml);
                onClose();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Water Volume (ml)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={waterMl}
                  onChange={(e) => setWaterMl(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-lg font-black text-slate-900"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[250, 500, 750].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWaterMl(preset)}
                    className="py-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 text-xs font-extrabold hover:bg-sky-100"
                  >
                    +{preset} ml
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Log Hydration
              </button>
            </form>
          )}

          {/* TAB 2: FOOD / STACK */}
          {activeTab === 'FOOD' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedStackId) {
                  const found = stacks.find((s) => s.id === selectedStackId);
                  if (found && onLogFood) onLogFood({ isStack: true, stack: found });
                } else {
                  if (!customFoodTitle.trim()) return;
                  if (onLogFood) {
                    onLogFood({
                      isStack: false,
                      title: customFoodTitle.trim(),
                      calories: Number(customCalories) || 0,
                      protein: Number(customProtein) || 0,
                      carbs: Number(customCarbs) || 0,
                      fats: Number(customFats) || 0,
                      leucineMg: Number(customLeucineMg) || 0,
                      methionineMg: Number(customMethionineMg) || 0,
                    });
                  }
                }
                onClose();
              }}
              className="space-y-3"
            >
              {stacks.length > 0 && (
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                    One-Tap Saved Stack
                  </label>
                  <select
                    value={selectedStackId}
                    onChange={(e) => setSelectedStackId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="">-- Or enter food below with Auto-Fill --</option>
                    {stacks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.totals?.calories || 0} kcal • {s.totals?.protein || 0}g P)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedStackId && (
                <>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Food & Quantity (Auto-Populates USDA Nutrients)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={customFoodTitle}
                        onChange={(e) => setCustomFoodTitle(e.target.value)}
                        onBlur={handleAutoLookupFood}
                        placeholder="e.g., 200g chicken breast, 2 eggs, 150g salmon"
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAutoLookupFood}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-600 text-white text-[11px] font-extrabold flex items-center gap-1 shrink-0"
                      >
                        <Search className="w-3 h-3" />
                        <span>{isLookingUpFood ? '...' : 'Auto-Fill'}</span>
                      </button>
                    </div>
                    {foodSourceLabel && (
                      <div className="text-[10px] font-bold text-emerald-700 mt-1">
                        ✓ {foodSourceLabel}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Kcal</label>
                      <input
                        type="number"
                        required
                        value={customCalories}
                        onChange={(e) => setCustomCalories(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Prot(g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Carb(g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Fat(g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customFats}
                        onChange={(e) => setCustomFats(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Leu(mg)</label>
                      <input
                        type="number"
                        value={customLeucineMg}
                        onChange={(e) => setCustomLeucineMg(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500">Met(mg)</label>
                      <input
                        type="number"
                        value={customMethionineMg}
                        onChange={(e) => setCustomMethionineMg(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Log Nutrition
              </button>
            </form>
          )}

          {/* TAB 3: PEPTIDES (WITH AUTO BAC WATER DOSE CALCULATION) */}
          {activeTab === 'PEPTIDES' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!peptideType.trim()) return;
                if (onLogPeptide) {
                  onLogPeptide({
                    name: peptideType.trim(),
                    doseMcg: peptideCalc.doseMcg,
                    vialMg: Number(vialMg),
                    bacWaterMl: Number(bacWaterMl),
                    units: peptideCalc.units,
                    doseDisplay: `${doseAmount} ${unit} (${peptideCalc.units} IU / ${peptideCalc.drawMl} mL)`,
                    site,
                  });
                }
                onClose();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                  Peptide Type / Compound
                </label>
                <input
                  type="text"
                  required
                  value={peptideType}
                  onChange={(e) => setPeptideType(e.target.value)}
                  placeholder="e.g., Retatrutide"
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600">Vial (mg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={vialMg}
                    onChange={(e) => setVialMg(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600">BAC Water (mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bacWaterMl}
                    onChange={(e) => setBacWaterMl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-600">Dose</label>
                    <button
                      type="button"
                      onClick={() => setUnit(unit === 'mg' ? 'mcg' : 'mg')}
                      className="text-[9px] font-black text-sky-700 bg-sky-50 px-1 rounded border border-sky-200"
                    >
                      {unit} ⇄
                    </button>
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(e.target.value)}
                    className="w-full rounded-xl border border-sky-300 px-2.5 py-1.5 text-xs font-black"
                  />
                </div>
              </div>

              {/* Live Auto BAC Water & Syringe Readout */}
              <div className="rounded-xl bg-[#F4F8FB] border border-sky-200 p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">
                    Auto-Calculated Syringe Dose
                  </div>
                  <div className="text-sm font-black text-sky-800">
                    Pull {peptideCalc.units} Units (IU) = {peptideCalc.drawMl} mL
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600">
                  {peptideCalc.concentrationMcgPerMl} mcg/mL
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                  Injection Site
                </label>
                <input
                  type="text"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Log {peptideType} ({peptideCalc.units} Units)
              </button>
            </form>
          )}

          {/* TAB 4: ACTIVITY (DAN'S TRAINING PROTOCOLS) */}
          {activeTab === 'ACTIVITY' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onLogActivity) {
                  onLogActivity({
                    activityType,
                    durationMin: Number(durationMin) || 0,
                    steps: Number(steps) || 0,
                    caloriesBurned: Number(caloriesBurned) || 0,
                  });
                }
                onClose();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
                  Quick-Select Dan&apos;s Training Protocol
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DEFAULT_WORKOUT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setActivityType(preset.name);
                        setDurationMin(preset.durationMin);
                        setSteps(preset.steps);
                        setCaloriesBurned(preset.caloriesBurned);
                      }}
                      className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                    >
                      {preset.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600">Minutes</label>
                  <input
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600">Steps</label>
                  <input
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600">Burn (kcal)</label>
                  <input
                    type="number"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Log Training Session
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
