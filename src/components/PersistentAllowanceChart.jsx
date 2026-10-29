// src/components/PersistentAllowanceChart.jsx
import React, { useState } from 'react';
import { BarChart3, Dna, Zap, Flame } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function PersistentAllowanceChart({ showDetailedBreakdown = false }) {
  const { dailyNutrition, dailyHydration, dailyActivity } = useAppContext();
  const [detailSubTab, setDetailSubTab] = useState('macros'); // 'macros' | 'micros' | 'aminos'

  const targets = dailyNutrition.targets || {};
  const microTargets = targets.micros || {
    vitaminD: 50,
    vitaminC: 120,
    magnesium: 420,
    zinc: 15,
    potassium: 3400,
    sodium: 2300,
  };
  const aminoTargets = targets.aminos || {
    leucine: 3000,
    isoleucine: 1500,
    valine: 1800,
    lysine: 2400,
    methionine: 1200,
    phenylalanine: 1600,
    threonine: 1400,
    tryptophan: 400,
    histidine: 900,
  };

  const macroRows = [
    {
      label: 'Calories',
      logged: Math.round(Number(dailyNutrition.calories) || 0),
      target: Number(dailyNutrition.targetCalories) || 1900,
      unit: 'kcal',
      color: 'from-emerald-400 to-teal-300',
      text: 'text-emerald-300',
    },
    {
      label: 'Protein',
      logged: Math.round((Number(dailyNutrition.protein) || 0) * 10) / 10,
      target: Number(dailyNutrition.targetProtein) || 180,
      unit: 'g',
      color: 'from-sky-400 to-cyan-300',
      text: 'text-sky-300',
    },
    {
      label: 'Total Carbs',
      logged: Math.round((Number(dailyNutrition.carbs) || 0) * 10) / 10,
      target: Number(dailyNutrition.targetCarbs) || 140,
      unit: 'g',
      color: 'from-cyan-400 to-blue-400',
      text: 'text-cyan-300',
    },
    {
      label: 'Dietary Fiber',
      logged: Math.round((Number(dailyNutrition.fiber) || 0) * 10) / 10,
      target: Number(dailyNutrition.targetFiber) || 32,
      unit: 'g',
      color: 'from-violet-400 to-fuchsia-400',
      text: 'text-violet-300',
    },
    {
      label: 'Total Fats',
      logged: Math.round((Number(dailyNutrition.fats) || 0) * 10) / 10,
      target: Number(dailyNutrition.targetFats) || 65,
      unit: 'g',
      color: 'from-amber-400 to-orange-400',
      text: 'text-amber-300',
    },
    {
      label: 'Hydration',
      logged: Math.round(Number(dailyHydration.currentMl) || 0),
      target: Number(dailyHydration.targetMl) || 3250,
      unit: 'ml',
      color: 'from-blue-400 to-sky-300',
      text: 'text-sky-200',
    },
  ];

  const microRows = [
    {
      label: 'Vitamin D3',
      logged: Math.round((Number(dailyNutrition.micros?.vitaminD) || 0) * 10) / 10,
      target: Number(microTargets.vitaminD) || 50,
      unit: 'mcg',
      color: 'from-amber-400 to-yellow-300',
      text: 'text-amber-300',
    },
    {
      label: 'Vitamin C (Collagen Cofactor)',
      logged: Math.round(Number(dailyNutrition.micros?.vitaminC) || 0),
      target: Number(microTargets.vitaminC) || 120,
      unit: 'mg',
      color: 'from-orange-400 to-amber-300',
      text: 'text-orange-300',
    },
    {
      label: 'Magnesium',
      logged: Math.round(Number(dailyNutrition.micros?.magnesium) || 0),
      target: Number(microTargets.magnesium) || 420,
      unit: 'mg',
      color: 'from-purple-400 to-indigo-300',
      text: 'text-purple-300',
    },
    {
      label: 'Zinc',
      logged: Math.round((Number(dailyNutrition.micros?.zinc) || 0) * 10) / 10,
      target: Number(microTargets.zinc) || 15,
      unit: 'mg',
      color: 'from-cyan-400 to-sky-300',
      text: 'text-cyan-300',
    },
    {
      label: 'Potassium (K+)',
      logged: Math.round(Number(dailyNutrition.micros?.potassium) || 0),
      target: Number(microTargets.potassium) || 3400,
      unit: 'mg',
      color: 'from-emerald-400 to-teal-300',
      text: 'text-emerald-300',
    },
    {
      label: 'Sodium (Na+)',
      logged: Math.round(Number(dailyNutrition.micros?.sodium) || 0),
      target: Number(microTargets.sodium) || 2300,
      unit: 'mg',
      color: 'from-sky-400 to-blue-300',
      text: 'text-sky-300',
    },
  ];

  const aminoRows = [
    {
      label: 'Leucine (BCAA • mTOR Trigger)',
      logged: Math.round(Number(dailyNutrition.aminos?.leucine) || 0),
      target: Number(aminoTargets.leucine) || 3000,
      unit: 'mg',
      color: 'from-cyan-400 to-emerald-400',
      text: 'text-cyan-300',
    },
    {
      label: 'Isoleucine (BCAA)',
      logged: Math.round(Number(dailyNutrition.aminos?.isoleucine) || 0),
      target: Number(aminoTargets.isoleucine) || 1500,
      unit: 'mg',
      color: 'from-sky-400 to-cyan-300',
      text: 'text-sky-300',
    },
    {
      label: 'Valine (BCAA)',
      logged: Math.round(Number(dailyNutrition.aminos?.valine) || 0),
      target: Number(aminoTargets.valine) || 1800,
      unit: 'mg',
      color: 'from-blue-400 to-sky-300',
      text: 'text-blue-300',
    },
    {
      label: 'Lysine (Collagen Cross-Linking)',
      logged: Math.round(Number(dailyNutrition.aminos?.lysine) || 0),
      target: Number(aminoTargets.lysine) || 2400,
      unit: 'mg',
      color: 'from-emerald-400 to-teal-300',
      text: 'text-emerald-300',
    },
    {
      label: 'Methionine (NHL Ceiling Guard)',
      logged: Math.round(Number(dailyNutrition.aminos?.methionine) || 0),
      target: Number(aminoTargets.methionine) || 1200,
      unit: 'mg',
      color: 'from-amber-400 to-rose-400',
      text: 'text-amber-300',
    },
    {
      label: 'Phenylalanine',
      logged: Math.round(Number(dailyNutrition.aminos?.phenylalanine) || 0),
      target: Number(aminoTargets.phenylalanine) || 1600,
      unit: 'mg',
      color: 'from-indigo-400 to-violet-300',
      text: 'text-indigo-300',
    },
    {
      label: 'Threonine',
      logged: Math.round(Number(dailyNutrition.aminos?.threonine) || 0),
      target: Number(aminoTargets.threonine) || 1400,
      unit: 'mg',
      color: 'from-teal-400 to-emerald-300',
      text: 'text-teal-300',
    },
    {
      label: 'Tryptophan',
      logged: Math.round(Number(dailyNutrition.aminos?.tryptophan) || 0),
      target: Number(aminoTargets.tryptophan) || 400,
      unit: 'mg',
      color: 'from-violet-400 to-purple-300',
      text: 'text-violet-300',
    },
    {
      label: 'Histidine',
      logged: Math.round(Number(dailyNutrition.aminos?.histidine) || 0),
      target: Number(aminoTargets.histidine) || 900,
      unit: 'mg',
      color: 'from-fuchsia-400 to-pink-300',
      text: 'text-fuchsia-300',
    },
  ];

  const renderRows = (rows) => (
    <div className="space-y-1.5">
      {rows.map((r) => {
        const pct = Math.min(100, Math.round((r.logged / Math.max(1, r.target)) * 100));
        return (
          <div key={r.label} className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-white truncate pr-2">{r.label}</span>
              <span className={`font-mono font-black shrink-0 ${r.text}`}>
                {r.logged} / {r.target} {r.unit} ({pct}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full bg-gradient-to-r ${r.color} rounded-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  // Compact Persistent Comparison Bar Chart shown at the top of EVERY opened tile
  if (!showDetailedBreakdown) {
    return (
      <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3 space-y-2 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Daily Recommended vs. Logged Intake</span>
          </span>
          <span className="text-[9px] font-bold text-slate-300 font-mono">
            Burned: {dailyActivity.caloriesBurned || 0} kcal
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {macroRows.map((m) => {
            const pct = Math.min(100, Math.round((m.logged / Math.max(1, m.target)) * 100));
            return (
              <div key={m.label} className="space-y-0.5">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-extrabold text-slate-200">{m.label}</span>
                  <span className={`font-mono font-black ${m.text}`}>
                    {m.logged}/{m.target}
                    {m.unit}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Comprehensive Macros + Micros + Detailed Amino Acids Breakdown Chart (For Nutrition Tile)
  return (
    <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3.5 space-y-3 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Recommended vs. Logged: Macros, Micros &amp; Amino Acids</span>
        </span>
        <span className="text-[9px] font-bold text-slate-300">
          Net Carbs: {dailyNutrition.netCarbs || 0}g
        </span>
      </div>

      {/* Category Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-xl border border-white/15">
        <button
          type="button"
          onClick={() => setDetailSubTab('macros')}
          className={`py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition ${
            detailSubTab === 'macros'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>Macros (6)</span>
        </button>
        <button
          type="button"
          onClick={() => setDetailSubTab('micros')}
          className={`py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition ${
            detailSubTab === 'micros'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Micros (6)</span>
        </button>
        <button
          type="button"
          onClick={() => setDetailSubTab('aminos')}
          className={`py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition ${
            detailSubTab === 'aminos'
              ? 'bg-cyan-400 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Dna className="w-3 h-3" />
          <span>Aminos (9 EAAs)</span>
        </button>
      </div>

      {detailSubTab === 'macros' && renderRows(macroRows)}
      {detailSubTab === 'micros' && renderRows(microRows)}
      {detailSubTab === 'aminos' && renderRows(aminoRows)}
    </div>
  );
}
