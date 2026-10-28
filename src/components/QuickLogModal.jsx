// src/components/QuickLogModal.jsx
import React, { useState } from 'react';
import {
  X,
  Droplets,
  Utensils,
  Syringe,
  Activity,
  Plus,
  CheckCircle2
} from 'lucide-react';

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
  const [waterMl, setWaterMl] = useState(350);

  // Food / Stack Tab State
  const [selectedStackId, setSelectedStackId] = useState('');
  const [customFoodTitle, setCustomFoodTitle] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');
  const [customLeucineMg, setCustomLeucineMg] = useState('');

  // Peptides Tab State
  const [vialName, setVialName] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [unit, setUnit] = useState('mcg');
  const [site, setSite] = useState('SubQ Periumbilical');

  // Activity Tab State
  const [activityType, setActivityType] = useState('Zone 2 Cardio / Walk');
  const [durationMin, setDurationMin] = useState(30);
  const [steps, setSteps] = useState(3500);
  const [caloriesBurned, setCaloriesBurned] = useState(180);

  if (!isOpen) return null;

  const handleWaterSubmit = (e) => {
    e.preventDefault();
    const ml = Number(waterMl) || 0;
    if (ml <= 0) return;
    if (onLogWater) onLogWater(ml);
    onClose();
  };

  const handleFoodSubmit = (e) => {
    e.preventDefault();
    if (selectedStackId) {
      const found = stacks.find((s) => s.id === selectedStackId);
      if (found && onLogFood) {
        onLogFood({
          isStack: true,
          stack: found,
        });
      }
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
        });
      }
    }
    onClose();
  };

  const handlePeptideSubmit = (e) => {
    e.preventDefault();
    if (!vialName.trim()) return;
    const rawDose = Number(doseAmount) || 0;
    const doseMcg = unit === 'mg' ? rawDose * 1000 : rawDose;
    if (onLogPeptide) {
      onLogPeptide({
        name: vialName.trim(),
        doseMcg,
        doseDisplay: `${rawDose} ${unit}`,
        site,
      });
    }
    onClose();
  };

  const handleActivitySubmit = (e) => {
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F4F8FB] border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Quick Protocol & Health Log</h3>
            <p className="text-xs text-slate-500">Real-time state update without page reload</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Segmented Control Tab Bar */}
        <div className="p-2.5 bg-slate-100/80 grid grid-cols-4 gap-1.5 m-4 rounded-2xl">
          {[
            { id: 'WATER', label: '1. Water', icon: Droplets },
            { id: 'FOOD', label: '2. Food / Stack', icon: Utensils },
            { id: 'PEPTIDES', label: '3. Peptides', icon: Syringe },
            { id: 'ACTIVITY', label: '4. Activity', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`py-2 px-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1 ${
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
        <div className="px-6 pb-6">
          {/* TAB 1: WATER (DEFAULT) */}
          {activeTab === 'WATER' && (
            <form onSubmit={handleWaterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1.5">
                  Water Amount (ml)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={waterMl}
                  onChange={(e) => setWaterMl(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-black text-slate-900 focus:border-sky-600 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[250, 500, 750].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWaterMl(preset)}
                    className="py-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 text-xs font-bold hover:bg-sky-100 transition"
                  >
                    +{preset} ml
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm transition shadow-sm cursor-pointer"
              >
                Log Hydration Immediately
              </button>
            </form>
          )}

          {/* TAB 2: FOOD / STACK */}
          {activeTab === 'FOOD' && (
            <form onSubmit={handleFoodSubmit} className="space-y-3.5">
              {stacks.length > 0 && (
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Quick-Select Saved Stack
                  </label>
                  <select
                    value={selectedStackId}
                    onChange={(e) => setSelectedStackId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="">-- Or enter custom calorie/macro item below --</option>
                    {stacks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.totals.calories} kcal • {s.totals.protein}g P)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedStackId && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                      Food / Meal Item Title
                    </label>
                    <input
                      type="text"
                      required
                      value={customFoodTitle}
                      onChange={(e) => setCustomFoodTitle(e.target.value)}
                      placeholder="e.g., Wild Salmon & Cruciferous Greens"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Calories</label>
                      <input
                        type="number"
                        required
                        value={customCalories}
                        onChange={(e) => setCustomCalories(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Protein (g)</label>
                      <input
                        type="number"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Carbs (g)</label>
                      <input
                        type="number"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Fats (g)</label>
                      <input
                        type="number"
                        value={customFats}
                        onChange={(e) => setCustomFats(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Leucine (mg)</label>
                      <input
                        type="number"
                        value={customLeucineMg}
                        onChange={(e) => setCustomLeucineMg(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm transition shadow-sm cursor-pointer"
              >
                Log Nutrition State
              </button>
            </form>
          )}

          {/* TAB 3: PEPTIDES */}
          {activeTab === 'PEPTIDES' && (
            <form onSubmit={handlePeptideSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Peptide / Vial Identifier
                </label>
                <input
                  type="text"
                  required
                  value={vialName}
                  onChange={(e) => setVialName(e.target.value)}
                  placeholder="e.g., Thymosin Alpha-1"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Dose Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Dose Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="mcg">mcg</option>
                    <option value="mg">mg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Injection Site Note
                </label>
                <input
                  type="text"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition shadow-sm cursor-pointer"
              >
                Log Peptide Administration
              </button>
            </form>
          )}

          {/* TAB 4: ACTIVITY */}
          {activeTab === 'ACTIVITY' && (
            <form onSubmit={handleActivitySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Activity Type
                </label>
                <input
                  type="text"
                  required
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600">Duration (min)</label>
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
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition shadow-sm cursor-pointer"
              >
                Log Movement & Activity
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

