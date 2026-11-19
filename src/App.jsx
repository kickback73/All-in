// src/App.jsx
import React, { useState, useMemo, useRef } from 'react';
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
  Trash2,
  Calendar,
  Edit2,
  Save,
  Sparkles,
  Flame,
} from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import StackManager from './components/StackManager';
import PeptideCalculator from './components/PeptideCalculator';
import UserProfileModal from './components/UserProfileModal';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import PersistentAllowanceChart from './components/PersistentAllowanceChart';
import { TILE_BACKGROUNDS } from './utils/backgroundEngine';
import { lookupVerifiedNutrients } from './utils/nutrientEngine';

/**
 * SVG Macro Ring / Doughnut Chart (for the main 2x2 Dashboard Tile preview only)
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
 * Tile 2 Modal: Nutrition Overhaul
 * - Persistent visible background image (`TILE_BACKGROUNDS.nutrition` at `opacity-90`)
 * - Auto-clears ingredient input field on food commit
 * - Inline pencil edit (`<Edit2 />`) + delete (`<Trash2 />`) on logged meal rows
 */
const NutritionDetailModal = ({ onClose }) => {
  const {
    dailyNutrition,
    setDailyNutrition,
    logStackToDaily,
    openScannerForDaily,
    updateMealInDaily,
  } = useAppContext();

  const [foodQuery, setFoodQuery] = useState('');
  const [servingText, setServingText] = useState('');
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [stagedFood, setStagedFood] = useState(null);
  const [lastVerifiedSource, setLastVerifiedSource] = useState('');
  const foodInputRef = useRef(null);

  // Inline edit state for logged meals (Item 5)
  const [editingMealId, setEditingMealId] = useState(null);
  const [editMealForm, setEditMealForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const handleLookupFood = async (e) => {
    if (e) e.preventDefault();
    const trimmedQuery = foodQuery.trim();
    if (!trimmedQuery) return;
    setLoadingLookup(true);
    const verified = await lookupVerifiedNutrients(trimmedQuery, servingText || null);
    setLoadingLookup(false);
    if (verified) {
      setStagedFood({
        name: trimmedQuery,
        servingGrams: verified.servingGrams,
        servingInputText: verified.servingInputText || `${verified.servingGrams}g`,
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
    logStackToDaily(
      stagedFood,
      `${stagedFood.name} (${stagedFood.servingInputText || `${stagedFood.servingGrams}g`})`
    );
    // Auto-clear ingredient and serving input fields so they are blank and ready for the next entry
    setFoodQuery('');
    setServingText('');
    setStagedFood(null);
    setLastVerifiedSource('');
    if (foodInputRef.current) {
      foodInputRef.current.value = '';
      foodInputRef.current.focus();
    }
  };

  const handleStartEditMeal = (meal) => {
    setEditingMealId(meal.id);
    setEditMealForm({
      name: meal.name || '',
      calories: String(meal.calories ?? 0),
      protein: String(meal.protein ?? 0),
      carbs: String(meal.carbs ?? 0),
      fats: String(meal.fats ?? 0),
    });
  };

  const handleSaveMealEdit = (mealId) => {
    if (typeof updateMealInDaily === 'function') {
      updateMealInDaily(mealId, {
        name: editMealForm.name,
        calories: Number(editMealForm.calories) || 0,
        protein: Number(editMealForm.protein) || 0,
        carbs: Number(editMealForm.carbs) || 0,
        fats: Number(editMealForm.fats) || 0,
      });
    }
    setEditingMealId(null);
  };

  const handleRemoveMealFromDaily = (mealId) => {
    setDailyNutrition((prev) => {
      const target = (prev.meals || []).find((m) => m.id === mealId);
      if (!target) return prev;
      const nextCalories = Math.max(0, Math.round(prev.calories - (Number(target.calories) || 0)));
      const nextProtein = Math.max(0, Math.round((prev.protein - (Number(target.protein) || 0)) * 10) / 10);
      const nextCarbs = Math.max(0, Math.round((prev.carbs - (Number(target.carbs) || 0)) * 10) / 10);
      const nextFiber = Math.max(0, Math.round(((prev.fiber || 0) - (Number(target.fiber) || 0)) * 10) / 10);
      const nextNetCarbs = Math.max(0, Math.round((nextCarbs - nextFiber) * 10) / 10);
      const nextFats = Math.max(0, Math.round((prev.fats - (Number(target.fats) || 0)) * 10) / 10);

      const nextMicros = { ...(prev.micros || {}) };
      if (target.micros) {
        Object.keys(target.micros).forEach((k) => {
          nextMicros[k] = Math.max(
            0,
            Math.round(((Number(prev.micros?.[k]) || 0) - (Number(target.micros[k]) || 0)) * 10) / 10
          );
        });
      }

      const nextAminos = { ...(prev.aminos || {}) };
      if (target.aminos) {
        Object.keys(target.aminos).forEach((k) => {
          nextAminos[k] = Math.max(
            0,
            Math.round((Number(prev.aminos?.[k]) || 0) - (Number(target.aminos[k]) || 0))
          );
        });
      }

      return {
        ...prev,
        calories: nextCalories,
        protein: nextProtein,
        carbs: nextCarbs,
        fiber: nextFiber,
        netCarbs: nextNetCarbs,
        fats: nextFats,
        micros: nextMicros,
        aminos: nextAminos,
        meals: (prev.meals || []).filter((m) => m.id !== mealId),
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="relative bg-slate-950/40 border border-white/25 rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col text-white">
        {/* Persistent Visible Tile Background Image (No opaque color wash) */}
        <img
          src={TILE_BACKGROUNDS.nutrition}
          alt="Nutrition Backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/55 to-slate-950/75 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 px-4 py-3.5 bg-slate-950/65 backdrop-blur-md border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-2xl bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white drop-shadow truncate">
                Nutrition &amp; Daily Allowance Engine
              </h2>
              <p className="text-[11px] text-slate-200 truncate">
                Target: 1,850–1,950 kcal • 170–190g Protein • Facial Fat Pad Preservation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 p-4 overflow-y-auto space-y-3.5">
          {/* Ingredient Entry with Flexible Serving Text Input + Contained Enter/Lookup Button + UPC Scanner Trigger */}
          <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-emerald-400/40 p-3 space-y-2.5 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase text-emerald-300">
                Nutritional Lookup (USDA Cross-Referenced)
              </span>
              <button
                type="button"
                onClick={() => {
                  openScannerForDaily();
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs shrink-0"
              >
                <Camera className="w-3 h-3" />
                <span>Scan UPC Barcode</span>
              </button>
            </div>

            <form
              onSubmit={handleLookupFood}
              className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full"
            >
              <input
                ref={foodInputRef}
                type="text"
                value={foodQuery}
                onChange={(e) => setFoodQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLookupFood(e);
                  }
                }}
                placeholder="Food/drink (e.g. Black Coffee, Eggs, White Fish)..."
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-2 text-xs font-bold text-white"
              />
              <input
                type="text"
                value={servingText}
                onChange={(e) => setServingText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLookupFood(e);
                  }
                }}
                placeholder="e.g. 8 oz, 3/4 cup, 2 tbsp"
                className="w-28 shrink-0 rounded-xl border border-emerald-400/50 bg-slate-950/85 px-2 py-2 text-xs font-bold text-emerald-200"
              />
              <button
                type="submit"
                disabled={loadingLookup}
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1 shrink-0 max-w-full"
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {loadingLookup ? '...' : 'Enter / Lookup'}
                </span>
              </button>
            </form>

            {stagedFood && (
              <div className="rounded-xl bg-slate-950/85 border border-emerald-500/40 p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold text-emerald-300 flex items-center gap-1 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{lastVerifiedSource}</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 shrink-0">
                    {stagedFood.servingInputText} ({stagedFood.servingGrams}g/ml)
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1 text-center">
                  <div className="bg-slate-900/90 rounded-lg p-1 border border-white/10">
                    <div className="text-[8px] font-bold text-slate-400">Kcal</div>
                    <div className="text-xs font-black text-white">{stagedFood.calories}</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-1 border border-white/10">
                    <div className="text-[8px] font-bold text-slate-400">Protein</div>
                    <div className="text-xs font-black text-emerald-400">{stagedFood.protein}g</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-1 border border-white/10">
                    <div className="text-[8px] font-bold text-slate-400">Carbs</div>
                    <div className="text-xs font-black text-cyan-300">{stagedFood.carbs}g</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-1 border border-white/10">
                    <div className="text-[8px] font-bold text-slate-400">Fiber</div>
                    <div className="text-xs font-black text-violet-300">{stagedFood.fiber}g</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-1 border border-white/10">
                    <div className="text-[8px] font-bold text-slate-400">Net C</div>
                    <div className="text-xs font-black text-teal-300">{stagedFood.netCarbs}g</div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-1 border border-white/10">
                    <div className="text-[8px] font-bold text-slate-400">Fats</div>
                    <div className="text-xs font-black text-amber-300">{stagedFood.fats}g</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCommitStagedFood}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {stagedFood.name} to Daily Totals</span>
                </button>
              </div>
            )}
          </div>

          {/* Comprehensive Breakdown Chart: Macros, Micros & Detailed 9 Amino Acids vs. Daily Recommended Intake */}
          <PersistentAllowanceChart showDetailedBreakdown={true} />

          {/* Logged Daily Meals List with Inline Pencil Edit & Delete Controls */}
          {(dailyNutrition.meals || []).length > 0 && (
            <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3 space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase text-slate-200">
                Today&apos;s Logged Items ({dailyNutrition.meals.length})
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {dailyNutrition.meals.map((meal) => {
                  const isEditingThis = editingMealId === meal.id;
                  return (
                    <div
                      key={meal.id}
                      className="bg-slate-950/85 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{meal.name}</div>
                          <div className="text-[10px] text-slate-300">
                            {meal.calories} kcal • {meal.protein}g P • {meal.carbs}g C • {meal.fats}g F
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              isEditingThis ? setEditingMealId(null) : handleStartEditMeal(meal)
                            }
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 transition"
                            title="Edit logged item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMealFromDaily(meal.id)}
                            className="p-1 rounded-lg bg-white/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 shrink-0 transition"
                            title="Remove item and update daily chart"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {isEditingThis && (
                        <div className="rounded-lg bg-slate-900/90 border border-emerald-400/40 p-2 space-y-1.5">
                          <div className="grid grid-cols-5 gap-1">
                            <input
                              type="text"
                              value={editMealForm.name}
                              onChange={(e) =>
                                setEditMealForm((p) => ({ ...p, name: e.target.value }))
                              }
                              placeholder="Name"
                              className="col-span-2 rounded bg-slate-950 border border-white/15 px-1.5 py-1 text-[10px] font-bold text-white"
                            />
                            <input
                              type="number"
                              value={editMealForm.calories}
                              onChange={(e) =>
                                setEditMealForm((p) => ({ ...p, calories: e.target.value }))
                              }
                              placeholder="Kcal"
                              className="rounded bg-slate-950 border border-white/15 px-1.5 py-1 text-[10px] font-bold text-white"
                            />
                            <input
                              type="number"
                              step="0.1"
                              value={editMealForm.protein}
                              onChange={(e) =>
                                setEditMealForm((p) => ({ ...p, protein: e.target.value }))
                              }
                              placeholder="Prot"
                              className="rounded bg-slate-950 border border-white/15 px-1.5 py-1 text-[10px] font-bold text-emerald-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveMealEdit(meal.id)}
                              className="rounded bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center gap-0.5"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Visual Schedule vs. Actual Training Calendar Chart
 */
const TrainingScheduleCalendarChart = () => {
  const { dailyActivity, toggleCalendarDateStatus } = useAppContext();

  const daysMatrix = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(today.getDate()).padStart(2, '0')}`;

    const items = [];
    for (let offset = -6; offset <= 7; offset++) {
      const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(dt.getDate()).padStart(2, '0')}`;
      const dayLabel = dt.toLocaleDateString('en-US', { weekday: 'short' });
      const dateNum = dt.getDate();

      const isScheduled = Boolean(dailyActivity.scheduledDates?.[key]);
      const isCompleted = Boolean(dailyActivity.completedDates?.[key]);
      const isPast = offset < 0;
      const isToday = key === todayKey;

      let status = 'rest';
      if (isCompleted) {
        status = 'completed';
      } else if (isScheduled && isPast) {
        status = 'missed';
      } else if (isScheduled) {
        status = 'scheduled';
      }

      items.push({
        key,
        dayLabel,
        dateNum,
        status,
        isToday,
      });
    }
    return items;
  }, [dailyActivity.scheduledDates, dailyActivity.completedDates]);

  const missedCount = daysMatrix.filter((d) => d.status === 'missed').length;
  const completedCount = daysMatrix.filter((d) => d.status === 'completed').length;

  return (
    <div className="rounded-2xl bg-slate-950/65 backdrop-blur-md border border-white/20 p-3 space-y-2 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule vs. Actual Training Calendar</span>
        </span>
        <div className="flex items-center gap-2 text-[9px] font-bold">
          <span className="text-emerald-300">✓ {completedCount} Locked In</span>
          <span className="text-rose-400 font-black">● {missedCount} Missed</span>
        </div>
      </div>

      {/* 14-Day 7x2 Visual Matrix */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {daysMatrix.map((d) => {
          let cellClasses =
            'bg-black/45 border-white/10 text-slate-400 hover:border-white/30';
          let badgeText = 'Rest';

          if (d.status === 'completed') {
            cellClasses =
              'bg-emerald-500/30 border-emerald-400 text-emerald-100 font-black shadow-xs';
            badgeText = 'Done';
          } else if (d.status === 'missed') {
            cellClasses =
              'bg-rose-600/90 border-2 border-rose-300 text-white font-black shadow-[0_0_12px_rgba(244,63,94,0.65)]';
            badgeText = 'MISSED';
          } else if (d.status === 'scheduled') {
            cellClasses =
              'bg-indigo-500/30 border-indigo-400/70 text-indigo-100 font-bold';
            badgeText = 'Sched';
          }

          return (
            <button
              key={d.key}
              type="button"
              onClick={() => toggleCalendarDateStatus(d.key)}
              title={`${d.key} (${badgeText}) — Tap to toggle Scheduled / Completed`}
              className={`rounded-xl p-1 border transition flex flex-col items-center justify-center ${cellClasses} ${d.isToday ? 'ring-2 ring-cyan-300' : ''
                }`}
            >
              <span className="text-[8px] uppercase opacity-80 leading-none">
                {d.dayLabel}
              </span>
              <span className="text-xs font-black leading-tight my-0.5">
                {d.dateNum}
              </span>
              <span className="text-[7px] uppercase tracking-tighter leading-none">
                {badgeText}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-300 pt-0.5">
        <span>Tap any date to schedule or lock in completion</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Done
          </span>
          <span className="inline-flex items-center gap-1 text-rose-300 font-black">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Missed (Red)
          </span>
          <span className="inline-flex items-center gap-1 text-indigo-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> Scheduled
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Expanded Exercise Library Catalog (Including 8 kg Medicine Ball Module)
 */
const MEDICINE_BALL_8KG_MOVEMENTS = [
  {
    name: 'Overhead Medicine Ball Slams (8 kg)',
    target: 'Lats, Core & Explosive Triple Extension',
    dispMeters: 1.55,
    metFactor: 8.8,
    coachCue: 'Drive through the lats and brace your abs hard at the bottom of every slam!',
  },
  {
    name: 'Seated Russian Twists (8 kg)',
    target: 'Obliques & Rotational Core Control',
    dispMeters: 0.65,
    metFactor: 6.4,
    coachCue: 'Keep your ribs locked down and rotate from the thoracic spine—own every rep!',
  },
  {
    name: 'Medicine Ball Wall Balls (8 kg)',
    target: 'Quads, Glutes, Shoulders & Conditioning',
    dispMeters: 2.1,
    metFactor: 9.2,
    coachCue: 'Explode out of the squat pocket and transfer hip drive straight into the 8 kg press!',
  },
  {
    name: 'Rotational Woodchoppers (8 kg)',
    target: 'Transverse Abdominis, Obliques & Rear Delts',
    dispMeters: 1.35,
    metFactor: 7.5,
    coachCue: 'Pivot the back foot cleanly and decelerate the 8 kg ball with pure core tension!',
  },
  {
    name: 'Explosive Chest Passes (8 kg)',
    target: 'Pectorals, Anterior Delts & Triceps',
    dispMeters: 1.15,
    metFactor: 7.2,
    coachCue: 'Punch violently from the sternum and keep your scapulae stable!',
  },
  {
    name: 'Overhead Medicine Ball Reverse Lunges (8 kg)',
    target: 'Glutes, Hamstrings & Overhead Core Stability',
    dispMeters: 1.05,
    metFactor: 7.8,
    coachCue: 'Lock the 8 kg ball overhead—zero rib flare, drive hard through your front heel!',
  },
  {
    name: 'Standing Medicine Ball Halo Rotations (8 kg)',
    target: 'Shoulders, Upper Back & Anti-Rotation Core',
    dispMeters: 0.75,
    metFactor: 6.0,
    coachCue: 'Carve a tight orbit around your head while keeping your hips completely statuesque!',
  },
];

const RESISTANCE_BAND_MOVEMENTS = [
  'Band Lat Pulldowns (Back / V-Taper)',
  'Band Seated Rows (Mid-Back Thickness)',
  'Band Face Pulls (Rear Delts / Rotator Cuff)',
  'Band Pull-Aparts (Upper Back / Rhomboids)',
  'Band-Resisted Chest Press (Pectorals)',
  'Banded Bicep Curls (Peak Contraction)',
  'Banded Tricep Pushdowns (Lateral Head)',
  'Band Lateral Deltoid Raises (Medial Delts)',
];

const FREE_WEIGHT_MOVEMENTS = [
  'Dumbbell Hammer Curls',
  'Goblet Squats',
  'Romanian Deadlifts (RDLs)',
  'Dumbbell Overhead Press',
  'Bent-Over Dumbbell Rows',
  'Dumbbell Bench / Floor Press',
];

const CALISTHENIC_MOVEMENTS = [
  { name: 'Ab Wheel Rollouts (Kneeling / Standing)', mode: 'abwheel' },
  { name: 'Standard Planks (Timed)', mode: 'timed', met: 4.5 },
  { name: 'Side Planks (Timed)', mode: 'timed', met: 4.8 },
  { name: 'Mountain Climbers', mode: 'reps', disp: 0.45, density: 4.2 },
  { name: 'Bodyweight Box Step-Ups', mode: 'reps', disp: 0.55, density: 4.8 },
  { name: 'Push-Up Variations', mode: 'reps', disp: 0.48, density: 4.0 },
  { name: 'Hanging / Lying Knee Raises', mode: 'reps', disp: 0.50, density: 3.8 },
];

/**
 * Tile 4 Modal: Athletic Training, 8 kg Medicine Ball Module & Personal Coach Telemetry
 */
const AthleticTrainingModal = ({ onClose }) => {
  const {
    userProfile,
    dailyActivity,
    addTrainingSession,
    updateTrainingSession,
    deleteTrainingSession,
  } = useAppContext();

  const [activeSubTab, setActiveSubTab] = useState('medball'); // 'medball' | 'spin' | 'bands' | 'weights' | 'calisthenics'
  const [coachBannerMsg, setCoachBannerMsg] = useState('');

  // Inline edit state for logged training sessions (Item 5)
  const [editingTrainingId, setEditingTrainingId] = useState(null);
  const [editTrainingForm, setEditTrainingForm] = useState({
    type: '',
    summary: '',
    calories: '',
    rpe: '',
  });

  const athleteAge = Number(userProfile.age) || 53;
  const maxHr = Number(userProfile.maxHr) || 220 - athleteAge;
  const bodyWeightLbs = Number(userProfile.weightLbs) || 229;
  const bodyWeightKg = bodyWeightLbs * 0.45359237;

  // 8 kg Medicine Ball State (Item 6: sets, reps, RPE)
  const [medBallExerciseName, setMedBallExerciseName] = useState(
    MEDICINE_BALL_8KG_MOVEMENTS[0].name
  );
  const [medBallSets, setMedBallSets] = useState(4);
  const [medBallReps, setMedBallReps] = useState(12);
  const [medBallRpe, setMedBallRpe] = useState(7.5);

  const selectedMedBallObj = useMemo(
    () =>
      MEDICINE_BALL_8KG_MOVEMENTS.find((m) => m.name === medBallExerciseName) ||
      MEDICINE_BALL_8KG_MOVEMENTS[0],
    [medBallExerciseName]
  );

  const medBallCalculation = useMemo(() => {
    const ballMassKg = 8; // Fixed 8 kg Medicine Ball
    const sets = Math.max(1, Number(medBallSets) || 1);
    const reps = Math.max(1, Number(medBallReps) || 1);
    const rpe = Math.min(10, Math.max(1, Number(medBallRpe) || 7));
    const totalReps = sets * reps;
    const totalVolumeKg = totalReps * ballMassKg;
    const totalVolumeLbs = Math.round(totalVolumeKg * 2.20462);

    // Mechanical work + RPE metabolic intensity multiplier
    const rpeIntensityFactor = 0.8 + rpe * 0.045;
    const workJ = totalReps * (ballMassKg + bodyWeightKg * 0.14) * 9.80665 * selectedMedBallObj.dispMeters;
    const mechanicalKcal = (workJ / (4184 * 0.21)) * rpeIntensityFactor;
    const afterburnBonus = sets * (selectedMedBallObj.metFactor * 0.6) * (rpe / 7);
    const calories = Math.max(1, Math.round(mechanicalKcal + afterburnBonus));

    let rpeZoneLabel = 'Controlled Power (RPE 6–7)';
    if (rpe >= 9) rpeZoneLabel = 'Max CNS Output (RPE 9–10)';
    else if (rpe >= 7.5) rpeZoneLabel = 'High Metabolic Drive (RPE 7.5–8.5)';
    else if (rpe <= 5.5) rpeZoneLabel = 'Active Groove / Technique (RPE 1–5.5)';

    return {
      totalReps,
      totalVolumeKg,
      totalVolumeLbs,
      calories,
      rpe,
      rpeZoneLabel,
    };
  }, [medBallSets, medBallReps, medBallRpe, bodyWeightKg, selectedMedBallObj]);

  // 1. Spin Bike State
  const [spinMinutes, setSpinMinutes] = useState(30);
  const [pulseCount15Sec, setPulseCount15Sec] = useState('');
  const [avgBpm, setAvgBpm] = useState(112);
  const [spinRpe, setSpinRpe] = useState(7);

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

  // 2. Resistance Bands State
  const [bandMovement, setBandMovement] = useState(RESISTANCE_BAND_MOVEMENTS[0]);
  const [bandTensionLbs, setBandTensionLbs] = useState(60);
  const [bandReps, setBandReps] = useState(12);
  const [bandSets, setBandSets] = useState(4);
  const [bandRpe, setBandRpe] = useState(7.5);

  const bandCalculation = useMemo(() => {
    const tensionLbs = Math.max(0, Number(bandTensionLbs) || 0);
    const reps = Math.max(0, Number(bandReps) || 0);
    const sets = Math.max(0, Number(bandSets) || 0);
    const totalReps = reps * sets;
    const totalVolumeLbs = tensionLbs * totalReps;
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

  // 3. Free Weights State
  const [freeWeightMovement, setFreeWeightMovement] = useState(FREE_WEIGHT_MOVEMENTS[0]);
  const [freeWeightLbs, setFreeWeightLbs] = useState(45);
  const [freeWeightReps, setFreeWeightReps] = useState(10);
  const [freeWeightSets, setFreeWeightSets] = useState(4);
  const [freeWeightRpe, setFreeWeightRpe] = useState(8);

  const freeWeightCalculation = useMemo(() => {
    const loadLbs = Math.max(0, Number(freeWeightLbs) || 0);
    const reps = Math.max(0, Number(freeWeightReps) || 0);
    const sets = Math.max(0, Number(freeWeightSets) || 0);
    const totalReps = reps * sets;
    const totalVolumeLbs = loadLbs * totalReps;
    const forceNewtons = loadLbs * 4.44822;
    const strokeMeters = 0.60;
    const mechanicalKcal = (totalReps * forceNewtons * strokeMeters) / (4184 * 0.21);
    const systemicBonus = sets * 5.2;
    const calories = Math.max(1, Math.round(mechanicalKcal + systemicBonus));

    return {
      totalReps,
      totalVolumeLbs,
      calories,
    };
  }, [freeWeightLbs, freeWeightReps, freeWeightSets]);

  // 4. Calisthenics, Ab Wheel & Plyometrics State
  const [calisthenicMovement, setCalisthenicMovement] = useState(CALISTHENIC_MOVEMENTS[0].name);
  const [abWeightUnit, setAbWeightUnit] = useState('lbs');
  const [abWeightValue, setAbWeightValue] = useState(bodyWeightLbs);
  const [abReps, setAbReps] = useState(12);
  const [abSets, setAbSets] = useState(3);
  const [abStance, setAbStance] = useState('kneeling');
  const [plankSecondsPerSet, setPlankSecondsPerSet] = useState(60);
  const [calisthenicRpe, setCalisthenicRpe] = useState(7.5);

  const selectedCalisthenicObj = useMemo(
    () =>
      CALISTHENIC_MOVEMENTS.find((m) => m.name === calisthenicMovement) ||
      CALISTHENIC_MOVEMENTS[0],
    [calisthenicMovement]
  );

  const calisthenicCalculation = useMemo(() => {
    const sets = Math.max(1, Number(abSets) || 1);
    const weightKg =
      abWeightUnit === 'kg'
        ? Number(abWeightValue) || 0
        : (Number(abWeightValue) || 0) * 0.45359237;

    if (selectedCalisthenicObj.mode === 'timed') {
      const totalSec = sets * (Number(plankSecondsPerSet) || 60);
      const mins = totalSec / 60;
      const kcal = Math.max(
        1,
        Math.round(
          (((selectedCalisthenicObj.met || 4.5) * 3.5 * weightKg) / 200) * mins + sets * 2.5
        )
      );
      return {
        summaryLabel: `${sets} sets × ${plankSecondsPerSet}s hold • RPE ${calisthenicRpe}`,
        totalKcal: kcal,
        detailText: `Isometric Core / Stabilization (${weightKg.toFixed(1)} kg)`,
      };
    }

    const totalReps = Math.max(0, (Number(abReps) || 0) * sets);
    const displacementMeters =
      selectedCalisthenicObj.mode === 'abwheel'
        ? abStance === 'standing'
          ? 1.25
          : 0.85
        : selectedCalisthenicObj.disp || 0.5;

    const rawMechanicalKcal =
      totalReps * ((weightKg * 9.80665 * displacementMeters) / (4184 * 0.23));
    const setDensityKcal = sets * (selectedCalisthenicObj.density || 3.2);
    const totalKcal = Math.max(1, Math.round(rawMechanicalKcal + setDensityKcal));

    return {
      summaryLabel:
        selectedCalisthenicObj.mode === 'abwheel'
          ? `${abStance} • ${abReps} reps × ${sets} sets • RPE ${calisthenicRpe}`
          : `${abReps} reps × ${sets} sets • RPE ${calisthenicRpe}`,
      totalKcal,
      detailText: `Mass: ${weightKg.toFixed(1)} kg • Disp: ${displacementMeters} m • Work: ${rawMechanicalKcal.toFixed(2)} kcal + Density`,
    };
  }, [
    selectedCalisthenicObj,
    abWeightUnit,
    abWeightValue,
    abReps,
    abSets,
    abStance,
    plankSecondsPerSet,
    calisthenicRpe,
  ]);

  const handleLogWithCoachFeedback = (sessionPayload, customCoachMsg) => {
    addTrainingSession(sessionPayload);
    setCoachBannerMsg(
      customCoachMsg ||
      `Coach: Strong work, Dan! ${sessionPayload.type} locked into recovery telemetry.`
    );
    setTimeout(() => setCoachBannerMsg(''), 3500);
  };

  const handleStartEditTraining = (log) => {
    setEditingTrainingId(log.id);
    setEditTrainingForm({
      type: log.type || '',
      summary: log.summary || '',
      calories: String(log.calories ?? 0),
      rpe: String(log.rpe ?? 7),
    });
  };

  const handleSaveTrainingEdit = (id) => {
    if (typeof updateTrainingSession === 'function') {
      updateTrainingSession(id, {
        type: editTrainingForm.type,
        summary: editTrainingForm.summary,
        calories: Number(editTrainingForm.calories) || 0,
        rpe: Number(editTrainingForm.rpe) || 7,
      });
    }
    setEditingTrainingId(null);
  };

  const telemetry = dailyActivity.recoveryTelemetry || {
    lastRpe: 7,
    avgRpe: 7,
    readinessPct: 86,
    recoveryHours: 14,
    status: 'Prime Anabolic Window',
    coachNote:
      'Coach: Dan, your CNS readiness is primed. Hit those 8 kg medicine ball slams and V-taper pulls with crisp form!',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="relative bg-slate-950/40 border border-white/25 rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col text-white">
        {/* Persistent Visible Tile Background Image (No opaque color wash) */}
        <img
          src={TILE_BACKGROUNDS.activity}
          alt="Athletic Training Backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/55 to-slate-950/75 pointer-events-none" />

        {/* Header with Dedicated Personal Coach Persona */}
        <div className="relative z-10 px-4 py-3.5 bg-slate-950/65 backdrop-blur-md border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-2xl bg-indigo-500/25 border border-indigo-400/50 text-indigo-300 shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white drop-shadow truncate">
                Personal Coach &amp; Athletic Performance Hub
              </h2>
              <p className="text-[11px] text-slate-200 truncate">
                8 kg Medicine Ball • Spin HR • V-Taper Bands • Recovery Telemetry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 p-4 overflow-y-auto space-y-3.5">
          {/* Persistent Daily Recommended vs. Logged Intake Chart */}
          <PersistentAllowanceChart />

          {/* Personal Coach & RPE Recovery Telemetry Card */}
          <div className="rounded-2xl bg-indigo-950/75 backdrop-blur-md border border-indigo-400/40 p-3 space-y-2 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personal Coach Telemetry • {telemetry.status}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[9px] font-black">
                Readiness {telemetry.readinessPct}%
              </span>
            </div>

            <p className="text-[11px] font-semibold text-slate-100 leading-snug">
              {coachBannerMsg || telemetry.coachNote}
            </p>

            <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
              <div className="bg-slate-950/85 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] font-bold uppercase text-slate-400">Avg Session RPE</div>
                <div className="text-xs font-black text-amber-300">{telemetry.avgRpe} / 10</div>
              </div>
              <div className="bg-slate-950/85 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] font-bold uppercase text-slate-400">CNS Readiness</div>
                <div className="text-xs font-black text-emerald-300">{telemetry.readinessPct}%</div>
              </div>
              <div className="bg-slate-950/85 rounded-xl p-1.5 border border-white/10">
                <div className="text-[8px] font-bold uppercase text-slate-400">Recovery Window</div>
                <div className="text-xs font-black text-cyan-300">{telemetry.recoveryHours}h est.</div>
              </div>
            </div>
          </div>

          {/* Schedule vs. Actual Calendar Chart */}
          <TrainingScheduleCalendarChart />

          {/* 5 Modality Sub-Tabs (Featuring 8kg Medicine Ball Module) */}
          <div className="grid grid-cols-5 gap-1 bg-slate-950/70 backdrop-blur-md p-1 rounded-2xl border border-white/15">
            {[
              { id: 'medball', label: '8kg Ball' },
              { id: 'spin', label: 'Spin HR' },
              { id: 'bands', label: 'Bands' },
              { id: 'weights', label: 'Weights' },
              { id: 'calisthenics', label: 'Core/Plyo' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`py-1.5 rounded-xl text-[10px] font-black transition truncate ${activeSubTab === tab.id
                    ? 'bg-indigo-400 text-slate-950 shadow-xs'
                    : 'text-slate-200 hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* MODULE 0: 8 KG MEDICINE BALL MODULE (Sets, Reps & RPE Telemetry) */}
          {activeSubTab === 'medball' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-950/75 border border-amber-400/40 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>8 kg (17.6 lb) Medicine Ball Conditioning</span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-300">
                    Target: {selectedMedBallObj.target}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-indigo-200 uppercase mb-1">
                    Select 8 kg Medicine Ball Exercise
                  </label>
                  <select
                    value={medBallExerciseName}
                    onChange={(e) => setMedBallExerciseName(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950 px-2.5 py-2 text-xs font-bold text-white"
                  >
                    {MEDICINE_BALL_8KG_MOVEMENTS.map((mv) => (
                      <option key={mv.name} value={mv.name} className="bg-slate-950 text-white">
                        {mv.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coach Cue Callout */}
                <div className="rounded-xl bg-amber-500/15 border border-amber-400/35 px-2.5 py-1.5 text-[10px] font-bold text-amber-100">
                  <span className="text-amber-300 font-black uppercase mr-1">Coach Cue:</span>
                  {selectedMedBallObj.coachCue}
                </div>

                {/* Sets, Reps & RPE Inputs */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={medBallSets}
                      onChange={(e) => setMedBallSets(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-950 px-2.5 py-1.5 text-xs font-black text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Reps / Set
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={medBallReps}
                      onChange={(e) => setMedBallReps(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-950 px-2.5 py-1.5 text-xs font-black text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-amber-300 uppercase mb-1">
                      RPE (1–10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      value={medBallRpe}
                      onChange={(e) => setMedBallRpe(e.target.value)}
                      className="w-full rounded-xl border border-amber-400/50 bg-slate-950 px-2.5 py-1.5 text-xs font-black text-amber-300"
                    />
                  </div>
                </div>

                {/* Interactive RPE Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-slate-300">
                      Rate of Perceived Exertion: <strong className="text-amber-300">RPE {medBallCalculation.rpe}</strong>
                    </span>
                    <span className="text-indigo-300">{medBallCalculation.rpeZoneLabel}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={medBallRpe}
                    onChange={(e) => setMedBallRpe(e.target.value)}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-950/70 backdrop-blur-md border border-indigo-400/50 p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase text-indigo-300">
                    8 kg Ball Load: {medBallCalculation.totalVolumeKg} kg ({medBallCalculation.totalVolumeLbs} lbs) • RPE {medBallCalculation.rpe}
                  </div>
                  <div className="text-sm font-black text-white">
                    Expenditure: {medBallCalculation.calories} kcal{' '}
                    <span className="text-xs font-semibold text-slate-300">
                      ({medBallCalculation.totalReps} explosive reps)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleLogWithCoachFeedback(
                      {
                        type: medBallExerciseName,
                        summary: `8 kg × ${medBallSets} sets × ${medBallReps} reps • RPE ${medBallCalculation.rpe}`,
                        calories: medBallCalculation.calories,
                        sets: Number(medBallSets) || 1,
                        reps: Number(medBallReps) || 1,
                        rpe: medBallCalculation.rpe,
                      },
                      `Coach: Explosive 8 kg work, Dan! ${medBallCalculation.totalReps} reps @ RPE ${medBallCalculation.rpe} logged to recovery telemetry.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log 8kg Set</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: SPIN BIKE (HEART RATE & ZONES) */}
          {activeSubTab === 'spin' && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Min
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={spinMinutes}
                    onChange={(e) => setSpinMinutes(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-rose-300 uppercase mb-1">
                    15s Pulse
                  </label>
                  <input
                    type="number"
                    value={pulseCount15Sec}
                    onChange={(e) => handlePulse15Change(e.target.value)}
                    placeholder="28→112"
                    className="w-full rounded-xl border border-rose-400/50 bg-rose-950/50 px-2 py-1.5 text-xs font-black text-rose-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Avg BPM
                  </label>
                  <input
                    type="number"
                    value={avgBpm}
                    onChange={(e) => setAvgBpm(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-2 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-amber-300 uppercase mb-1">
                    RPE (1–10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={spinRpe}
                    onChange={(e) => setSpinRpe(e.target.value)}
                    className="w-full rounded-xl border border-amber-400/50 bg-slate-950/80 px-2 py-1.5 text-xs font-black text-amber-300"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-slate-950/65 backdrop-blur-md p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-200">
                  <span>
                    Coach HR Pacing (Age {athleteAge} • Max {maxHr} BPM)
                  </span>
                  <span className="text-emerald-300">★ Zone 2 Fat Burn Target</span>
                </div>
                <div className="space-y-1">
                  {hrZones.map((z) => {
                    const isCurrent = activeSpinZone?.zone === z.zone;
                    return (
                      <div
                        key={z.zone}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] border transition ${z.isFatBurn
                            ? isCurrent
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-xs'
                              : 'bg-emerald-950/60 text-emerald-200 border-emerald-500/40 font-extrabold'
                            : isCurrent
                              ? 'bg-indigo-500 text-slate-950 border-indigo-300 font-black'
                              : 'bg-slate-950/75 text-slate-200 border-white/10 font-semibold'
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

              <div className="rounded-2xl bg-indigo-950/70 backdrop-blur-md border border-indigo-400/50 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-indigo-300">
                    Active Zone: {activeSpinZone?.zone} • RPE {spinRpe}
                  </div>
                  <div className="text-sm font-black text-white">
                    Estimated Burn: {spinCalories} kcal{' '}
                    <span className="text-xs font-semibold text-slate-300">
                      ({spinMinutes} min @ {avgBpm} BPM)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleLogWithCoachFeedback(
                      {
                        type: 'Spin Bike',
                        summary: `${spinMinutes} min • ${avgBpm} BPM (${activeSpinZone?.zone.split(' (')[0]}) • RPE ${spinRpe}`,
                        calories: spinCalories,
                        durationMinutes: Number(spinMinutes) || 0,
                        rpe: Number(spinRpe) || 7,
                      },
                      `Coach: Steady aerobic work locked in, Dan! ${spinMinutes} mins in ${activeSpinZone?.zone.split(' (')[0]} protects lean mass while torching visceral fat.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-400 hover:bg-indigo-300 text-slate-950 text-xs font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Spin</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPANDED RESISTANCE BAND MOVEMENTS */}
          {activeSubTab === 'bands' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold text-indigo-200 uppercase mb-1">
                  Coach V-Taper &amp; Hypertrophy Band Selection
                </label>
                <select
                  value={bandMovement}
                  onChange={(e) => setBandMovement(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-2 text-xs font-bold text-white"
                >
                  {RESISTANCE_BAND_MOVEMENTS.map((mv) => (
                    <option key={mv} value={mv} className="bg-slate-950 text-white">
                      {mv}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Band (lbs)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={bandTensionLbs}
                    onChange={(e) => setBandTensionLbs(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bandReps}
                    onChange={(e) => setBandReps(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bandSets}
                    onChange={(e) => setBandSets(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-amber-300 uppercase mb-1">
                    RPE (1–10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={bandRpe}
                    onChange={(e) => setBandRpe(e.target.value)}
                    className="w-full rounded-xl border border-amber-400/50 bg-slate-950/85 px-2 py-1.5 text-xs font-black text-amber-300"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-950/70 backdrop-blur-md border border-indigo-400/50 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-indigo-300">
                    Volume Load: {bandCalculation.totalVolumeLbs.toLocaleString()} lbs • RPE {bandRpe}
                  </div>
                  <div className="text-sm font-black text-white">
                    Expenditure: {bandCalculation.calories} kcal{' '}
                    <span className="text-xs font-semibold text-slate-300">
                      ({bandCalculation.totalReps} total reps)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleLogWithCoachFeedback(
                      {
                        type: `Bands: ${bandMovement.split(' (')[0]}`,
                        summary: `${bandTensionLbs} lbs × ${bandReps} reps × ${bandSets} sets • RPE ${bandRpe}`,
                        calories: bandCalculation.calories,
                        sets: Number(bandSets) || 1,
                        reps: Number(bandReps) || 1,
                        rpe: Number(bandRpe) || 7.5,
                      },
                      `Coach: Quality peak contraction on ${bandMovement.split(' (')[0]}! ${bandCalculation.totalVolumeLbs.toLocaleString()} lbs volume logged.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-400 hover:bg-indigo-300 text-slate-950 text-xs font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Bands</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FREE WEIGHT MOVEMENTS */}
          {activeSubTab === 'weights' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold text-indigo-200 uppercase mb-1">
                  Free Weight Exercise Selection
                </label>
                <select
                  value={freeWeightMovement}
                  onChange={(e) => setFreeWeightMovement(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-2 text-xs font-bold text-white"
                >
                  {FREE_WEIGHT_MOVEMENTS.map((mv) => (
                    <option key={mv} value={mv} className="bg-slate-950 text-white">
                      {mv}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Load (lbs)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="2.5"
                    value={freeWeightLbs}
                    onChange={(e) => setFreeWeightLbs(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={freeWeightReps}
                    onChange={(e) => setFreeWeightReps(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={freeWeightSets}
                    onChange={(e) => setFreeWeightSets(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-amber-300 uppercase mb-1">
                    RPE (1–10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={freeWeightRpe}
                    onChange={(e) => setFreeWeightRpe(e.target.value)}
                    className="w-full rounded-xl border border-amber-400/50 bg-slate-950/85 px-2 py-1.5 text-xs font-black text-amber-300"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-950/70 backdrop-blur-md border border-indigo-400/50 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-indigo-300">
                    Total Volume: {freeWeightCalculation.totalVolumeLbs.toLocaleString()} lbs • RPE {freeWeightRpe}
                  </div>
                  <div className="text-sm font-black text-white">
                    Expenditure: {freeWeightCalculation.calories} kcal{' '}
                    <span className="text-xs font-semibold text-slate-300">
                      ({freeWeightCalculation.totalReps} total reps)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleLogWithCoachFeedback(
                      {
                        type: freeWeightMovement,
                        summary: `${freeWeightLbs} lbs × ${freeWeightReps} reps × ${freeWeightSets} sets • RPE ${freeWeightRpe}`,
                        calories: freeWeightCalculation.calories,
                        sets: Number(freeWeightSets) || 1,
                        reps: Number(freeWeightReps) || 1,
                        rpe: Number(freeWeightRpe) || 8,
                      },
                      `Coach: Heavy iron logged! ${freeWeightMovement} at RPE ${freeWeightRpe} signals strong lean-tissue retention.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-400 hover:bg-indigo-300 text-slate-950 text-xs font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Weights</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CALISTHENICS, AB WHEEL & PLYOMETRICS */}
          {activeSubTab === 'calisthenics' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold text-indigo-200 uppercase mb-1">
                  Calisthenics, Core &amp; Ab Wheel Movement
                </label>
                <select
                  value={calisthenicMovement}
                  onChange={(e) => setCalisthenicMovement(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-2 text-xs font-bold text-white"
                >
                  {CALISTHENIC_MOVEMENTS.map((mv) => (
                    <option key={mv.name} value={mv.name} className="bg-slate-950 text-white">
                      {mv.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Body Weight
                  </label>
                  <div className="flex rounded-xl border border-white/20 bg-slate-950/85 overflow-hidden">
                    <input
                      type="number"
                      value={abWeightValue}
                      onChange={(e) => setAbWeightValue(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-black text-white bg-transparent"
                    />
                    <select
                      value={abWeightUnit}
                      onChange={(e) => setAbWeightUnit(e.target.value)}
                      className="bg-slate-900 px-2 text-[10px] font-extrabold text-indigo-300 border-l border-white/20"
                    >
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                </div>

                {selectedCalisthenicObj.mode === 'abwheel' ? (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Rollout Stance
                    </label>
                    <select
                      value={abStance}
                      onChange={(e) => setAbStance(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-1.5 text-xs font-bold text-white"
                    >
                      <option value="kneeling" className="bg-slate-950">
                        Kneeling Rollout (0.85m)
                      </option>
                      <option value="standing" className="bg-slate-950">
                        Standing Rollout (1.25m)
                      </option>
                    </select>
                  </div>
                ) : selectedCalisthenicObj.mode === 'timed' ? (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Hold Duration (Sec)
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={plankSecondsPerSet}
                      onChange={(e) => setPlankSecondsPerSet(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-1.5 text-xs font-black text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Reps per Set
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={abReps}
                      onChange={(e) => setAbReps(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-1.5 text-xs font-black text-white"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {selectedCalisthenicObj.mode === 'abwheel' && (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                      Reps / Set
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={abReps}
                      onChange={(e) => setAbReps(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-1.5 text-xs font-black text-white"
                    />
                  </div>
                )}
                <div className={selectedCalisthenicObj.mode === 'abwheel' ? '' : 'col-span-2'}>
                  <label className="block text-[10px] font-extrabold text-slate-200 uppercase mb-1">
                    Total Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={abSets}
                    onChange={(e) => setAbSets(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-2.5 py-1.5 text-xs font-black text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-amber-300 uppercase mb-1">
                    RPE (1–10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={calisthenicRpe}
                    onChange={(e) => setCalisthenicRpe(e.target.value)}
                    className="w-full rounded-xl border border-amber-400/50 bg-slate-950/85 px-2.5 py-1.5 text-xs font-black text-amber-300"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-950/70 backdrop-blur-md border border-indigo-400/50 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-indigo-300">
                    {calisthenicCalculation.summaryLabel}
                  </div>
                  <div className="text-sm font-black text-white">
                    Expenditure: {calisthenicCalculation.totalKcal} kcal
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleLogWithCoachFeedback(
                      {
                        type: calisthenicMovement.split(' (')[0],
                        summary: calisthenicCalculation.summaryLabel,
                        calories: calisthenicCalculation.totalKcal,
                        sets: Number(abSets) || 1,
                        reps: Number(abReps) || 1,
                        rpe: Number(calisthenicRpe) || 7.5,
                      },
                      `Coach: Core stability locked in! ${calisthenicMovement.split(' (')[0]} reinforces your spine for heavy pulls.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-400 hover:bg-indigo-300 text-slate-950 text-xs font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Set</span>
                </button>
              </div>
            </div>
          )}

          {/* Logged Athletic Training Sessions Today with Inline Pencil Edit & Delete Controls */}
          <div className="rounded-2xl border border-white/20 p-3 bg-slate-950/65 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-200">
              <span>Today&apos;s Logged Training ({dailyActivity.trainingLogs?.length || 0})</span>
              <span className="text-indigo-300">
                Total Burned: {dailyActivity.caloriesBurned} kcal
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {(dailyActivity.trainingLogs || []).map((log) => {
                const isEditingThis = editingTrainingId === log.id;
                return (
                  <div
                    key={log.id}
                    className="bg-slate-950/85 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-black text-white truncate">{log.type}</div>
                        <div className="text-[10px] text-slate-300 truncate">{log.summary}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono font-black text-indigo-300">
                          {log.calories} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            isEditingThis
                              ? setEditingTrainingId(null)
                              : handleStartEditTraining(log)
                          }
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-300 transition"
                          title="Edit training log"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTrainingSession(log.id)}
                          className="p-1 rounded-lg bg-white/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                          title="Delete training log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isEditingThis && (
                      <div className="rounded-lg bg-slate-900/90 border border-indigo-400/40 p-2 space-y-1.5">
                        <div className="grid grid-cols-4 gap-1">
                          <input
                            type="text"
                            value={editTrainingForm.type}
                            onChange={(e) =>
                              setEditTrainingForm((p) => ({ ...p, type: e.target.value }))
                            }
                            placeholder="Exercise"
                            className="col-span-2 rounded bg-slate-950 border border-white/15 px-1.5 py-1 text-[10px] font-bold text-white"
                          />
                          <input
                            type="number"
                            value={editTrainingForm.calories}
                            onChange={(e) =>
                              setEditTrainingForm((p) => ({ ...p, calories: e.target.value }))
                            }
                            placeholder="Kcal"
                            className="rounded bg-slate-950 border border-white/15 px-1.5 py-1 text-[10px] font-bold text-indigo-300"
                          />
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="10"
                            value={editTrainingForm.rpe}
                            onChange={(e) =>
                              setEditTrainingForm((p) => ({ ...p, rpe: e.target.value }))
                            }
                            placeholder="RPE"
                            className="rounded bg-slate-950 border border-white/15 px-1.5 py-1 text-[10px] font-bold text-amber-300"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editTrainingForm.summary}
                            onChange={(e) =>
                              setEditTrainingForm((p) => ({ ...p, summary: e.target.value }))
                            }
                            placeholder="Summary"
                            className="flex-1 rounded bg-slate-950 border border-white/15 px-1.5 py-1 text-[10px] font-bold text-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTrainingEdit(log.id)}
                            className="px-2.5 py-1 rounded bg-indigo-400 text-slate-950 text-[10px] font-black flex items-center gap-0.5"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
    openScannerForDaily,
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
    site: 'Belly button area - lower left',
  };

  const calPct = Math.min(
    100,
    Math.round((dailyNutrition.calories / Math.max(1, dailyNutrition.targetCalories)) * 100)
  );
  const fiberPct = Math.min(
    100,
    Math.round(((dailyNutrition.fiber || 0) / Math.max(1, dailyNutrition.targetFiber || 32)) * 100)
  );

  const readinessPct = dailyActivity.recoveryTelemetry?.readinessPct ?? 86;

  // 4 Core Dashboard Tiles
  const tiles = [
    {
      id: 'stacks',
      title: 'Get Stacked',
      subtitle: 'Morning • Afternoon • Evening + UPC Scan',
      primaryStat: `${savedStacks.length} Stacks`,
      secondaryStat: '750ml + Organika + Creatine + Collagen',
      bgImage: TILE_BACKGROUNDS.stacks,
      icon: Layers,
      accent: 'from-amber-500/85 to-slate-950/95',
      chart: (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-end gap-1 h-8">
            <div className="w-2 bg-sky-300 rounded-t h-8" title="Morning Stacks" />
            <div className="w-2 bg-amber-300 rounded-t h-6" title="Afternoon Stacks" />
            <div className="w-2 bg-emerald-300 rounded-t h-5" title="Evening Stacks" />
          </div>
          <span className="text-[9px] font-black text-amber-200 uppercase">Get Stacked</span>
        </div>
      ),
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      subtitle: `${dailyNutrition.protein}g / ${dailyNutrition.targetProtein}g PRO • ${dailyNutrition.netCarbs || 0}g Net C`,
      primaryStat: `${dailyNutrition.calories} kcal`,
      secondaryStat: `Max: ${dailyNutrition.targetCalories} kcal • Fiber: ${dailyNutrition.fiber || 0}g`,
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
                openScannerForDaily();
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
      secondaryStat: `Site: ${latestPeptide.site || 'Belly button area - lower left'}`,
      bgImage: TILE_BACKGROUNDS.peptides,
      icon: Syringe,
      accent: 'from-violet-600/80 to-slate-950/95',
      chart: <MiniSyringeChart units={latestPeptide.syringeUnits} />,
    },
    {
      id: 'activity',
      title: 'Athletic Training',
      subtitle: '8kg Med Ball • Spin • V-Taper Bands',
      primaryStat: `${dailyActivity.caloriesBurned} kcal`,
      secondaryStat: `Coach Readiness: ${readinessPct}% • ${dailyActivity.trainingLogs?.length || 0} Sessions`,
      bgImage: TILE_BACKGROUNDS.activity,
      icon: Dumbbell,
      accent: 'from-indigo-600/80 to-slate-950/95',
      chart: (
        <div className="flex flex-col items-end gap-1">
          <div className="px-2 py-1 rounded-lg bg-amber-500/25 border border-amber-400/40 text-amber-200 text-[9px] font-black flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>8kg Ball</span>
          </div>
          <span className="text-[9px] font-bold text-indigo-200">RPE Coach</span>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-white flex flex-col overflow-hidden select-none">
      {/* Persistent Top Header */}
      <Header onOpenProfile={() => setActiveTileModal('profile')} />

      {/* Main 2x2 Tile Grid */}
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
                className={`absolute inset-0 bg-gradient-to-t ${tile.accent} via-slate-950/55 to-slate-950/25`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 overflow-y-auto">
          <div className="relative bg-slate-950/40 border border-white/25 rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col text-white">
            {/* Persistent Visible Tile Background Image (No opaque color wash) */}
            <img
              src={TILE_BACKGROUNDS.peptides}
              alt="Peptides Backdrop"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-90 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/55 to-slate-950/75 pointer-events-none" />

            <div className="relative z-10 px-4 py-3.5 bg-slate-950/65 backdrop-blur-md border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-2xl bg-violet-500/25 border border-violet-400/50 text-violet-300 shrink-0">
                  <Syringe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-white drop-shadow truncate">
                    Peptide Protocol &amp; Dose Calculator
                  </h2>
                  <p className="text-[11px] text-slate-200 truncate">
                    Scannable Protocol Cards • Syringe Draw • NHL Guard
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTileModal(null)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative z-10 p-4 overflow-y-auto">
              <PeptideCalculator isOpen={true} />
            </div>
          </div>
        </div>
      )}

      {activeTileModal === 'activity' && (
        <AthleticTrainingModal onClose={() => setActiveTileModal(null)} />
      )}

      {/* Profile Settings, Daily Limits & Improvement Prompt Modal */}
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
