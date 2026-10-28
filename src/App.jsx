// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from './context/AppContext';
import {
  selectUniqueTileBackgrounds,
  AVAILABLE_BACKGROUND_IMAGES,
} from './utils/backgroundEngine';
import Header from './components/Header';
import StackManager from './components/StackManager';
import PeptideCalculator from './components/PeptideCalculator';
import MtorMonitor, { calculate24HourMtorTimeline } from './components/MtorMonitor';
import UserProfileModal from './components/UserProfileModal';
import QuickLogModal from './components/QuickLogModal';
import {
  Droplets,
  Plus,
  Pencil,
  Sparkles,
  Utensils,
  Syringe,
  Activity,
  X,
} from 'lucide-react';
import { MICRONUTRIENT_FIELDS } from './data/initialData';

export default function App() {
  const {
    todayLog,
    todayTotals,
    updateTodayDirectMetrics,
    userProfile,
    updateUserProfile,
    hydrationGoalMl,
    setHydrationGoalMl,
    morningStacks,
    setMorningStacks,
    saveOrUpdateStack,
    peptideHistory,
    universalLogs,
    addLogRecord,
    updateLogRecord,
    deleteLogRecord,
    incrementWater,
    logMorningStack,
  } = useApp();

  // 6 Non-Duplicating Randomized Tile Backgrounds from /images/
  const [tileBackgrounds, setTileBackgrounds] = useState(() =>
    selectUniqueTileBackgrounds(6, AVAILABLE_BACKGROUND_IMAGES)
  );

  const handleShuffleTileBackgrounds = useCallback(() => {
    setTileBackgrounds(selectUniqueTileBackgrounds(6, AVAILABLE_BACKGROUND_IMAGES));
  }, []);

  useEffect(() => {
    setTileBackgrounds(selectUniqueTileBackgrounds(6, AVAILABLE_BACKGROUND_IMAGES));
  }, []);

  // Active Expanded Tile Modal ('HYDRATION' | 'NUTRITION' | 'PEPTIDES' | 'MTOR' | 'ACTIVITY' | null)
  const [expandedTile, setExpandedTile] = useState(null);
  const [isHistoricalLogOpen, setIsHistoricalLogOpen] = useState(false);
  const [isStackBuilderOpen, setIsStackBuilderOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogTab, setQuickLogTab] = useState('WATER');

  // Direct Inline Metric Edit State inside Expanded Tile Modal
  const [directEditForm, setDirectEditForm] = useState({
    waterMl: 0,
    waterGoalMl: 2500,
    steps: 0,
    activeMinutes: 0,
    activeCalories: 0,
    dailyCaloricTarget: 1900,
    dailyProteinTarget: 180,
  });

  const openTileDetail = (tileKey) => {
    setDirectEditForm({
      waterMl: todayTotals.waterMl || 0,
      waterGoalMl: hydrationGoalMl || 2500,
      steps: todayTotals.steps || 0,
      activeMinutes: todayTotals.activeMinutes || 0,
      activeCalories: todayTotals.activeCalories || 0,
      dailyCaloricTarget: userProfile.dailyCaloricTarget || 1900,
      dailyProteinTarget: userProfile.dailyProteinTarget || 180,
    });
    setExpandedTile(tileKey);
  };

  // Calculations for compact tile charts
  const currentWater = todayTotals.waterMl || 0;
  const targetWater = hydrationGoalMl || 2500;
  const hydrationPct = Math.min(100, Math.round((currentWater / targetWater) * 100));

  const calTarget = userProfile.dailyCaloricTarget || 1900;
  const protTarget = userProfile.dailyProteinTarget || 180;
  const carbTarget = userProfile.dailyCarbTarget || 145;
  const fatTarget = userProfile.dailyFatTarget || 65;

  const calPct = Math.min(100, Math.round((todayTotals.calories / calTarget) * 100));
  const protPct = Math.min(100, Math.round((todayTotals.protein / protTarget) * 100));
  const carbPct = Math.min(100, Math.round((todayTotals.carbs / carbTarget) * 100));
  const fatPct = Math.min(100, Math.round((todayTotals.fat / fatTarget) * 100));

  const stepsTarget = userProfile.dailyStepsTarget || 10000;
  const minsTarget = userProfile.dailyActiveMinutesTarget || 45;
  const stepsPct = Math.min(100, Math.round((todayTotals.steps / stepsTarget) * 100));
  const minsPct = Math.min(100, Math.round((todayTotals.activeMinutes / minsTarget) * 100));

  const currentHour = new Date().getHours();
  const mtorTimeline = useMemo(
    () => calculate24HourMtorTimeline(todayLog.meals, morningStacks, currentHour),
    [todayLog.meals, morningStacks, currentHour]
  );
  const currentMtor = mtorTimeline[currentHour]?.actual ?? 14;
  const leucineG = ((todayTotals.aminos?.leucine || 0) / 1000).toFixed(1);
  const methionineG = ((todayTotals.aminos?.methionine || 0) / 1000).toFixed(2);

  const primaryStack = morningStacks[0] || null;
  const latestPeptide = peptideHistory[0] || {
    title: 'Retatrutide',
    doseMg: 3,
    units: 60,
    vialMg: 10,
    bacWaterMl: 2,
  };

  const handleOpenQuickLog = () => {
    setQuickLogTab('WATER');
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#E8F0F8] text-slate-900 font-sans antialiased flex flex-col items-center justify-start">
      {/* Google Pixel 8 Viewport Container (412px-432px width, fits all 6 tiles without scrolling) */}
      <div className="w-full max-w-[432px] bg-[#F4F8FB] min-h-screen flex flex-col justify-between relative sm:rounded-[36px] sm:border-[5px] sm:border-slate-800 sm:shadow-2xl sm:my-1 overflow-hidden">
        {/* Compact Header Bar */}
        <Header
          onOpenHistory={() => setIsHistoricalLogOpen(true)}
          onShuffleBackgrounds={handleShuffleTileBackgrounds}
        />

        {/* 6-TILE COMPACT BENTO GRID (2 Columns x 3 Rows — Visible Without Scrolling) */}
        <main className="px-2.5 py-2 flex-1 grid grid-cols-2 grid-rows-3 gap-2.5">
          {/* =====================================================================
              TILE 1: NUTRITION (MACROS & MICROS)
             ===================================================================== */}
          <article
            onClick={() => openTileDetail('NUTRITION')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition min-h-[148px]"
          >
            {tileBackgrounds[0] && (
              <img
                src={tileBackgrounds[0]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none select-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-sky-50/40 pointer-events-none" />

            {/* Top Title & Edit Icon */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-sky-800 bg-white/80 px-1.5 py-0.5 rounded-full">
                  1. Nutrition
                </span>
                <h2 className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                  {todayTotals.calories} <span className="text-[10px] font-bold text-slate-600">/ {calTarget} kcal</span>
                </h2>
              </div>
              <span className="p-1 rounded-full bg-white/80 text-slate-700 shadow-2xs">
                <Pencil className="w-3 h-3" />
              </span>
            </div>

            {/* Mini 3-Bar Macro Chart */}
            <div className="relative z-10 grid grid-cols-3 gap-1.5 items-end pt-1">
              {[
                { label: 'Prot', val: `${todayTotals.protein}g`, pct: protPct, color: 'bg-sky-600' },
                { label: 'Carb', val: `${todayTotals.carbs}g`, pct: carbPct, color: 'bg-teal-500' },
                { label: 'Fat', val: `${todayTotals.fat}g`, pct: fatPct, color: 'bg-indigo-500' },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-white/80 backdrop-blur-[1px] rounded-xl p-1.5 border border-slate-200/60 flex flex-col items-center"
                >
                  <div className="w-full h-10 bg-slate-200/70 rounded-lg flex items-end p-0.5 overflow-hidden">
                    <div
                      className={`w-full rounded-md ${m.color} transition-all duration-500`}
                      style={{ height: `${Math.max(12, m.pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-900 mt-1 leading-none">{m.val}</span>
                  <span className="text-[8px] font-bold text-slate-500">{m.label}</span>
                </div>
              ))}
            </div>
          </article>

          {/* =====================================================================
              TILE 2: PEPTIDES & AUTO BAC CALCULATOR
             ===================================================================== */}
          <article
            onClick={() => openTileDetail('PEPTIDES')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition min-h-[148px]"
          >
            {tileBackgrounds[1] && (
              <img
                src={tileBackgrounds[1]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none select-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-teal-50/40 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-800 bg-white/80 px-1.5 py-0.5 rounded-full">
                  2. Peptides & Calc
                </span>
                <h2 className="text-sm font-black text-slate-900 mt-0.5 leading-tight truncate max-w-[130px]">
                  {latestPeptide.title || latestPeptide.name || 'Retatrutide'}
                </h2>
              </div>
              <span className="p-1 rounded-full bg-white/80 text-slate-700 shadow-2xs">
                <Syringe className="w-3 h-3 text-teal-700" />
              </span>
            </div>

            {/* Syringe Barrel Dose Chart */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-2 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black">
                <span className="text-teal-900">
                  {latestPeptide.doseMg ? `${latestPeptide.doseMg} mg` : `${latestPeptide.doseMcg || 3000} mcg`}
                </span>
                <span className="text-sky-700">{latestPeptide.units || 60} IU Pull</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-sky-600 rounded-full"
                  style={{ width: `${Math.min(100, Number(latestPeptide.units) || 60)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-600">
                <span>Tap for Auto BAC Calc</span>
                <span className="text-emerald-700">NHL Guard ON</span>
              </div>
            </div>
          </article>

          {/* =====================================================================
              TILE 3: AMINO PROFILES & 24h mTOR MONITOR
             ===================================================================== */}
          <article
            onClick={() => openTileDetail('MTOR')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition min-h-[148px]"
          >
            {tileBackgrounds[2] && (
              <img
                src={tileBackgrounds[2]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none select-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-indigo-50/40 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-800 bg-white/80 px-1.5 py-0.5 rounded-full">
                  3. Amino & mTOR
                </span>
                <h2 className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                  mTOR {currentMtor}% <span className="text-[10px] font-bold text-slate-600">• Leu {leucineG}g</span>
                </h2>
              </div>
              <span className="p-1 rounded-full bg-white/80 text-slate-700 shadow-2xs">
                <Pencil className="w-3 h-3" />
              </span>
            </div>

            {/* Compact 24h mTOR Area Chart */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-1.5 border border-slate-200/70">
              <svg viewBox="0 0 160 46" className="w-full h-11 overflow-visible">
                <line x1="0" y1="18" x2="160" y2="18" stroke="#f59e0b" strokeDasharray="2 2" strokeWidth="1" />
                {(() => {
                  const step = 160 / 23;
                  const pts = mtorTimeline.map((pt, i) => ({
                    x: i * step,
                    y: 42 - ((pt.actual ?? pt.projected) / 100) * 36,
                  }));
                  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const area = `${line} L 160 42 L 0 42 Z`;
                  return (
                    <>
                      <path d={area} fill="rgba(14, 165, 233, 0.25)" />
                      <path d={line} fill="none" stroke="#0284c7" strokeWidth="2" />
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between text-[9px] font-bold text-slate-600 px-1">
                <span>Met: {methionineG}g / 1.8g</span>
                <span className="text-emerald-700">NHL Safe</span>
              </div>
            </div>
          </article>

          {/* =====================================================================
              TILE 4: DAILY ACTIVITY & TRAINING GOALS
             ===================================================================== */}
          <article
            onClick={() => openTileDetail('ACTIVITY')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition min-h-[148px]"
          >
            {tileBackgrounds[3] && (
              <img
                src={tileBackgrounds[3]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none select-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-emerald-50/40 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-white/80 px-1.5 py-0.5 rounded-full">
                  4. Activity
                </span>
                <h2 className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                  {todayTotals.steps.toLocaleString()} <span className="text-[10px] font-bold text-slate-600">steps</span>
                </h2>
              </div>
              <span className="p-1 rounded-full bg-white/80 text-slate-700 shadow-2xs">
                <Pencil className="w-3 h-3" />
              </span>
            </div>

            {/* Dual Circular Rings Chart */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-2 border border-slate-200/70 flex items-center justify-around">
              {[
                { label: 'Steps', pct: stepsPct, stroke: 'stroke-emerald-500' },
                { label: `${todayTotals.activeMinutes}m`, pct: minsPct, stroke: 'stroke-sky-500' },
              ].map((r, idx) => {
                const rad = 18;
                const circ = 2 * Math.PI * rad;
                const off = circ - (r.pct / 100) * circ;
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="relative w-11 h-11 flex items-center justify-center">
                      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r={rad} className="stroke-slate-200" strokeWidth="4.5" fill="transparent" />
                        <circle
                          cx="22"
                          cy="22"
                          r={rad}
                          className={r.stroke}
                          strokeWidth="4.5"
                          strokeDasharray={circ}
                          strokeDashoffset={off}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-[9px] font-black text-slate-900">{r.pct}%</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-700">{r.label}</span>
                  </div>
                );
              })}
            </div>
          </article>

          {/* =====================================================================
              TILE 5: HYDRATION (RING CHART + QUICK TAP)
             ===================================================================== */}
          <article
            onClick={() => openTileDetail('HYDRATION')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition min-h-[148px]"
          >
            {tileBackgrounds[4] && (
              <img
                src={tileBackgrounds[4]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none select-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-cyan-50/40 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-sky-800 bg-white/80 px-1.5 py-0.5 rounded-full">
                  5. Hydration
                </span>
                <h2 className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                  {currentWater} <span className="text-[10px] font-bold text-slate-600">/ {targetWater}ml</span>
                </h2>
              </div>
              <span className="p-1 rounded-full bg-white/80 text-slate-700 shadow-2xs">
                <Pencil className="w-3 h-3" />
              </span>
            </div>

            {/* Ring Chart + Instant Tap Buttons */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-1.5 border border-slate-200/70 flex items-center justify-between gap-1.5">
              <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                {(() => {
                  const rad = 18;
                  const circ = 2 * Math.PI * rad;
                  const off = circ - (hydrationPct / 100) * circ;
                  return (
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r={rad} className="stroke-slate-200" strokeWidth="4.5" fill="transparent" />
                      <circle
                        cx="22"
                        cy="22"
                        r={rad}
                        className="stroke-sky-500"
                        strokeWidth="4.5"
                        strokeDasharray={circ}
                        strokeDashoffset={off}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                  );
                })()}
                <span className="absolute text-[9px] font-black text-slate-900">{hydrationPct}%</span>
              </div>

              <div className="grid grid-cols-2 gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                {[250, 750].map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => incrementWater(ml)}
                    className="py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-[10px] font-black cursor-pointer"
                  >
                    +{ml}
                  </button>
                ))}
              </div>
            </div>
          </article>

          {/* =====================================================================
              TILE 6: DAN'S MORNING STACK & STACK BUILDER
             ===================================================================== */}
          <article
            onClick={() => setIsStackBuilderOpen(true)}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition min-h-[148px]"
          >
            {tileBackgrounds[5] && (
              <img
                src={tileBackgrounds[5]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none select-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-teal-50/40 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div className="min-w-0 pr-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-800 bg-white/80 px-1.5 py-0.5 rounded-full">
                  6. Morning Stack
                </span>
                <h2 className="text-xs font-black text-slate-900 mt-0.5 truncate">
                  {primaryStack ? primaryStack.name.split(' (')[0] : 'Build Stack'}
                </h2>
              </div>
              <span className="p-1 rounded-full bg-white/80 text-slate-700 shadow-2xs shrink-0">
                <Sparkles className="w-3 h-3 text-teal-600" />
              </span>
            </div>

            {/* Stack Nutrient Mini Chart & 1-Tap Log */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-2 border border-slate-200/70 space-y-1.5">
              {primaryStack && (
                <div className="flex items-center justify-between text-[9px] font-black text-slate-700">
                  <span>{primaryStack.totals?.protein || 12.6}g Prot</span>
                  <span>{primaryStack.totals?.waterMl || 750}ml H2O</span>
                  <span>{primaryStack.totals?.micros?.sodium || 465}mg Na</span>
                </div>
              )}
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {primaryStack && (
                  <button
                    type="button"
                    onClick={() => logMorningStack(primaryStack)}
                    className="flex-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-[10px] font-black cursor-pointer"
                  >
                    1-Tap Log Stack
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsStackBuilderOpen(true)}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black cursor-pointer"
                >
                  Build/Edit
                </button>
              </div>
            </div>
          </article>
        </main>

        {/* Bottom Bar with Persistent Quick-Log FAB (z-50) */}
        <footer className="px-3 py-2 bg-white/90 border-t border-slate-200/80 flex items-center justify-between z-40">
          <button
            type="button"
            onClick={() => setIsHistoricalLogOpen(true)}
            className="text-[11px] font-extrabold text-slate-700 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-sky-600" />
            <span>{userProfile.weightLbs || 229} lbs &rarr; {userProfile.targetWeightLbs || 200} lbs (Edit All)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenQuickLog}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-xs shadow-lg cursor-pointer z-50"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>Quick Log</span>
          </button>
        </footer>
      </div>

      {/* EXPANDED TILE DETAIL & INLINE EDITOR MODAL */}
      {expandedTile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden text-slate-900 animate-fade-in">
            <div className="px-4 py-3 bg-[#F4F8FB] border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                {expandedTile === 'NUTRITION' && 'Tile 1: Nutrition & Direct Editor'}
                {expandedTile === 'PEPTIDES' && 'Tile 2: Peptide & Auto BAC Water Calculator'}
                {expandedTile === 'MTOR' && 'Tile 3: 24h mTOR & 9-EAA Spectrum'}
                {expandedTile === 'ACTIVITY' && 'Tile 4: Training & Activity Editor'}
                {expandedTile === 'HYDRATION' && 'Tile 5: Hydration & Target Editor'}
              </h3>
              <button
                type="button"
                onClick={() => setExpandedTile(null)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {expandedTile === 'PEPTIDES' && (
                <PeptideCalculator
                  onQuickLogDose={({ name, doseMg, doseMcg, vialMg, bacWaterMl, units, site }) => {
                    addLogRecord({
                      category: 'PEPTIDE',
                      title: name,
                      name,
                      doseMg,
                      doseMcg,
                      vialMg,
                      bacWaterMl,
                      units,
                      site,
                      summary: `${doseMg ? `${doseMg} mg` : `${doseMcg} mcg`} (${units} IU from ${vialMg}mg/${bacWaterMl}mL) • ${site}`,
                    });
                    setExpandedTile(null);
                  }}
                />
              )}

              {expandedTile === 'MTOR' && (
                <MtorMonitor
                  aminoTotals={todayTotals.aminos}
                  todayMeals={todayLog.meals}
                  plannedStacks={morningStacks}
                />
              )}

              {expandedTile === 'HYDRATION' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateTodayDirectMetrics({ waterMl: Number(directEditForm.waterMl) || 0 });
                    setHydrationGoalMl(Number(directEditForm.waterGoalMl) || 2500);
                    setExpandedTile(null);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Today&apos;s Water Logged (ml)
                      </label>
                      <input
                        type="number"
                        value={directEditForm.waterMl}
                        onChange={(e) =>
                          setDirectEditForm((f) => ({ ...f, waterMl: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Daily Water Goal (ml)
                      </label>
                      <input
                        type="number"
                        value={directEditForm.waterGoalMl}
                        onChange={(e) =>
                          setDirectEditForm((f) => ({ ...f, waterGoalMl: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-black"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[250, 500, 750].map((ml) => (
                      <button
                        key={ml}
                        type="button"
                        onClick={() => {
                          incrementWater(ml);
                          setDirectEditForm((f) => ({ ...f, waterMl: Number(f.waterMl) + ml }));
                        }}
                        className="py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-extrabold"
                      >
                        +{ml} ml
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-2xl bg-sky-600 text-white text-xs font-extrabold"
                  >
                    Save Hydration Changes
                  </button>
                </form>
              )}

              {expandedTile === 'NUTRITION' && (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateUserProfile({
                        dailyCaloricTarget: Number(directEditForm.dailyCaloricTarget) || 1900,
                        dailyProteinTarget: Number(directEditForm.dailyProteinTarget) || 180,
                      });
                      setExpandedTile(null);
                    }}
                    className="grid grid-cols-2 gap-2.5 bg-[#F4F8FB] p-3 rounded-2xl border border-slate-200"
                  >
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-600">
                        Calorie Goal (kcal)
                      </label>
                      <input
                        type="number"
                        value={directEditForm.dailyCaloricTarget}
                        onChange={(e) =>
                          setDirectEditForm((f) => ({ ...f, dailyCaloricTarget: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-600">
                        Protein Goal (g)
                      </label>
                      <input
                        type="number"
                        value={directEditForm.dailyProteinTarget}
                        onChange={(e) =>
                          setDirectEditForm((f) => ({ ...f, dailyProteinTarget: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-black"
                      />
                    </div>
                    <button
                      type="submit"
                      className="col-span-2 py-2 rounded-xl bg-sky-600 text-white text-xs font-extrabold"
                    >
                      Save Nutrition Targets
                    </button>
                  </form>

                  {/* Micros Breakdown */}
                  <div className="grid grid-cols-3 gap-2">
                    {MICRONUTRIENT_FIELDS.map((m) => (
                      <div key={m.key} className="rounded-xl border border-slate-200 p-2 text-center">
                        <div className="text-[10px] font-bold text-slate-500">{m.label}</div>
                        <div className="text-xs font-black text-slate-900">
                          {todayTotals.micros[m.key] || 0} {m.unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setExpandedTile(null);
                      setQuickLogTab('FOOD');
                      setIsQuickLogOpen(true);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-teal-600 text-white text-xs font-extrabold"
                  >
                    + Log Meal or Auto-Fill Food
                  </button>
                </div>
              )}

              {expandedTile === 'ACTIVITY' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateTodayDirectMetrics({
                      steps: Number(directEditForm.steps) || 0,
                      activeMinutes: Number(directEditForm.activeMinutes) || 0,
                      activeCalories: Number(directEditForm.activeCalories) || 0,
                    });
                    setExpandedTile(null);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-600">
                        Steps Today
                      </label>
                      <input
                        type="number"
                        value={directEditForm.steps}
                        onChange={(e) =>
                          setDirectEditForm((f) => ({ ...f, steps: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-600">
                        Active Mins
                      </label>
                      <input
                        type="number"
                        value={directEditForm.activeMinutes}
                        onChange={(e) =>
                          setDirectEditForm((f) => ({ ...f, activeMinutes: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-600">
                        Active kcal
                      </label>
                      <input
                        type="number"
                        value={directEditForm.activeCalories}
                        onChange={(e) =>
                          setDirectEditForm((f) => ({ ...f, activeCalories: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-black"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-extrabold"
                  >
                    Save Activity Totals
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABBED QUICK-LOG MODAL (DEFAULTS TO WATER) */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        activeTab={quickLogTab}
        onChangeTab={setQuickLogTab}
        stacks={morningStacks}
        onLogWater={(amountMl) => incrementWater(amountMl)}
        onLogFood={(foodData) => {
          if (foodData.isStack) {
            logMorningStack(foodData.stack);
          } else {
            addLogRecord({
              category: 'NUTRITION',
              title: foodData.title,
              calories: foodData.calories,
              protein: foodData.protein,
              carbs: foodData.carbs,
              fats: foodData.fats,
              leucineMg: foodData.leucineMg,
              aminos: {
                leucine: foodData.leucineMg || 0,
                methionine: foodData.methionineMg || 0,
              },
              summary: `${foodData.calories} kcal • ${foodData.protein}g P • ${foodData.carbs}g C • ${foodData.fats}g F`,
            });
          }
        }}
        onLogPeptide={({ name, doseMcg, vialMg, bacWaterMl, units, doseDisplay, site }) =>
          addLogRecord({
            category: 'PEPTIDE',
            title: name,
            name,
            doseMcg,
            vialMg,
            bacWaterMl,
            units,
            site,
            summary: `${doseDisplay} • Site: ${site}`,
          })
        }
        onLogActivity={({ activityType, durationMin, steps, caloriesBurned }) =>
          addLogRecord({
            category: 'ACTIVITY',
            title: activityType,
            durationMin,
            steps,
            caloriesBurned,
            summary: `${durationMin} mins • ${steps} steps • ${caloriesBurned} kcal`,
          })
        }
      />

      {/* STACK BUILDER MODAL (WITH VERIFIED NUTRIENT AUTO-POPULATION) */}
      <StackManager
        isOpen={isStackBuilderOpen}
        stacks={morningStacks}
        onSaveStack={saveOrUpdateStack}
        onDeleteStack={(id) => setMorningStacks((prev) => prev.filter((s) => s.id !== id))}
        onLogStack={(stack) => {
          logMorningStack(stack);
          setIsStackBuilderOpen(false);
        }}
        onClose={() => setIsStackBuilderOpen(false)}
      />

      {/* HISTORICAL LOG & FULL PROFILE/GOALS EDITOR MODAL */}
      <UserProfileModal
        isOpen={isHistoricalLogOpen}
        onClose={() => setIsHistoricalLogOpen(false)}
        logs={universalLogs}
        onUpdateLog={updateLogRecord}
        onDeleteLog={deleteLogRecord}
        userProfile={userProfile}
        onUpdateUserProfile={updateUserProfile}
        hydrationGoalMl={hydrationGoalMl}
        onUpdateHydrationGoal={setHydrationGoalMl}
      />
    </div>
  );
}
