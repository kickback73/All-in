// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from './context/AppContext';
import {
  selectUniqueTileBackgrounds,
  AVAILABLE_BACKGROUND_IMAGES,
} from './utils/backgroundEngine';
import Header from './components/Header';
import StackManager from './components/StackManager';
import PeptideCalculator from './components/PeptideCalculator';
import MtorMonitor from './components/MtorMonitor';
import UserProfileModal from './components/UserProfileModal';
import QuickLogModal from './components/QuickLogModal';
import {
  Droplets,
  Plus,
  Pencil,
  Check,
  Sparkles,
  Smartphone,
  Maximize2,
  Minimize2,
  Shuffle,
} from 'lucide-react';
import { MICRONUTRIENT_FIELDS } from './data/initialData';

export default function App() {
  const {
    todayLog,
    todayTotals,
    userProfile,
    updateUserProfile,
    hydrationGoalMl,
    setHydrationGoalMl,
    morningStacks,
    setMorningStacks,
    peptideHistory,
    universalLogs,
    addLogRecord,
    updateLogRecord,
    deleteLogRecord,
    incrementWater,
    logMorningStack,
  } = useApp();

  // Pixel 8 Optimization Mode (Defaults to true so layout is native 412px-432px Pixel 8 width)
  const [isPixel8Mode, setIsPixel8Mode] = useState(true);

  // Randomized non-duplicating tile backgrounds from /public/images/
  const [tileBackgrounds, setTileBackgrounds] = useState(() =>
    selectUniqueTileBackgrounds(4, AVAILABLE_BACKGROUND_IMAGES)
  );

  const handleShuffleTileBackgrounds = useCallback(() => {
    setTileBackgrounds(selectUniqueTileBackgrounds(4, AVAILABLE_BACKGROUND_IMAGES));
  }, []);

  useEffect(() => {
    setTileBackgrounds(selectUniqueTileBackgrounds(4, AVAILABLE_BACKGROUND_IMAGES));
  }, []);

  // Modal Visibility States
  const [isHistoricalLogOpen, setIsHistoricalLogOpen] = useState(false);
  const [isStackBuilderOpen, setIsStackBuilderOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogTab, setQuickLogTab] = useState('WATER'); // Strictly defaults to WATER

  // Inline Hydration Target Editor
  const [isEditingHydration, setIsEditingHydration] = useState(false);
  const [hydrationDraft, setHydrationDraft] = useState(String(hydrationGoalMl));

  // Circular Hydration Progress Math
  const currentWater = todayTotals.waterMl || 0;
  const targetWater = hydrationGoalMl || 2500;
  const hydrationPct = Math.min(100, Math.round((currentWater / targetWater) * 100));
  const hydRadius = 28;
  const hydCircumference = 2 * Math.PI * hydRadius;
  const hydDashOffset = hydCircumference - (hydrationPct / 100) * hydCircumference;

  // Persistent FAB Click Handler: Strictly resets tab to WATER on every open
  const handleOpenQuickLog = () => {
    setQuickLogTab('WATER');
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#E8F0F8] text-slate-900 font-sans antialiased flex flex-col items-center">
      {/* Desktop Helper Bar to Toggle Pixel 8 Viewport (1080x2400 / 412px CSS width) vs Expanded View */}
      <div className="hidden sm:flex items-center gap-3 my-3 bg-white/90 border border-slate-200 px-4 py-1.5 rounded-full text-xs text-slate-700 shadow-xs backdrop-blur-md z-40">
        <Smartphone className="w-4 h-4 text-sky-600" />
        <span className="font-bold">Google Pixel 8 Optimized (412px Viewport)</span>
        <button
          type="button"
          onClick={handleShuffleTileBackgrounds}
          className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border border-sky-200 transition cursor-pointer"
        >
          <Shuffle className="w-3 h-3" />
          <span>Shuffle Tile Images</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPixel8Mode(!isPixel8Mode)}
          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-slate-300 transition cursor-pointer"
        >
          {isPixel8Mode ? (
            <>
              <Maximize2 className="w-3 h-3" />
              <span>Expand Desktop Grid</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3 h-3" />
              <span>Pixel 8 Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Pixel 8 Viewport Container */}
      <div
        className={`w-full bg-[#F4F8FB] min-h-screen pb-28 relative transition-all duration-300 ${
          isPixel8Mode
            ? 'max-w-[432px] sm:rounded-[38px] sm:border-[6px] sm:border-slate-800 sm:shadow-2xl sm:my-1 overflow-x-hidden'
            : 'max-w-6xl'
        }`}
      >
        {/* 1. TOP VIEWPORT & HEADER BAR */}
        <Header
          onOpenHistory={() => setIsHistoricalLogOpen(true)}
          onShuffleBackgrounds={handleShuffleTileBackgrounds}
        />

        <main className="px-3.5 pt-3.5 space-y-4">
          {/* 2. HYDRATION ACTION BAR & MORNING STACKS CAROUSEL */}
          <section
            className={`grid grid-cols-1 gap-4 ${
              !isPixel8Mode ? 'lg:grid-cols-12' : ''
            }`}
          >
            {/* Hydration Action Bar */}
            <div
              className={`${
                !isPixel8Mode ? 'lg:col-span-5' : ''
              } bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between gap-3`}
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-xl bg-sky-50 text-sky-700">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-800">
                    Hydration Action Bar
                  </span>
                </div>

                {/* Dynamic Goal with Inline Pencil Icon */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl font-black text-slate-900">{currentWater}</span>
                  {!isEditingHydration ? (
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      / {targetWater} ml
                      <button
                        type="button"
                        onClick={() => {
                          setHydrationDraft(String(targetWater));
                          setIsEditingHydration(true);
                        }}
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-sky-700 transition cursor-pointer"
                        title="Edit Daily Hydration Target"
                        aria-label="Edit Daily Hydration Target"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const parsed = Math.max(500, Number(hydrationDraft) || 2500);
                        setHydrationGoalMl(parsed);
                        setIsEditingHydration(false);
                      }}
                      className="inline-flex items-center gap-1"
                    >
                      <input
                        type="number"
                        min="500"
                        step="100"
                        value={hydrationDraft}
                        onChange={(e) => setHydrationDraft(e.target.value)}
                        className="w-20 rounded-lg border border-sky-400 px-2 py-0.5 text-xs font-bold text-slate-900"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </div>

                {/* Instant-Tap Hydration Buttons (+250 ml, +500 ml, +750 ml) */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {[250, 500, 750].map((ml) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => incrementWater(ml)}
                      className="py-1.5 px-2 rounded-full text-[11px] font-black bg-[#F4F8FB] hover:bg-sky-600 hover:text-white active:scale-95 text-sky-800 border border-sky-200 transition shadow-2xs cursor-pointer text-center"
                    >
                      +{ml}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* Adjacent Circular Progress Ring */}
              <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
                <svg className="w-18 h-18 -rotate-90" viewBox="0 0 72 72">
                  <circle
                    cx="36"
                    cy="36"
                    r={hydRadius}
                    className="stroke-slate-100"
                    strokeWidth="6.5"
                    fill="transparent"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r={hydRadius}
                    className="stroke-sky-500 transition-all duration-500"
                    strokeWidth="6.5"
                    strokeDasharray={hydCircumference}
                    strokeDashoffset={hydDashOffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-slate-900">{hydrationPct}%</span>
                </div>
              </div>
            </div>

            {/* Morning Stacks Carousel */}
            <div
              className={`${
                !isPixel8Mode ? 'lg:col-span-7' : ''
              } bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-teal-50 text-teal-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                      Morning Stacks Carousel
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Single-tap multi-ingredient logging
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStackBuilderOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold transition shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Stack</span>
                </button>
              </div>

              {morningStacks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F4F8FB]/70 p-3.5 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600 font-medium">
                    No preset stacks. Build your custom morning shake or supplement stack.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsStackBuilderOpen(true)}
                    className="text-xs font-black text-sky-700 hover:underline shrink-0"
                  >
                    Create &rarr;
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
                  {morningStacks.map((stack) => (
                    <div
                      key={stack.id}
                      className="min-w-[210px] snap-start rounded-2xl border border-slate-200 bg-[#F4F8FB] p-3 flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 truncate">
                          {stack.name}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-600">
                          {stack.totals?.calories || 0} kcal • {stack.totals?.protein || 0}g P • Leu:{' '}
                          {stack.totals?.aminos?.leucine || 0}mg
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => logMorningStack(stack)}
                        className="w-full py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition cursor-pointer"
                      >
                        Tap to Log
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 3. MODULAR TILE GRID (MANDATORY STRICT SEQUENCE: TILE 1 -> TILE 2 -> TILE 3 -> TILE 4) */}
          <section
            className={`grid grid-cols-1 gap-4 ${
              !isPixel8Mode ? 'lg:grid-cols-2' : ''
            }`}
          >
            {/* =====================================================================
                TILE 1: NUTRITION (MACROS & MICROS)
               ===================================================================== */}
            <article className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-4.5 flex flex-col justify-between">
              {/* Randomized Non-Duplicating Background Image from /public/images/ */}
              {tileBackgrounds[0] && (
                <img
                  src={tileBackgrounds[0]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-multiply pointer-events-none select-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-sky-50/45 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-200/70 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full">
                      Tile 01 • Daily Intake
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                      Nutrition (Macros & Micros)
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">
                      {todayTotals.calories}{' '}
                      <span className="text-xs font-bold text-slate-600">kcal</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">
                      Goal: {userProfile.dailyCaloricTarget || 2200} kcal
                    </div>
                  </div>
                </div>

                {/* Embedded Column / Bar Progress Chart */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    {
                      label: 'Protein',
                      val: todayTotals.protein,
                      goal: userProfile.dailyProteinTarget || 140,
                      unit: 'g',
                      color: 'bg-sky-600',
                    },
                    {
                      label: 'Carbs',
                      val: todayTotals.carbs,
                      goal: 200,
                      unit: 'g',
                      color: 'bg-teal-500',
                    },
                    {
                      label: 'Fats',
                      val: todayTotals.fat,
                      goal: 75,
                      unit: 'g',
                      color: 'bg-indigo-500',
                    },
                  ].map((macro) => {
                    const pct = Math.min(100, Math.round((macro.val / macro.goal) * 100));
                    return (
                      <div
                        key={macro.label}
                        className="rounded-2xl bg-white/75 backdrop-blur-[2px] border border-slate-200/80 p-3 flex flex-col justify-between shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 mb-1.5">
                          <span>{macro.label}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-20 w-full bg-slate-100/90 rounded-xl flex items-end p-1 overflow-hidden">
                          <div
                            className={`w-full rounded-lg transition-all duration-500 ${macro.color}`}
                            style={{ height: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-sm font-black text-slate-900">
                            {macro.val}
                            {macro.unit}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            /{macro.goal}
                            {macro.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Granular Micronutrients Breakdown */}
                <div className="rounded-2xl bg-white/75 backdrop-blur-[2px] border border-slate-200/80 p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Micronutrient Telemetry
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {MICRONUTRIENT_FIELDS.map((m) => (
                      <div
                        key={m.key}
                        className="bg-white/85 rounded-xl p-2 border border-slate-200/60 text-center shadow-2xs"
                      >
                        <div className="text-[10px] font-bold text-slate-600 truncate">
                          {m.label}
                        </div>
                        <div className="text-xs font-black text-slate-900 mt-0.5">
                          {todayTotals.micros[m.key] || 0}
                          <span className="text-[9px] font-semibold text-slate-500 ml-0.5">
                            {m.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* =====================================================================
                TILE 2: PEPTIDES & PEPTIDE CALCULATOR
               ===================================================================== */}
            <article className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-4.5 flex flex-col justify-between">
              {tileBackgrounds[1] && (
                <img
                  src={tileBackgrounds[1]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-multiply pointer-events-none select-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-teal-50/45 pointer-events-none" />

              <div className="relative z-10 space-y-3.5">
                <div className="flex items-start justify-between border-b border-slate-200/70 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                      Tile 02 • Oncology Guarded
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                      Peptides & Peptide Calculator
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">
                      {peptideHistory.length}
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">Doses Logged</div>
                  </div>
                </div>

                {/* Active Doses List */}
                {peptideHistory.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {peptideHistory.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className="px-2.5 py-1 rounded-full text-[11px] font-black bg-teal-50/95 text-teal-900 border border-teal-200"
                      >
                        {p.name || p.title || p.compound}:{' '}
                        {p.doseMcg || p.doseDisplay || `${p.doseMg}mg`} ({p.site})
                      </span>
                    ))}
                  </div>
                )}

                {/* Reconstitution Calculator & Google Custom Search Screen */}
                <PeptideCalculator
                  onQuickLogDose={({ name, doseMcg, units, site }) =>
                    addLogRecord({
                      category: 'PEPTIDE',
                      title: name,
                      doseMcg,
                      site,
                      summary: `${doseMcg} mcg (${units} IU) • Site: ${site}`,
                    })
                  }
                />
              </div>
            </article>

            {/* =====================================================================
                TILE 3: AMINO ACID PROFILES & mTOR MONITOR
               ===================================================================== */}
            <article className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-4.5 flex flex-col justify-between">
              {tileBackgrounds[2] && (
                <img
                  src={tileBackgrounds[2]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-multiply pointer-events-none select-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-indigo-50/45 pointer-events-none" />

              <div className="relative z-10 space-y-3.5">
                <div className="flex items-start justify-between border-b border-slate-200/70 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                      Tile 03 • Remission Telemetry
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                      Amino Acid Profiles & mTOR Monitor
                    </h2>
                  </div>
                </div>

                {/* 24h Area/Line Graph & 9 EAA Radar Chart */}
                <MtorMonitor
                  aminoTotals={todayTotals.aminos}
                  todayMeals={todayLog.meals}
                  plannedStacks={morningStacks}
                />
              </div>
            </article>

            {/* =====================================================================
                TILE 4: DAILY ACTIVITY & GOALS
               ===================================================================== */}
            <article className="relative bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden p-4.5 flex flex-col justify-between">
              {tileBackgrounds[3] && (
                <img
                  src={tileBackgrounds[3]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-multiply pointer-events-none select-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/55 to-emerald-50/45 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-200/70 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Tile 04 • Movement & Zone 2
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                      Daily Activity & Goals
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">
                      {todayTotals.steps.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">Steps Today</div>
                  </div>
                </div>

                {/* Google Health Circular Progress Rings */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    {
                      label: 'Steps',
                      val: todayTotals.steps,
                      goal: 10000,
                      unit: '',
                      stroke: 'stroke-emerald-500',
                    },
                    {
                      label: 'Active Min',
                      val: todayTotals.activeMinutes,
                      goal: 45,
                      unit: 'm',
                      stroke: 'stroke-sky-500',
                    },
                    {
                      label: 'Burn',
                      val: todayTotals.activeCalories,
                      goal: 550,
                      unit: 'kcal',
                      stroke: 'stroke-teal-500',
                    },
                  ].map((ring) => {
                    const pct = Math.min(100, Math.round((ring.val / ring.goal) * 100));
                    const r = 28;
                    const c = 2 * Math.PI * r;
                    const offset = c - (pct / 100) * c;
                    return (
                      <div
                        key={ring.label}
                        className="rounded-2xl bg-white/75 backdrop-blur-[2px] border border-slate-200/80 p-2.5 flex flex-col items-center text-center shadow-2xs"
                      >
                        <div className="relative w-18 h-18 flex items-center justify-center">
                          <svg className="w-18 h-18 -rotate-90" viewBox="0 0 72 72">
                            <circle
                              cx="36"
                              cy="36"
                              r={r}
                              className="stroke-slate-100"
                              strokeWidth="6.5"
                              fill="transparent"
                            />
                            <circle
                              cx="36"
                              cy="36"
                              r={r}
                              className={`${ring.stroke} transition-all duration-500`}
                              strokeWidth="6.5"
                              strokeDasharray={c}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-black text-slate-900">{pct}%</span>
                          </div>
                        </div>
                        <div className="mt-1.5 font-black text-xs text-slate-900">
                          {ring.val.toLocaleString()}
                          {ring.unit}
                        </div>
                        <div className="text-[10px] font-bold text-slate-600">
                          {ring.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          </section>
        </main>

        {/* 5. PERSISTENT FLOATING ACTION BUTTON (FAB) WITH EXPLICIT z-50 STACKING CONTEXT */}
        <div className="fixed bottom-5 right-5 z-50">
          <button
            type="button"
            onClick={handleOpenQuickLog}
            aria-label="Open Quick Log Modal"
            className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-sm shadow-xl hover:shadow-2xl transition cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[3px]" />
            <span>Quick Log</span>
          </button>
        </div>
      </div>

      {/* LIGHTWEIGHT TABBED QUICK-LOG MODAL (STRICTLY DEFAULTS TO TAB 1: WATER) */}
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
              summary: `${foodData.calories} kcal • ${foodData.protein}g P • ${foodData.carbs}g C • ${foodData.fats}g F (Leucine: ${foodData.leucineMg}mg)`,
            });
          }
        }}
        onLogPeptide={({ name, doseMcg, doseDisplay, site }) =>
          addLogRecord({
            category: 'PEPTIDE',
            title: name,
            doseMcg,
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

      {/* STACK BUILDER MODAL */}
      <StackManager
        isOpen={isStackBuilderOpen}
        stacks={morningStacks}
        onSaveStack={(newStack) => setMorningStacks((prev) => [newStack, ...prev])}
        onDeleteStack={(id) => setMorningStacks((prev) => prev.filter((s) => s.id !== id))}
        onLogStack={(stack) => {
          logMorningStack(stack);
          setIsStackBuilderOpen(false);
        }}
        onClose={() => setIsStackBuilderOpen(false)}
      />

      {/* DEDICATED HISTORICAL LOG VIEW (ACCESSED VIA PROFILE ICON IN HEADER) */}
      <UserProfileModal
        isOpen={isHistoricalLogOpen}
        onClose={() => setIsHistoricalLogOpen(false)}
        logs={universalLogs}
        onUpdateLog={updateLogRecord}
        onDeleteLog={deleteLogRecord}
        userProfile={userProfile}
        onUpdateUserProfile={updateUserProfile}
      />
    </div>
  );
}
