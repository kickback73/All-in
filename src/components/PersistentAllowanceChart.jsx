// src/components/PersistentAllowanceChart.jsx
import React, { useState, useMemo } from 'react';
import { BarChart3, Dna, Zap, Flame, Sparkles, Plus, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MICRONUTRIENT_FIELDS } from '../data/initialData';
import { resolvePeptideAminoSynergy, lookupVerifiedNutrients } from '../utils/nutrientEngine';

/**
 * Individual SVG Radial Circle / Doughnut Gauge for a single Macro metric
 */
const SingleMacroCircleGauge = ({
  label,
  logged,
  target,
  unit,
  strokeColor,
  textColor,
  subLabel,
  size = 68,
}) => {
  const pct = Math.min(100, Math.round((logged / Math.max(1, target)) * 100));
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashLen = (pct / 100) * circumference;

  return (
    <div className="rounded-xl bg-slate-950/75 border border-white/15 p-2 flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${circumference}`}
            strokeDashoffset={0}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-[11px] font-black text-white">{pct}%</span>
          <span className={`text-[8px] font-mono font-bold ${textColor} mt-0.5`}>
            {logged}
            {unit}
          </span>
        </div>
      </div>
      <div className="text-[10px] font-black text-white mt-1 truncate w-full">{label}</div>
      <div className="text-[8px] font-mono font-bold text-slate-400">
        Target: {target} {unit}
      </div>
      {subLabel && (
        <div className="text-[8px] font-extrabold text-teal-300 mt-0.5">{subLabel}</div>
      )}
    </div>
  );
};

/**
 * Multi-Segment Macro Distribution Circle / Doughnut Chart (Protein, Carbs, Fats caloric & gram split)
 */
const MacroDistributionDoughnut = ({ protein, carbs, fats, calories, targetCalories }) => {
  const protKcal = Math.max(0, Number(protein) * 4);
  const carbKcal = Math.max(0, Number(carbs) * 4);
  const fatKcal = Math.max(0, Number(fats) * 9);
  const totalMacroKcal = protKcal + carbKcal + fatKcal;
  const hasLogged = totalMacroKcal > 0;
  const denom = Math.max(1, totalMacroKcal);

  const protPct = hasLogged ? Math.round((protKcal / denom) * 100) : 40;
  const carbPct = hasLogged ? Math.round((carbKcal / denom) * 100) : 30;
  const fatPct = hasLogged ? Math.max(0, 100 - protPct - carbPct) : 30;

  const size = 94;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  const protLen = (protPct / 100) * circumference;
  const carbLen = (carbPct / 100) * circumference;
  const fatLen = (fatPct / 100) * circumference;

  return (
    <div className="rounded-xl bg-slate-950/80 border border-emerald-400/30 p-2.5 flex items-center justify-between gap-3">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${protLen} ${circumference}`}
            strokeDashoffset={0}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#06b6d4"
            strokeWidth={strokeWidth}
            strokeDasharray={`${carbLen} ${circumference}`}
            strokeDashoffset={-protLen}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${fatLen} ${circumference}`}
            strokeDashoffset={-(protLen + carbLen)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
          <span className="text-xs font-black text-white">{calories}</span>
          <span className="text-[8px] font-bold text-slate-400">/ {targetCalories} kcal</span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
          Macro Distribution Doughnut
        </div>
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Protein ({protein}g)
            </span>
            <span className="font-mono font-black text-emerald-300">{protPct}% kcal</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              Carbs ({carbs}g)
            </span>
            <span className="font-mono font-black text-cyan-300">{carbPct}% kcal</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Fats ({fats}g)
            </span>
            <span className="font-mono font-black text-amber-300">{fatPct}% kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SVG Spider / Radar Chart for 15 Expanded Vitamins & Minerals (Replaces bar lists in Micros tab)
 */
const MicronutrientSpiderRadarChart = ({ microRows }) => {
  const size = 290;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 92;
  const labelR = 120;
  const totalAxes = microRows.length;

  const getPoint = (index, fraction) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const r = maxR * Math.max(0.06, Math.min(1, fraction));
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
    };
  };

  const ringLevels = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = microRows.map((m, idx) => {
    const frac = Math.min(1, m.logged / Math.max(0.1, m.target));
    const pct = Math.min(100, Math.round((m.logged / Math.max(0.1, m.target)) * 100));
    const pt = getPoint(idx, frac);
    const axisEnd = getPoint(idx, 1.0);
    const angle = (Math.PI * 2 * idx) / totalAxes - Math.PI / 2;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    return {
      ...m,
      pct,
      pt,
      axisEnd,
      lx,
      ly,
    };
  });

  const dataPolygonPoints = dataPoints.map((d) => `${d.pt.x.toFixed(1)},${d.pt.y.toFixed(1)}`).join(' ');

  return (
    <div className="space-y-2.5">
      <div className="rounded-2xl bg-slate-950/85 border border-amber-400/30 p-2 flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-2 pt-1 text-[9px] font-bold">
          <span className="text-amber-300 uppercase font-black">
            15-Axis Vitamin &amp; Mineral Radar
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> 100% Target
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400/60 border border-amber-300 inline-block" /> Logged %
            </span>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[290px] h-auto overflow-visible"
        >
          {/* Concentric Web Polygons (25%, 50%, 75%, 100% Target Ring) */}
          {ringLevels.map((lvl) => {
            const pts = microRows
              .map((_, i) => {
                const p = getPoint(i, lvl);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              })
              .join(' ');
            const isTargetRing = lvl === 1.0;
            return (
              <polygon
                key={lvl}
                points={pts}
                fill="none"
                stroke={isTargetRing ? 'rgba(16, 185, 129, 0.55)' : 'rgba(255, 255, 255, 0.14)'}
                strokeWidth={isTargetRing ? '1.5' : '1'}
                strokeDasharray={isTargetRing ? '3 2' : undefined}
              />
            );
          })}

          {/* Radial Spokes */}
          {dataPoints.map((d) => (
            <line
              key={`spoke_${d.key}`}
              x1={cx}
              y1={cy}
              x2={d.axisEnd.x}
              y2={d.axisEnd.y}
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth="1"
            />
          ))}

          {/* Current Intake Spider Polygon */}
          <polygon
            points={dataPolygonPoints}
            fill="rgba(245, 158, 11, 0.30)"
            stroke="#fbbf24"
            strokeWidth="2"
          />

          {/* Vertex Dots & Perimeter Labels */}
          {dataPoints.map((d) => {
            const dotColor =
              d.pct >= 80 ? '#10b981' : d.pct >= 35 ? '#fbbf24' : '#38bdf8';
            return (
              <g key={`vertex_${d.key}`}>
                <circle
                  cx={d.pt.x}
                  cy={d.pt.y}
                  r="3.2"
                  fill={dotColor}
                  stroke="#020617"
                  strokeWidth="1"
                />
                <text
                  x={d.lx}
                  y={d.ly - 3}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#f8fafc"
                  fontSize="7.5"
                  fontWeight="800"
                >
                  {d.shortLabel}
                </text>
                <text
                  x={d.lx}
                  y={d.ly + 6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={dotColor}
                  fontSize="7"
                  fontWeight="900"
                >
                  {d.pct}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Compact 3-Column Vitamin & Mineral Value Chips (No linear bars) */}
      <div className="grid grid-cols-3 gap-1.5">
        {dataPoints.map((m) => (
          <div
            key={m.key}
            className="rounded-xl bg-slate-950/80 border border-white/15 px-2 py-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] font-black text-white truncate">{m.shortLabel}</span>
              <span
                className={`text-[8px] font-black px-1 rounded ${
                  m.pct >= 80
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : m.pct >= 35
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-sky-500/20 text-sky-300'
                }`}
              >
                {m.pct}%
              </span>
            </div>
            <div className="text-[9px] font-mono font-bold text-slate-300 mt-0.5 truncate">
              {m.logged}/{m.target}
              {m.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PersistentAllowanceChart({ showDetailedBreakdown = false }) {
  const {
    dailyNutrition,
    dailyHydration,
    dailyActivity,
    activePeptideName,
    peptideHistory,
    logStackToDaily,
  } = useAppContext();

  const [detailSubTab, setDetailSubTab] = useState('macros'); // 'macros' | 'micros' | 'aminos'
  const [quickLoggedFoodMsg, setQuickLoggedFoodMsg] = useState('');

  const targets = dailyNutrition.targets || {};
  const microTargets = targets.micros || {};
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

  // Resolve Active Peptide Synergy Profile for Amino Acid Prioritization & Food Suggestions
  const currentPeptide =
    activePeptideName || peptideHistory?.[0]?.peptideName || 'Retatrutide (GLP-1/GIP/GCGR)';
  const peptideSynergy = useMemo(
    () => resolvePeptideAminoSynergy(currentPeptide),
    [currentPeptide]
  );

  const macroRows = [
    {
      key: 'protein',
      label: 'Protein',
      logged: Math.round((Number(dailyNutrition.protein) || 0) * 10) / 10,
      target: Number(dailyNutrition.targetProtein) || 180,
      unit: 'g',
      strokeColor: '#10b981',
      text: 'text-emerald-300',
    },
    {
      key: 'carbs',
      label: 'Total Carbs',
      logged: Math.round((Number(dailyNutrition.carbs) || 0) * 10) / 10,
      target: Number(dailyNutrition.targetCarbs) || 140,
      unit: 'g',
      strokeColor: '#06b6d4',
      text: 'text-cyan-300',
      subLabel: `Net: ${dailyNutrition.netCarbs || 0}g`,
    },
    {
      key: 'fats',
      label: 'Total Fats',
      logged: Math.round((Number(dailyNutrition.fats) || 0) * 10) / 10,
      target: Number(dailyNutrition.targetFats) || 65,
      unit: 'g',
      strokeColor: '#f59e0b',
      text: 'text-amber-300',
    },
    {
      key: 'calories',
      label: 'Calories',
      logged: Math.round(Number(dailyNutrition.calories) || 0),
      target: Number(dailyNutrition.targetCalories) || 1900,
      unit: 'kcal',
      strokeColor: '#14b8a6',
      text: 'text-teal-300',
    },
    {
      key: 'fiber',
      label: 'Dietary Fiber',
      logged: Math.round((Number(dailyNutrition.fiber) || 0) * 10) / 10,
      target: Number(dailyNutrition.targetFiber) || 32,
      unit: 'g',
      strokeColor: '#a855f7',
      text: 'text-violet-300',
    },
    {
      key: 'hydration',
      label: 'Hydration',
      logged: Math.round(Number(dailyHydration.currentMl) || 0),
      target: Number(dailyHydration.targetMl) || 3250,
      unit: 'ml',
      strokeColor: '#38bdf8',
      text: 'text-sky-300',
    },
  ];

  // Expanded 15 Micronutrients (8 Vitamins + 7 Minerals)
  const microRows = MICRONUTRIENT_FIELDS.map((field) => ({
    key: field.key,
    label: field.label,
    shortLabel: field.shortLabel || field.label,
    logged:
      Math.round((Number(dailyNutrition.micros?.[field.key]) || 0) * 10) / 10,
    target: Number(microTargets[field.key]) || field.defaultTarget,
    unit: field.unit,
    category: field.category,
  }));

  // 9 Essential Amino Acids dynamically prioritized & sorted by Active Peptide Synergy
  const aminoRows = useMemo(() => {
    const baseAminos = [
      {
        key: 'leucine',
        label: 'Leucine (BCAA)',
        logged: Math.round(Number(dailyNutrition.aminos?.leucine) || 0),
        target: Number(aminoTargets.leucine) || 3000,
        unit: 'mg',
        color: 'from-cyan-400 to-emerald-400',
        text: 'text-cyan-300',
      },
      {
        key: 'lysine',
        label: 'Lysine',
        logged: Math.round(Number(dailyNutrition.aminos?.lysine) || 0),
        target: Number(aminoTargets.lysine) || 2400,
        unit: 'mg',
        color: 'from-emerald-400 to-teal-300',
        text: 'text-emerald-300',
      },
      {
        key: 'threonine',
        label: 'Threonine',
        logged: Math.round(Number(dailyNutrition.aminos?.threonine) || 0),
        target: Number(aminoTargets.threonine) || 1400,
        unit: 'mg',
        color: 'from-teal-400 to-emerald-300',
        text: 'text-teal-300',
      },
      {
        key: 'valine',
        label: 'Valine (BCAA)',
        logged: Math.round(Number(dailyNutrition.aminos?.valine) || 0),
        target: Number(aminoTargets.valine) || 1800,
        unit: 'mg',
        color: 'from-blue-400 to-sky-300',
        text: 'text-blue-300',
      },
      {
        key: 'isoleucine',
        label: 'Isoleucine (BCAA)',
        logged: Math.round(Number(dailyNutrition.aminos?.isoleucine) || 0),
        target: Number(aminoTargets.isoleucine) || 1500,
        unit: 'mg',
        color: 'from-sky-400 to-cyan-300',
        text: 'text-sky-300',
      },
      {
        key: 'phenylalanine',
        label: 'Phenylalanine',
        logged: Math.round(Number(dailyNutrition.aminos?.phenylalanine) || 0),
        target: Number(aminoTargets.phenylalanine) || 1600,
        unit: 'mg',
        color: 'from-indigo-400 to-violet-300',
        text: 'text-indigo-300',
      },
      {
        key: 'histidine',
        label: 'Histidine',
        logged: Math.round(Number(dailyNutrition.aminos?.histidine) || 0),
        target: Number(aminoTargets.histidine) || 900,
        unit: 'mg',
        color: 'from-fuchsia-400 to-pink-300',
        text: 'text-fuchsia-300',
      },
      {
        key: 'tryptophan',
        label: 'Tryptophan',
        logged: Math.round(Number(dailyNutrition.aminos?.tryptophan) || 0),
        target: Number(aminoTargets.tryptophan) || 400,
        unit: 'mg',
        color: 'from-violet-400 to-purple-300',
        text: 'text-violet-300',
      },
      {
        key: 'methionine',
        label: 'Methionine (NHL Ceiling Guard)',
        logged: Math.round(Number(dailyNutrition.aminos?.methionine) || 0),
        target: Number(aminoTargets.methionine) || 1200,
        unit: 'mg',
        color: 'from-amber-400 to-rose-400',
        text: 'text-amber-300',
        isCeilingGuard: true,
      },
    ];

    const priorityMap = peptideSynergy.prioritizedAminos || {};

    return baseAminos
      .map((a) => ({
        ...a,
        synergy: priorityMap[a.key] || null,
      }))
      .sort((a, b) => {
        const rankA = a.synergy ? a.synergy.rank : 99;
        const rankB = b.synergy ? b.synergy.rank : 99;
        return rankA - rankB;
      });
  }, [dailyNutrition.aminos, aminoTargets, peptideSynergy]);

  const handleQuickLogRecommendedFood = async (foodRec) => {
    const verified = await lookupVerifiedNutrients(foodRec.query, foodRec.serving);
    if (verified) {
      logStackToDaily(verified, foodRec.name);
      setQuickLoggedFoodMsg(`Added ${foodRec.name} to Daily Totals!`);
      setTimeout(() => setQuickLoggedFoodMsg(''), 2200);
    }
  };

  // Compact Persistent Comparison Chart shown at the top of non-Nutrition tiles
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

        <div className="grid grid-cols-3 gap-1.5">
          {macroRows.slice(0, 6).map((m) => (
            <SingleMacroCircleGauge
              key={m.key}
              label={m.label}
              logged={m.logged}
              target={m.target}
              unit={m.unit}
              strokeColor={m.strokeColor}
              textColor={m.text}
              size={52}
            />
          ))}
        </div>
      </div>
    );
  }

  // Comprehensive Tabbed Breakdown Chart (For Nutrition Tile):
  // - Macros: Circle / Doughnut Charts
  // - Micros: 15-Vitamin/Mineral Spider / Radar Chart
  // - Aminos: Peptide-Driven Prioritized Amino Acids & Synergistic Food Suggestions
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
          <span>Macros (Circles)</span>
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
          <span>Micros ({microRows.length})</span>
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
          <span>Aminos (Synergy)</span>
        </button>
      </div>

      {/* TAB 1: MACRONUTRIENTS CIRCLE / DOUGHNUT CHARTS */}
      {detailSubTab === 'macros' && (
        <div className="space-y-2.5">
          <MacroDistributionDoughnut
            protein={dailyNutrition.protein || 0}
            carbs={dailyNutrition.carbs || 0}
            fats={dailyNutrition.fats || 0}
            calories={dailyNutrition.calories || 0}
            targetCalories={dailyNutrition.targetCalories || 1900}
          />
          <div className="grid grid-cols-3 gap-2">
            {macroRows.map((m) => (
              <SingleMacroCircleGauge
                key={m.key}
                label={m.label}
                logged={m.logged}
                target={m.target}
                unit={m.unit}
                strokeColor={m.strokeColor}
                textColor={m.text}
                subLabel={m.subLabel}
                size={68}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EXPANDED MICRONUTRIENTS SPIDER / RADAR CHART */}
      {detailSubTab === 'micros' && <MicronutrientSpiderRadarChart microRows={microRows} />}

      {/* TAB 3: PEPTIDE-DRIVEN AMINO ACID PRIORITIZATION & FOOD RECOMMENDATIONS */}
      {detailSubTab === 'aminos' && (
        <div className="space-y-3">
          {/* Active Peptide Synergy Banner */}
          <div className="rounded-xl bg-violet-950/60 border border-violet-400/40 p-2.5 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-violet-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Active Peptide Amino Optimization</span>
              </span>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                NHL Safe
              </span>
            </div>
            <div className="text-[11px] font-black text-white">
              {peptideSynergy.peptideLabel}
            </div>
            <p className="text-[10px] text-slate-300 leading-snug">
              {peptideSynergy.protocolObjective}
            </p>
          </div>

          {quickLoggedFoodMsg && (
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/50 px-2.5 py-1.5 text-[10px] font-black text-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{quickLoggedFoodMsg}</span>
            </div>
          )}

          {/* Direct Food Recommendations to Supply Prioritized Aminos */}
          <div className="rounded-xl bg-slate-950/80 border border-emerald-400/30 p-2.5 space-y-2">
            <div className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
              ★ Top Food Sources for Prioritized Peptide Aminos (1-Tap Log)
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {(peptideSynergy.recommendedFoods || []).map((food) => (
                <div
                  key={food.name}
                  className="rounded-lg bg-slate-900/90 border border-white/10 px-2.5 py-1.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-white truncate">
                      {food.name}
                    </div>
                    <div className="text-[9px] font-bold text-cyan-300 truncate">
                      {food.highlight}
                    </div>
                    <div className="text-[8px] text-slate-400 truncate">{food.benefit}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogRecommendedFood(food)}
                    className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shrink-0"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Log</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Prioritized & Standard Essential Amino Acids Breakdown */}
          <div className="space-y-1.5">
            {aminoRows.map((r) => {
              const pct = Math.min(100, Math.round((r.logged / Math.max(1, r.target)) * 100));
              const isPrioritized = Boolean(r.synergy);
              return (
                <div
                  key={r.key}
                  className={`rounded-xl p-2 space-y-1 border transition ${
                    isPrioritized
                      ? 'bg-cyan-950/35 border-cyan-400/45 shadow-xs'
                      : 'bg-slate-950/60 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-black text-white truncate">{r.label}</span>
                      {isPrioritized && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-400 text-slate-950 shrink-0">
                          ★ {r.synergy.badge}
                        </span>
                      )}
                    </div>
                    <span className={`font-mono font-black shrink-0 ${r.text}`}>
                      {r.logged} / {r.target} {r.unit} ({pct}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-950/90 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full bg-gradient-to-r ${r.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {isPrioritized && (
                    <div className="text-[9px] leading-snug text-slate-300 pt-0.5">
                      <span className="text-cyan-300 font-bold">Synergy:</span>{' '}
                      {r.synergy.synergyReason}{' '}
                      <span className="text-emerald-300 font-bold">
                        Best Foods: {r.synergy.foods}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
