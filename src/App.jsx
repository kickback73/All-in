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
import { lookupVerifiedNutrients } from './utils/nutrientEngine';
import {
  DEFAULT_WORKOUT_PRESETS,
  MICRONUTRIENT_FIELDS,
} from './data/initialData';
import {
  X,
  Search,
  Trash2,
} from 'lucide-react';

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

  // Active Tile Interior View ('NUTRITION' | 'PEPTIDES' | 'MTOR' | 'ACTIVITY' | 'HYDRATION' | 'STACKS' | null)
  const [activeTile, setActiveTile] = useState(null);
  const [isHistoricalLogOpen, setIsHistoricalLogOpen] = useState(false);

  // Interior Data Entry State for Nutrition Tile
  const [foodForm, setFoodForm] = useState({
    title: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    leucineMg: '',
    methionineMg: '',
    sourceLabel: '',
  });
  const [isLookingUpFood, setIsLookingUpFood] = useState(false);

  // Interior Data Entry State for Hydration Tile
  const [customWaterInput, setCustomWaterInput] = useState(500);

  // Interior Data Entry State for Activity Tile
  const [activityForm, setActivityForm] = useState({
    activityType: 'Resistance Bands (Back/V-Taper, Chest, Biceps)',
    durationMin: 40,
    steps: 1200,
    caloriesBurned: 240,
  });

  // Direct Metric & Target Editor State inside Tiles
  const [directEditForm, setDirectEditForm] = useState({
    waterMl: 0,
    waterGoalMl: 2500,
    steps: 0,
    activeMinutes: 0,
    activeCalories: 0,
    dailyStepsTarget: 10000,
    dailyActiveMinutesTarget: 45,
    dailyCaloricTarget: 1900,
    dailyProteinTarget: 180,
    dailyCarbTarget: 145,
    dailyFatTarget: 65,
  });

  const enterTile = (tileKey) => {
    setDirectEditForm({
      waterMl: todayTotals.waterMl || 0,
      waterGoalMl: hydrationGoalMl || 2500,
      steps: todayTotals.steps || 0,
      activeMinutes: todayTotals.activeMinutes || 0,
      activeCalories: todayTotals.activeCalories || 0,
      dailyStepsTarget: userProfile.dailyStepsTarget || 10000,
      dailyActiveMinutesTarget: userProfile.dailyActiveMinutesTarget || 45,
      dailyCaloricTarget: userProfile.dailyCaloricTarget || 1900,
      dailyProteinTarget: userProfile.dailyProteinTarget || 180,
      dailyCarbTarget: userProfile.dailyCarbTarget || 145,
      dailyFatTarget: userProfile.dailyFatTarget || 65,
    });
    setActiveTile(tileKey);
  };

  const handleAutoLookupFood = async () => {
    if (!foodForm.title.trim()) return;
    setIsLookingUpFood(true);
    const verified = await lookupVerifiedNutrients(foodForm.title, null);
    setIsLookingUpFood(false);
    if (verified) {
      setFoodForm((prev) => ({
        ...prev,
        calories: verified.calories,
        protein: verified.protein,
        carbs: verified.carbs,
        fats: verified.fats,
        leucineMg: verified.aminos?.leucine || 0,
        methionineMg: verified.aminos?.methionine || 0,
        sourceLabel: verified.source,
      }));
    }
  };

  // Daily Summary Calculations for the 6 Tile Charts
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

  return (
    <div className="min-h-screen bg-[#E8F0F8] text-slate-900 font-sans antialiased flex flex-col items-center justify-start">
      {/* Google Pixel 8 Viewport Container (412px-432px width, 6 Pure Display Tiles Without Scrolling) */}
      <div className="w-full max-w-[432px] bg-[#F4F8FB] h-screen max-h-[915px] flex flex-col justify-between relative sm:rounded-[36px] sm:border-[5px] sm:border-slate-800 sm:shadow-2xl sm:my-1 overflow-hidden">
        {/* Header Bar */}
        <Header
          onOpenHistory={() => setIsHistoricalLogOpen(true)}
          onShuffleBackgrounds={handleShuffleTileBackgrounds}
        />

        {/* 6-TILE PURE DISPLAY BENTO GRID (2 Columns x 3 Rows — Tap Any Tile to Enter & Log Data) */}
        <main className="px-2.5 py-2.5 flex-1 grid grid-cols-2 grid-rows-3 gap-2.5">
          {/* =====================================================================
              TILE 1: NUTRITION (MACROS & MICROS) — DISPLAY ONLY, TAP TO ENTER
             ===================================================================== */}
          <article
            onClick={() => enterTile('NUTRITION')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition select-none"
          >
            {tileBackgrounds[0] && (
              <img
                src={tileBackgrounds[0]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/50 to-sky-50/35 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-wider text-sky-800 bg-white/85 px-2 py-0.5 rounded-full">
                Nutrition
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1 leading-none">
                {todayTotals.calories}{' '}
                <span className="text-[10px] font-bold text-slate-600">/ {calTarget} kcal</span>
              </h2>
            </div>

            {/* Chart: 4-Column Daily Energy & Macro Progress Bars */}
            <div className="relative z-10 grid grid-cols-4 gap-1 items-end bg-white/80 backdrop-blur-[1px] rounded-2xl p-2 border border-slate-200/60">
              {[
                { label: 'Kcal', val: `${calPct}%`, pct: calPct, color: 'bg-slate-800' },
                { label: 'Prot', val: `${todayTotals.protein}g`, pct: protPct, color: 'bg-sky-600' },
                { label: 'Carb', val: `${todayTotals.carbs}g`, pct: carbPct, color: 'bg-teal-500' },
                { label: 'Fat', val: `${todayTotals.fat}g`, pct: fatPct, color: 'bg-indigo-500' },
              ].map((m) => (
                <div key={m.label} className="flex flex-col items-center">
                  <div className="w-full h-11 bg-slate-200/75 rounded-lg flex items-end p-0.5 overflow-hidden">
                    <div
                      className={`w-full rounded-sm ${m.color} transition-all duration-500`}
                      style={{ height: `${Math.max(12, m.pct)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-slate-900 mt-1 leading-none">
                    {m.val}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500">{m.label}</span>
                </div>
              ))}
            </div>
          </article>

          {/* =====================================================================
              TILE 2: PEPTIDES & RECONSTITUTION — DISPLAY ONLY, TAP TO ENTER
             ===================================================================== */}
          <article
            onClick={() => enterTile('PEPTIDES')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition select-none"
          >
            {tileBackgrounds[1] && (
              <img
                src={tileBackgrounds[1]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/50 to-teal-50/35 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-wider text-teal-800 bg-white/85 px-2 py-0.5 rounded-full">
                Peptides
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1 leading-none truncate">
                {latestPeptide.title || latestPeptide.name || 'Retatrutide'}
              </h2>
            </div>

            {/* Chart: U-100 Syringe Scale & Concentration Gauge */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-2.5 border border-slate-200/60 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black">
                <span className="text-teal-900">
                  {latestPeptide.doseMg
                    ? `${latestPeptide.doseMg} mg`
                    : `${latestPeptide.doseMcg || 3000} mcg`}
                </span>
                <span className="text-sky-700">{latestPeptide.units || 60} IU</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-sky-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Number(latestPeptide.units) || 60)}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-slate-500">
                <span>0 IU</span>
                <span>50 IU</span>
                <span>100 IU</span>
              </div>
            </div>
          </article>

          {/* =====================================================================
              TILE 3: AMINO PROFILES & 24h mTOR — DISPLAY ONLY, TAP TO ENTER
             ===================================================================== */}
          <article
            onClick={() => enterTile('MTOR')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition select-none"
          >
            {tileBackgrounds[2] && (
              <img
                src={tileBackgrounds[2]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/50 to-indigo-50/35 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-800 bg-white/85 px-2 py-0.5 rounded-full">
                Amino & mTOR
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1 leading-none">
                mTOR {currentMtor}%{' '}
                <span className="text-[10px] font-bold text-slate-600">• Leu {leucineG}g</span>
              </h2>
            </div>

            {/* Chart: 24-Hour mTOR Timeline Area Sparkline */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-2 border border-slate-200/60">
              <svg viewBox="0 0 160 48" className="w-full h-12 overflow-visible">
                <line
                  x1="0"
                  y1="18"
                  x2="160"
                  y2="18"
                  stroke="#f59e0b"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                {(() => {
                  const step = 160 / 23;
                  const pts = mtorTimeline.map((pt, i) => ({
                    x: i * step,
                    y: 44 - ((pt.actual ?? pt.projected) / 100) * 38,
                  }));
                  const line = pts
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                    .join(' ');
                  const area = `${line} L 160 44 L 0 44 Z`;
                  return (
                    <>
                      <path d={area} fill="rgba(14, 165, 233, 0.25)" />
                      <path d={line} fill="none" stroke="#0284c7" strokeWidth="2" />
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between text-[8.5px] font-bold text-slate-600">
                <span>Met: {methionineG}g / 1.8g</span>
                <span className="text-emerald-700">NHL Guard</span>
              </div>
            </div>
          </article>

          {/* =====================================================================
              TILE 4: DAILY ACTIVITY & TRAINING — DISPLAY ONLY, TAP TO ENTER
             ===================================================================== */}
          <article
            onClick={() => enterTile('ACTIVITY')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition select-none"
          >
            {tileBackgrounds[3] && (
              <img
                src={tileBackgrounds[3]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/50 to-emerald-50/35 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-white/85 px-2 py-0.5 rounded-full">
                Activity
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1 leading-none">
                {todayTotals.steps.toLocaleString()}{' '}
                <span className="text-[10px] font-bold text-slate-600">steps</span>
              </h2>
            </div>

            {/* Chart: Dual Google Health Activity Rings */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-2 border border-slate-200/60 flex items-center justify-around">
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
                        <circle
                          cx="22"
                          cy="22"
                          r={rad}
                          className="stroke-slate-200"
                          strokeWidth="4.5"
                          fill="transparent"
                        />
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
                      <span className="absolute text-[9px] font-black text-slate-900">
                        {r.pct}%
                      </span>
                    </div>
                    <span className="text-[9.5px] font-extrabold text-slate-700">{r.label}</span>
                  </div>
                );
              })}
            </div>
          </article>

          {/* =====================================================================
              TILE 5: HYDRATION — DISPLAY ONLY, TAP TO ENTER
             ===================================================================== */}
          <article
            onClick={() => enterTile('HYDRATION')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition select-none"
          >
            {tileBackgrounds[4] && (
              <img
                src={tileBackgrounds[4]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/50 to-cyan-50/35 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-wider text-sky-800 bg-white/85 px-2 py-0.5 rounded-full">
                Hydration
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1 leading-none">
                {currentWater}{' '}
                <span className="text-[10px] font-bold text-slate-600">/ {targetWater} ml</span>
              </h2>
            </div>

            {/* Chart: Circular Hydration Ring & Remaining Readout */}
            <div className="relative z-10 bg-white/80 backdrop-blur-[1px] rounded-2xl p-2 border border-slate-200/60 flex items-center justify-between">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                {(() => {
                  const rad = 20;
                  const circ = 2 * Math.PI * rad;
                  const off = circ - (hydrationPct / 100) * circ;
                  return (
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r={rad}
                        className="stroke-slate-200"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r={rad}
                        className="stroke-sky-500 transition-all duration-500"
                        strokeWidth="5"
                        strokeDasharray={circ}
                        strokeDashoffset={off}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                  );
                })()}
                <span className="absolute text-[9.5px] font-black text-slate-900">
                  {hydrationPct}%
                </span>
              </div>
              <div className="text-right pr-1">
                <div className="text-xs font-black text-sky-800">
                  {Math.max(0, targetWater - currentWater)} ml
                </div>
                <div className="text-[9px] font-bold text-slate-500">Remaining Today</div>
              </div>
            </div>
          </article>

          {/* =====================================================================
              TILE 6: MORNING STACK — DISPLAY ONLY, TAP TO ENTER
             ===================================================================== */}
          <article
            onClick={() => enterTile('STACKS')}
            className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-3 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition select-none"
          >
            {tileBackgrounds[5] && (
              <img
                src={tileBackgrounds[5]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-35 mix-blend-multiply pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/50 to-teal-50/35 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-wider text-teal-800 bg-white/85 px-2 py-0.5 rounded-full">
                Morning Stack
              </span>
              <h2 className="text-sm font-black text-slate-900 mt-1 leading-tight truncate">
                {primaryStack ? primaryStack.name.split(' (')[0] : "Dan's Morning Stack"}
              </h2>
            </div>

            {/* Chart: 4-Bar Stack Composition Chart (Collagen / H2O / Na / K) */}
            <div className="relative z-10 grid grid-cols-4 gap-1 items-end bg-white/80 backdrop-blur-[1px] rounded-2xl p-2 border border-slate-200/60">
              {[
                { label: 'Prot', val: `${primaryStack?.totals?.protein || 12.6}g`, pct: 85, color: 'bg-teal-600' },
                { label: 'H2O', val: `${primaryStack?.totals?.waterMl || 750}ml`, pct: 95, color: 'bg-sky-500' },
                { label: 'Na', val: `${primaryStack?.totals?.micros?.sodium || 465}mg`, pct: 70, color: 'bg-indigo-500' },
                { label: 'Leu', val: `${primaryStack?.totals?.aminos?.leucine || 378}mg`, pct: 55, color: 'bg-emerald-500' },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-col items-center">
                  <div className="w-full h-11 bg-slate-200/75 rounded-lg flex items-end p-0.5 overflow-hidden">
                    <div
                      className={`w-full rounded-sm ${bar.color}`}
                      style={{ height: `${bar.pct}%` }}
                    />
                  </div>
                  <span className="text-[8.5px] font-black text-slate-900 mt-1 leading-none">
                    {bar.val}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500">{bar.label}</span>
                </div>
              ))}
            </div>
          </article>
        </main>
      </div>

      {/* =====================================================================
          INTERIOR TILE WORKSPACES (OPENED BY CLICKING ANY OF THE 6 TILES)
         ===================================================================== */}

      {/* TILE 6 INTERIOR: STACK BUILDER & 1-TAP STACK LOGGING */}
      {activeTile === 'STACKS' && (
        <StackManager
          isOpen={true}
          stacks={morningStacks}
          onSaveStack={saveOrUpdateStack}
          onDeleteStack={(id) => setMorningStacks((prev) => prev.filter((s) => s.id !== id))}
          onLogStack={(stack) => {
            logMorningStack(stack);
            setActiveTile(null);
          }}
          onClose={() => setActiveTile(null)}
        />
      )}

      {/* TILES 1–5 INTERIOR MODAL WORKSPACE */}
      {activeTile && activeTile !== 'STACKS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-fade-in">
            <div className="px-4 py-3.5 bg-[#F4F8FB] border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                {activeTile === 'NUTRITION' && 'Nutrition — Log Food & Edit Targets'}
                {activeTile === 'PEPTIDES' && 'Peptides — Auto BAC Calc & Record Dose'}
                {activeTile === 'MTOR' && 'Amino Acids & 24h mTOR — Log & Edit'}
                {activeTile === 'ACTIVITY' && 'Activity & Training — Log & Edit'}
                {activeTile === 'HYDRATION' && 'Hydration — Log Water & Edit Goal'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveTile(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {/* ===============================================================
                  INSIDE TILE 1: NUTRITION (LOG FOOD + AUTO-FILL + EDIT TARGETS)
                 =============================================================== */}
              {activeTile === 'NUTRITION' && (
                <div className="space-y-4">
                  {/* Log Food with Verified USDA Auto-Fill */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!foodForm.title.trim()) return;
                      addLogRecord({
                        category: 'NUTRITION',
                        title: foodForm.title.trim(),
                        calories: Number(foodForm.calories) || 0,
                        protein: Number(foodForm.protein) || 0,
                        carbs: Number(foodForm.carbs) || 0,
                        fats: Number(foodForm.fats) || 0,
                        leucineMg: Number(foodForm.leucineMg) || 0,
                        aminos: {
                          leucine: Number(foodForm.leucineMg) || 0,
                          methionine: Number(foodForm.methionineMg) || 0,
                        },
                        summary: `${Number(foodForm.calories) || 0} kcal • ${
                          Number(foodForm.protein) || 0
                        }g P • ${Number(foodForm.carbs) || 0}g C • ${
                          Number(foodForm.fats) || 0
                        }g F`,
                      });
                      setFoodForm({
                        title: '',
                        calories: '',
                        protein: '',
                        carbs: '',
                        fats: '',
                        leucineMg: '',
                        methionineMg: '',
                        sourceLabel: '',
                      });
                    }}
                    className="rounded-2xl bg-[#F4F8FB] border border-sky-200 p-3.5 space-y-2.5"
                  >
                    <div className="text-xs font-black uppercase text-sky-900">
                      Log Meal or Food (Auto-Verified USDA Lookup)
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={foodForm.title}
                        onChange={(e) => setFoodForm((f) => ({ ...f, title: e.target.value }))}
                        onBlur={handleAutoLookupFood}
                        placeholder="e.g., 200g chicken breast, 2 eggs, 150g salmon"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleAutoLookupFood}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{isLookingUpFood ? '...' : 'Auto-Fill'}</span>
                      </button>
                    </div>
                    {foodForm.sourceLabel && (
                      <div className="text-[10px] font-bold text-emerald-700">
                        ✓ {foodForm.sourceLabel}
                      </div>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Kcal</label>
                        <input
                          type="number"
                          required
                          value={foodForm.calories}
                          onChange={(e) =>
                            setFoodForm((f) => ({ ...f, calories: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Prot(g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={foodForm.protein}
                          onChange={(e) =>
                            setFoodForm((f) => ({ ...f, protein: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Carb(g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={foodForm.carbs}
                          onChange={(e) => setFoodForm((f) => ({ ...f, carbs: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Fat(g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={foodForm.fats}
                          onChange={(e) => setFoodForm((f) => ({ ...f, fats: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Leu(mg)</label>
                        <input
                          type="number"
                          value={foodForm.leucineMg}
                          onChange={(e) =>
                            setFoodForm((f) => ({ ...f, leucineMg: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Met(mg)</label>
                        <input
                          type="number"
                          value={foodForm.methionineMg}
                          onChange={(e) =>
                            setFoodForm((f) => ({ ...f, methionineMg: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold cursor-pointer"
                    >
                      Add Food to Today&apos;s Nutrition
                    </button>
                  </form>

                  {/* Today's Logged Meals (Inline Delete) */}
                  {todayLog.meals.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-extrabold uppercase text-slate-500">
                        Logged Today ({todayLog.meals.length})
                      </div>
                      {todayLog.meals.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-xl border border-slate-200 p-2.5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{m.title || m.name}</div>
                            <div className="text-[11px] text-slate-600">
                              {m.calories} kcal • {m.protein}g P • {m.carbs || 0}g C •{' '}
                              {m.fats || m.fat || 0}g F
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteLogRecord(m.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Edit Daily Macro Targets */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateUserProfile({
                        dailyCaloricTarget: Number(directEditForm.dailyCaloricTarget) || 1900,
                        dailyProteinTarget: Number(directEditForm.dailyProteinTarget) || 180,
                        dailyCarbTarget: Number(directEditForm.dailyCarbTarget) || 145,
                        dailyFatTarget: Number(directEditForm.dailyFatTarget) || 65,
                      });
                      setActiveTile(null);
                    }}
                    className="rounded-2xl border border-slate-200 p-3 space-y-2.5"
                  >
                    <div className="text-[10px] font-extrabold uppercase text-slate-600">
                      Edit Daily Macro Targets
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Kcal</label>
                        <input
                          type="number"
                          value={directEditForm.dailyCaloricTarget}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({
                              ...f,
                              dailyCaloricTarget: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Prot(g)</label>
                        <input
                          type="number"
                          value={directEditForm.dailyProteinTarget}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({
                              ...f,
                              dailyProteinTarget: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Carb(g)</label>
                        <input
                          type="number"
                          value={directEditForm.dailyCarbTarget}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({ ...f, dailyCarbTarget: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Fat(g)</label>
                        <input
                          type="number"
                          value={directEditForm.dailyFatTarget}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({ ...f, dailyFatTarget: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-black"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
                    >
                      Save Macro Targets
                    </button>
                  </form>

                  {/* Micronutrients */}
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
                </div>
              )}

              {/* ===============================================================
                  INSIDE TILE 2: PEPTIDES & AUTO BAC WATER CALCULATOR
                 =============================================================== */}
              {activeTile === 'PEPTIDES' && (
                <div className="space-y-3">
                  <PeptideCalculator
                    onQuickLogDose={({
                      name,
                      doseMg,
                      doseMcg,
                      vialMg,
                      bacWaterMl,
                      units,
                      site,
                    }) => {
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
                        summary: `${
                          doseMg ? `${doseMg} mg` : `${doseMcg} mcg`
                        } (${units} IU from ${vialMg}mg/${bacWaterMl}mL) • ${site}`,
                      });
                      setActiveTile(null);
                    }}
                  />

                  {peptideHistory.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="text-[10px] font-extrabold uppercase text-slate-500">
                        Recorded Peptide Doses ({peptideHistory.length})
                      </div>
                      {peptideHistory.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-slate-200 p-2.5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-black text-slate-900">
                              {p.name || p.title} — {p.doseMg ? `${p.doseMg} mg` : `${p.doseMcg} mcg`}{' '}
                              ({p.units || 60} IU)
                            </div>
                            <div className="text-[10px] text-slate-500">{p.site}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteLogRecord(p.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ===============================================================
                  INSIDE TILE 3: AMINO ACIDS & 24h mTOR MONITOR
                 =============================================================== */}
              {activeTile === 'MTOR' && (
                <div className="space-y-4">
                  <MtorMonitor
                    aminoTotals={todayTotals.aminos}
                    todayMeals={todayLog.meals}
                    plannedStacks={morningStacks}
                    onLogAminoPulse={({ title, leucineMg, methionineMg }) => {
                      addLogRecord({
                        category: 'NUTRITION',
                        title,
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fats: 0,
                        leucineMg,
                        aminos: {
                          leucine: leucineMg,
                          methionine: methionineMg,
                        },
                        summary: `Amino Entry • Leu: ${leucineMg}mg • Met: ${methionineMg}mg`,
                      });
                    }}
                  />
                </div>
              )}

              {/* ===============================================================
                  INSIDE TILE 4: ACTIVITY & TRAINING (LOG + EDIT)
                 =============================================================== */}
              {activeTile === 'ACTIVITY' && (
                <div className="space-y-4">
                  {/* Log Workout Session (Resistance Bands / Ab Wheel / Spin Bike) */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addLogRecord({
                        category: 'ACTIVITY',
                        title: activityForm.activityType,
                        durationMin: Number(activityForm.durationMin) || 0,
                        steps: Number(activityForm.steps) || 0,
                        caloriesBurned: Number(activityForm.caloriesBurned) || 0,
                        summary: `${activityForm.durationMin} mins • ${activityForm.steps} steps • ${activityForm.caloriesBurned} kcal`,
                      });
                      setActiveTile(null);
                    }}
                    className="rounded-2xl bg-[#F4F8FB] border border-emerald-200 p-3.5 space-y-3"
                  >
                    <div className="text-xs font-black uppercase text-emerald-900">
                      Log Training Session
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {DEFAULT_WORKOUT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            setActivityForm({
                              activityType: preset.name,
                              durationMin: preset.durationMin,
                              steps: preset.steps,
                              caloriesBurned: preset.caloriesBurned,
                            })
                          }
                          className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                        >
                          {preset.name.split(' (')[0]}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      required
                      value={activityForm.activityType}
                      onChange={(e) =>
                        setActivityForm((f) => ({ ...f, activityType: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Minutes</label>
                        <input
                          type="number"
                          value={activityForm.durationMin}
                          onChange={(e) =>
                            setActivityForm((f) => ({ ...f, durationMin: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Steps</label>
                        <input
                          type="number"
                          value={activityForm.steps}
                          onChange={(e) =>
                            setActivityForm((f) => ({ ...f, steps: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">
                          Burn (kcal)
                        </label>
                        <input
                          type="number"
                          value={activityForm.caloriesBurned}
                          onChange={(e) =>
                            setActivityForm((f) => ({ ...f, caloriesBurned: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
                    >
                      Log Workout / Activity
                    </button>
                  </form>

                  {/* Edit Today's Totals & Daily Goals Directly */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateTodayDirectMetrics({
                        steps: Number(directEditForm.steps) || 0,
                        activeMinutes: Number(directEditForm.activeMinutes) || 0,
                        activeCalories: Number(directEditForm.activeCalories) || 0,
                      });
                      updateUserProfile({
                        dailyStepsTarget: Number(directEditForm.dailyStepsTarget) || 10000,
                        dailyActiveMinutesTarget:
                          Number(directEditForm.dailyActiveMinutesTarget) || 45,
                      });
                      setActiveTile(null);
                    }}
                    className="rounded-2xl border border-slate-200 p-3.5 space-y-3"
                  >
                    <div className="text-[10px] font-extrabold uppercase text-slate-600">
                      Edit Today&apos;s Totals & Daily Targets
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">
                          Today Steps
                        </label>
                        <input
                          type="number"
                          value={directEditForm.steps}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({ ...f, steps: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">
                          Today Mins
                        </label>
                        <input
                          type="number"
                          value={directEditForm.activeMinutes}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({ ...f, activeMinutes: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">
                          Steps Goal
                        </label>
                        <input
                          type="number"
                          value={directEditForm.dailyStepsTarget}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({ ...f, dailyStepsTarget: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-black"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
                    >
                      Save Activity Overrides
                    </button>
                  </form>
                </div>
              )}

              {/* ===============================================================
                  INSIDE TILE 5: HYDRATION (LOG WATER + EDIT TOTAL & GOAL)
                 =============================================================== */}
              {activeTile === 'HYDRATION' && (
                <div className="space-y-4">
                  {/* Instant Tap + Custom Water Entry */}
                  <div className="rounded-2xl bg-[#F4F8FB] border border-sky-200 p-3.5 space-y-3">
                    <div className="text-xs font-black uppercase text-sky-900">
                      Log Water Intake
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[250, 500, 750].map((ml) => (
                        <button
                          key={ml}
                          type="button"
                          onClick={() => {
                            incrementWater(ml);
                            setDirectEditForm((f) => ({
                              ...f,
                              waterMl: Number(f.waterMl) + ml,
                            }));
                          }}
                          className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-black cursor-pointer"
                        >
                          +{ml} ml
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="50"
                        step="50"
                        value={customWaterInput}
                        onChange={(e) => setCustomWaterInput(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const ml = Number(customWaterInput) || 0;
                          if (ml > 0) {
                            incrementWater(ml);
                            setDirectEditForm((f) => ({
                              ...f,
                              waterMl: Number(f.waterMl) + ml,
                            }));
                          }
                        }}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
                      >
                        Add Custom ml
                      </button>
                    </div>
                  </div>

                  {/* Direct Override of Today's Water & Daily Goal */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateTodayDirectMetrics({ waterMl: Number(directEditForm.waterMl) || 0 });
                      setHydrationGoalMl(Number(directEditForm.waterGoalMl) || 2500);
                      setActiveTile(null);
                    }}
                    className="rounded-2xl border border-slate-200 p-3.5 space-y-3"
                  >
                    <div className="text-[10px] font-extrabold uppercase text-slate-600">
                      Edit Today&apos;s Total & Daily Goal
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Today&apos;s Water Total (ml)
                        </label>
                        <input
                          type="number"
                          value={directEditForm.waterMl}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({ ...f, waterMl: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Daily Goal (ml)
                        </label>
                        <input
                          type="number"
                          value={directEditForm.waterGoalMl}
                          onChange={(e) =>
                            setDirectEditForm((f) => ({ ...f, waterGoalMl: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-sky-600 text-white text-xs font-extrabold cursor-pointer"
                    >
                      Save Hydration Settings
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
