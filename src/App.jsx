// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Layers,
  Utensils,
  Syringe,
  Activity,
  Footprints,
  Flame,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ESSENTIAL_AMINO_ACIDS, MICRONUTRIENT_FIELDS } from './data/initialData';

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
    activeCycleKey,
  } = useApp();

  // Randomized non-duplicating tile backgrounds
  const [tileBackgrounds, setTileBackgrounds] = useState([]);
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
  const hydRadius = 30;
  const hydCircumference = 2 * Math.PI * hydRadius;
  const hydDashOffset = hydCircumference - (hydrationPct / 100) * hydCircumference;

  // Persistent FAB Click Handler: Strictly resets tab to WATER on every open
  const handleOpenQuickLog = () => {
    setQuickLogTab('WATER');
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-slate-900 pb-28 font-sans antialiased">
      {/* 1. TOP VIEWPORT & HEADER BAR */}
      <Header onOpenHistory={() => setIsHistoricalLogOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* 2. HYDRATION ACTION BAR & MORNING STACKS CAROUSEL */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Hydration Action Bar */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-sky-50 text-sky-700">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-800">
                  Hydration Action Bar
                </span>
              </div>

              {/* Dynamic Goal with Inline Pencil Icon */}
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-3xl font-black text-slate-900">{currentWater}</span>
                {!isEditingHydration ? (
                  <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                    / {targetWater} ml
                    <button
                      type="button"
                      onClick={() => {
                        setHydrationDraft(String(targetWater));
                        setIsEditingHydration(true);
                      }}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-sky-700 transition cursor-pointer"
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

              {/* Instant-Tap Hydration Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[250, 500, 750].map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => incrementWater(ml)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#F4F8FB] hover:bg-sky-600 hover:text-white text-sky-800 border border-sky-200 transition shadow-2xs cursor-pointer"
                  >
                    +{ml} ml
                  </button>
                ))}
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
              <svg className="w-22 h-22 -rotate-90" viewBox="0 0 76 76">
                <circle
                  cx="38"
                  cy="38"
                  r={hydRadius}
                  className="stroke-slate-100"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="38"
                  cy="38"
                  r={hydRadius}
                  className="stroke-sky-500 transition-all duration-500"
                  strokeWidth="7"
                  strokeDasharray={hydCircumference}
                  strokeDashoffset={hydDashOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-slate-900">{hydrationPct}%</span>
              </div>
            </div>
          </div>

          {/* Morning Stacks Carousel */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-teal-50 text-teal-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                    Morning Stacks & Multi-Ingredient Carousel
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Single-tap logging for custom-defined morning foods, shakes, and supplement stacks.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStackBuilderOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold transition shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Build Stack</span>
              </button>
            </div>

            {morningStacks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F4F8FB]/60 p-4 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  Zero presets loaded. Create your first custom morning shake, food, or supplement stack.
                </span>
                <button
                  type="button"
                  onClick={() => setIsStackBuilderOpen(true)}
                  className="text-xs font-black text-sky-700 hover:underline shrink-0 ml-3"
                >
                  Create Stack &rarr;
                </button>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {morningStacks.map((stack) => (
                  <div
                    key={stack.id}
                    className="min-w-[230px] rounded-2xl border border-slate-200 bg-[#F4F8FB] p-3 flex flex-col justify-between gap-2 shadow-2xs"
                  >
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 truncate">
                        {stack.name}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600">
                        {stack.totals?.calories || 0} kcal • {stack.totals?.protein || 0}g P • Leucine:{' '}
                        {stack.totals?.aminos?.leucine || 0}mg
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => logMorningStack(stack)}
                      className="w-full py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition cursor-pointer"
                    >
                      Instant Tap Log
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3. MODULAR TILE GRID (MANDATORY STRICT SEQUENCE: 1 -> 2 -> 3 -> 4) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* =====================================================================
              TILE 1: NUTRITION (MACROS & MICROS)
             ===================================================================== */}
          <article className="relative bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden p-6 flex flex-col justify-between">
            {/* Low-Opacity Tile Background from /public/images/ */}
            {tileBackgrounds[0] && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                style={{ backgroundImage: `url('${tileBackgrounds[0]}')` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-sky-50/80 pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700">
                    Tile 01 • Daily Progress
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Nutrition (Macros & Micros)
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900">
                    {todayTotals.calories}{' '}
                    <span className="text-sm font-bold text-slate-500">kcal</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Target: {userProfile.dailyCaloricTarget || 2200} kcal
                  </div>
                </div>
              </div>

              {/* Embedded Column / Bar Progress Chart */}
              <div className="grid grid-cols-3 gap-3.5">
                {[
                  {
                    label: 'Protein',
                    val: todayTotals.protein,
                    goal: userProfile.dailyProteinTarget || 140,
                    unit: 'g',
                    color: 'bg-sky-600',
                  },
                  {
                    label: 'Carbohydrates',
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
                      className="rounded-2xl bg-white/95 border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 mb-2">
                        <span>{macro.label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-24 w-full bg-slate-100 rounded-xl flex items-end p-1.5 overflow-hidden">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${macro.color}`}
                          style={{ height: `${Math.max(6, pct)}%` }}
                        />
                      </div>
                      <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900">
                          {macro.val}
                          {macro.unit}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          / {macro.goal}
                          {macro.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Granular Micronutrients Breakdown */}
              <div className="rounded-2xl bg-[#F4F8FB] border border-slate-200/80 p-3.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Granular Micronutrient Breakdown
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MICRONUTRIENT_FIELDS.map((m) => (
                    <div
                      key={m.key}
                      className="bg-white rounded-xl p-2 border border-slate-100 text-center shadow-2xs"
                    >
                      <div className="text-[10px] font-bold text-slate-500 truncate">{m.label}</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {todayTotals.micros[m.key] || 0}
                        <span className="text-[10px] font-semibold text-slate-500 ml-0.5">
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
          <article className="relative bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden p-6 flex flex-col justify-between">
            {tileBackgrounds[1] && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                style={{ backgroundImage: `url('${tileBackgrounds[1]}')` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-teal-50/80 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                    Tile 02 • Oncology Protocols
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Peptides & Peptide Calculator
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900">
                    {peptideHistory.length}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">Active Doses Logged</div>
                </div>
              </div>

              {/* Active Doses List */}
              {peptideHistory.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {peptideHistory.slice(0, 4).map((p) => (
                    <span
                      key={p.id}
                      className="px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-900 border border-teal-200"
                    >
                      {p.name || p.title || p.compound}: {p.doseMcg || p.doseDisplay || `${p.doseMg}mg`} ({p.site})
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
          <article className="relative bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden p-6 flex flex-col justify-between">
            {tileBackgrounds[2] && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                style={{ backgroundImage: `url('${tileBackgrounds[2]}')` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-indigo-50/80 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                    Tile 03 • Metabolic Telemetry
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Amino Acid Profiles & mTOR Monitor
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black uppercase text-slate-500">
                    24h Kinetic Curve
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Autophagy vs Anabolism
                  </div>
                </div>
              </div>

              {/* 9 EAA Radar & 24h Area/Line Graph */}
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
          <article className="relative bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden p-6 flex flex-col justify-between">
            {tileBackgrounds[3] && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                style={{ backgroundImage: `url('${tileBackgrounds[3]}')` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-emerald-50/80 pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    Tile 04 • Movement & Zone 2
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Daily Activity & Goals
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900">
                    {todayTotals.steps.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">Steps Logged Today</div>
                </div>
              </div>

              {/* Google Health Circular Progress Rings */}
              <div className="grid grid-cols-3 gap-3.5 pt-1">
                {[
                  {
                    label: 'Daily Steps',
                    val: todayTotals.steps,
                    goal: 10000,
                    unit: 'steps',
                    stroke: 'stroke-emerald-500',
                  },
                  {
                    label: 'Active Minutes',
                    val: todayTotals.activeMinutes,
                    goal: 45,
                    unit: 'min',
                    stroke: 'stroke-sky-500',
                  },
                  {
                    label: 'Active Burn',
                    val: todayTotals.activeCalories,
                    goal: 550,
                    unit: 'kcal',
                    stroke: 'stroke-teal-500',
                  },
                ].map((ring) => {
                  const pct = Math.min(100, Math.round((ring.val / ring.goal) * 100));
                  const r = 32;
                  const c = 2 * Math.PI * r;
                  const offset = c - (pct / 100) * c;
                  return (
                    <div
                      key={ring.label}
                      className="rounded-2xl bg-white/95 border border-slate-200/80 p-3.5 flex flex-col items-center text-center shadow-2xs"
                    >
                      <div className="relative w-22 h-22 flex items-center justify-center">
                        <svg className="w-22 h-22 -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r={r}
                            className="stroke-slate-100"
                            strokeWidth="7"
                            fill="transparent"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r={r}
                            className={`${ring.stroke} transition-all duration-500`}
                            strokeWidth="7"
                            strokeDasharray={c}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm font-black text-slate-900">{pct}%</span>
                        </div>
                      </div>
                      <div className="mt-2 font-black text-sm text-slate-900">
                        {ring.val.toLocaleString()} {ring.unit}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        Goal: {ring.goal.toLocaleString()}
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
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={handleOpenQuickLog}
          aria-label="Open Quick Log Modal"
          className="flex items-center gap-2.5 px-6 py-4 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          <span>Quick Log</span>
        </button>
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
